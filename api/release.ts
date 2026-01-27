import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

// Load environment variables
const GKE_CLUSTER = process.env.GKE_CLUSTER;
const GKE_REGION = process.env.GKE_REGION;
const GKE_PROJECT = process.env.GKE_PROJECT;
const K8S_SECRET_NAME = process.env.K8S_SECRET_NAME;
const ENV_FILE_PATH = process.env.ENV_FILE_PATH || ".env.production";

// Validate required environment variables
const requiredEnvVars = {
  GKE_CLUSTER,
  GKE_REGION,
  GKE_PROJECT,
  K8S_SECRET_NAME,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((v) => console.error(`   - ${v}`));
  console.error("\nPlease set them in your environment or .env file");
  exit(1);
}

const args = Bun.argv.slice(2);
const type = args[0];

if (!type || !["patch", "minor", "major"].includes(type)) {
  console.log("Usage: bun run release.ts <patch|minor|major>");
  exit(1);
}

function bumpVersion(type: "patch" | "minor" | "major"): string {
  const path = "version.json";
  const data = JSON.parse(readFileSync(path, "utf8"));
  const [major, minor, patch] = data.version.split(".").map(Number);

  let newVersion: string;
  switch (type) {
    case "major":
      newVersion = `${major + 1}.0.0`;
      break;
    case "minor":
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case "patch":
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  data.version = newVersion;
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  return newVersion;
}

function syncSecrets() {
  console.log("🔐 Syncing secrets to Kubernetes...");
  try {
    console.log("Authenticating with GKE...");
    execSync(
      `gcloud container clusters get-credentials ${GKE_CLUSTER} --region ${GKE_REGION} --project ${GKE_PROJECT}`,
      { stdio: "inherit" }
    );

    execSync(
      `kubectl create secret generic ${K8S_SECRET_NAME} --from-env-file=${ENV_FILE_PATH} --dry-run=client -o yaml | kubectl apply -f -`,
      { stdio: "inherit" }
    );

    console.log("✅ Secrets synced");
  } catch (error: any) {
    console.error("❌ Failed to sync secrets");
    console.error(error.message);
    exit(1);
  }
}

function commitAndPush(version: string) {
  console.log(`📦 Committing version ${version}...`);
  execSync(`git add version.json && git commit -m "v${version}"`, {
    stdio: "inherit",
  });
  execSync(`git push`, { stdio: "inherit" });
}

function createRelease(version: string) {
  console.log(`🚀 Creating release v${version}...`);
  execSync(`gh release create v${version} -t "v${version}" -n "v${version}"`, {
    stdio: "inherit",
  });
}

// Run
syncSecrets();
const version = bumpVersion(type as "patch" | "minor" | "major");
console.log(`📌 New version: ${version}`);
commitAndPush(version);
createRelease(version);
console.log("\n✅ Release complete!");

