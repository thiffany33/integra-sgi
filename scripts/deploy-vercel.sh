#!/usr/bin/env bash
set -euo pipefail
cli="$RUNNER_TEMP/vercel-cli/node_modules/.bin/vercel"
flags=()
if [[ "$DEPLOY_BRANCH" == main ]]; then flags+=(--prod); fi
for project in api web; do
  cd "$GITHUB_WORKSPACE/$project-source"
  if [[ "$project" == api ]]; then
    export VERCEL_PROJECT_ID="$API_PROJECT_ID"
    domain="$API_DOMAIN"
    export HEALTH_BYPASS_SECRET="${API_BYPASS_SECRET:-}"
    health_path=/api/v1/health
  else
    export VERCEL_PROJECT_ID="$WEB_PROJECT_ID"
    domain="$WEB_DOMAIN"
    export HEALTH_BYPASS_SECRET="${WEB_BYPASS_SECRET:-}"
    health_path=/
  fi
  # Stage production without moving its domains until health checks pass.
  url=$("$cli" deploy --prebuilt --yes --skip-domain "${flags[@]}" \
    --meta "githubCommitSha=$DEPLOY_SHA" --meta "githubCommitRef=$DEPLOY_BRANCH" \
    --token="$VERCEL_TOKEN")
  [[ "$url" =~ ^https://[a-zA-Z0-9.-]+$ ]]
  printf '\n%s deployment: %s\n' "$project" "$url" >> "$GITHUB_STEP_SUMMARY"
  node scripts/check-deployment-health.mjs "$url$health_path" "$project"
  if [[ "$DEPLOY_BRANCH" == main ]]; then
    "$cli" promote "$url" --yes --token="$VERCEL_TOKEN"
  else
    "$cli" alias set "$url" "$domain" --token="$VERCEL_TOKEN"
  fi
  node scripts/check-deployment-health.mjs "https://$domain$health_path" "$project"
  if [[ "$project" == web ]]; then
    node scripts/check-deployment-health.mjs "https://$domain/api/v1/health" api
  fi
done
