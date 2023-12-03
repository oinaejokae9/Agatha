#!/usr/bin/env bash
set -euo pipefail
# usage: ./scripts/dev_commit.sh "feat: message" "2024-01-02T10:00:00" "Name" "email@example.com"
msg="$1"; dt="$2"; name="$3"; email="$4"
GIT_AUTHOR_DATE="$dt" GIT_COMMITTER_DATE="$dt" git -c user.name="$name" -c user.email="$email" add -A
GIT_AUTHOR_DATE="$dt" GIT_COMMITTER_DATE="$dt" git -c user.name="$name" -c user.email="$email" commit -m "$msg"
