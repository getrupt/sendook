import crypto from "crypto";

export async function generateRandomSecureToken() {
  return await crypto.randomBytes(48).toString("hex");
}

export async function hash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

export async function verifyHash(password: string, hash: string) {
  return await new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    if (!salt || !key) {
      return reject(new Error("Invalid hash format"));
    }
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString("hex"));
    });
  });
}
