#!/usr/bin/env bash
# Deploy manual do dist/ para AWS Amplify (sem deploy key do GitHub).
#
# Uso:
#   AWS_PROFILE=btbw AMPLIFY_APP_ID=d2mj5fbotgc8x1 ./deploy/amplify-manual-deploy.sh
#   ./deploy/amplify-manual-deploy.sh   # usa AMPLIFY_APP_ID do ambiente ou deploy/amplify-app-id.txt
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REGION="${AWS_REGION:-us-east-1}"
BRANCH="${AMPLIFY_BRANCH:-main}"
APP_ID="${AMPLIFY_APP_ID:-}"
if [[ -z "$APP_ID" && -f "$ROOT/deploy/amplify-app-id.txt" ]]; then
  APP_ID="$(tr -d '[:space:]' < "$ROOT/deploy/amplify-app-id.txt")"
fi
if [[ -z "$APP_ID" ]]; then
  echo "Defina AMPLIFY_APP_ID ou crie deploy/amplify-app-id.txt" >&2
  exit 1
fi

echo "Build…"
npm ci || npm install
npm run build

echo "Empacotando dist/…"
TMP_DIR="$(mktemp -d /tmp/xbot-moba-XXXXXX)"
TMP_ZIP="${TMP_DIR}/dist.zip"
(
  cd dist
  zip -r -q "$TMP_ZIP" .
)

echo "create-deployment…"
CREATE="$(aws amplify create-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --region "$REGION" \
  --output json)"
JOB_ID="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["jobId"])' <<<"$CREATE")"
UPLOAD_URL="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["zipUploadUrl"])' <<<"$CREATE")"

echo "Upload job=${JOB_ID}…"
HTTP_CODE="$(curl -sS -o /tmp/amplify-upload.out -w "%{http_code}" \
  -H "Content-Type: application/zip" \
  --upload-file "$TMP_ZIP" \
  "$UPLOAD_URL")"
echo "upload HTTP ${HTTP_CODE}"
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Upload falhou HTTP ${HTTP_CODE}" >&2
  cat /tmp/amplify-upload.out >&2 || true
  exit 1
fi

echo "start-deployment…"
aws amplify start-deployment \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --job-id "$JOB_ID" \
  --region "$REGION" \
  --output json | python3 -c 'import sys,json; j=json.load(sys.stdin)["jobSummary"]; print(j["status"], j["jobId"])'

rm -rf "$TMP_DIR"
echo "OK — https://moba.xbotone.com  |  https://${APP_ID}.amplifyapp.com"
