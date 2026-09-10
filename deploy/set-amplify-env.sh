#!/usr/bin/env bash
# Configura env vars de build do Amplify para xbot-moba e dispara RELEASE.
#
# Uso:
#   ./deploy/set-amplify-env.sh <app-id> [branch]
#   AWS_PROFILE=btbw ./deploy/set-amplify-env.sh dXXXX main
set -euo pipefail

APP_ID="${1:-}"
BRANCH="${2:-main}"
REGION="${AWS_REGION:-us-east-1}"
API_BASE="${VITE_API_BASE_URL:-https://api.xbotone.com}"

if [[ -z "$APP_ID" ]]; then
  echo "Uso: $0 <amplify-app-id> [branch]"
  aws amplify list-apps --region "$REGION" --query 'apps[].[appId,name,repository]' --output table
  exit 1
fi

EXISTING="$(aws amplify get-branch --app-id "$APP_ID" --branch-name "$BRANCH" --region "$REGION" \
  --query 'branch.environmentVariables' --output json 2>/dev/null || echo '{}')"
APP_ENV="$(aws amplify get-app --app-id "$APP_ID" --region "$REGION" \
  --query 'app.environmentVariables' --output json 2>/dev/null || echo '{}')"

MERGED="$(
  API_BASE="$API_BASE" EXISTING="$EXISTING" APP_ENV="$APP_ENV" python3 - <<'PY'
import json, os
existing = json.loads(os.environ.get("EXISTING") or "{}") or {}
app_env = json.loads(os.environ.get("APP_ENV") or "{}") or {}
merged = {**app_env, **existing}
merged["VITE_API_BASE_URL"] = os.environ["API_BASE"]
print(json.dumps(merged))
PY
)"

echo "App: $APP_ID  Branch: $BRANCH  Region: $REGION"
echo "$MERGED" | python3 -m json.tool

aws amplify update-app \
  --app-id "$APP_ID" \
  --region "$REGION" \
  --environment-variables "$MERGED" >/dev/null

aws amplify update-branch \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --region "$REGION" \
  --environment-variables "$MERGED" >/dev/null

echo "Disparando RELEASE…"
aws amplify start-job \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --job-type RELEASE \
  --region "$REGION"

echo "OK."
