#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Resolve project ID (env → gcloud → arg)
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project -q || true)}"
if [[ -z "${PROJECT_ID}" ]]; then
  PROJECT_ID="${1:-}"
fi
: "${PROJECT_ID:?Provide PROJECT_ID via env, gcloud config, or argument}"

# Resolve this script's directory, even if run from elsewhere
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default env file path relative to this script
ENV_FILE="${ENV_FILE:-${SCRIPT_DIR}/../.env.production}"
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE"; exit 1; }

echo "Using project: $PROJECT_ID"
echo "Reading secrets from: $ENV_FILE"

while IFS= read -r line; do
  # Trim CR and whitespace
  line="${line%$'\r'}"
  [[ -z "${line// }" || "$line" =~ ^[[:space:]]*# ]] && continue

  # Split only on the first '=' so values can contain '='
  key="${line%%=*}"
  value="${line#*=}"

  # Trim surrounding spaces from key
  key="$(echo -n "$key" | xargs)"
  [[ -z "$key" ]] && continue

  # Strip surrounding quotes from value if present
  if [[ "$value" =~ ^\".*\"$ ]]; then
    value="${value:1:-1}"
  elif [[ "$value" =~ ^\'.*\'$ ]]; then
    value="${value:1:-1}"
  fi

  echo "→ ensuring secret: $key"
  if gcloud secrets describe "$key" --project="$PROJECT_ID" >/dev/null 2>&1; then
    printf %s "$value" | gcloud secrets versions add "$key" \
      --project="$PROJECT_ID" --data-file=-
  else
    printf %s "$value" | gcloud secrets create "$key" \
      --project="$PROJECT_ID" --data-file=-
  fi
done < "$ENV_FILE"

echo "✓ Done"