#!/usr/bin/env bash
set -euo pipefail
REPO_OWNER="oinaejokae9"
REPO_NAME="Agatha"
CSV="github_accounts.csv"
OWNER_TOKEN=$(awk -F, -v owner="$REPO_OWNER" 'BEGIN{OFS=","} $1==owner{print $5}' "$CSV")
if [ -z "$OWNER_TOKEN" ]; then echo "Owner token not found" >&2; exit 1; fi
while IFS=, read -r username _p _otp email token; do
  [ "$username" = "username" ] && continue
  [ -z "$username" ] && continue
  if [ "$username" = "$REPO_OWNER" ]; then continue; fi
  echo "Inviting $username..."
  curl -sS -X PUT -H "Authorization: token $OWNER_TOKEN" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/collaborators/$username" | sed -E 's/\{".*"\}//' || true
  sleep 0.5
done < "$CSV"
echo "Done."
