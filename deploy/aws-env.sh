#!/usr/bin/env bash
# Pins every AWS call in this repo to the Yunto profile.
#
#   source deploy/aws-env.sh
#
# Other projects on this machine keep using the [default] profile. This guard
# hard-fails if the resolved identity is the TYCHR account, so Yunto resources
# can never be created there by accident.

export AWS_PROFILE="${YUNTO_AWS_PROFILE:-yunto}"

# Account that must NOT own Yunto resources (TYCHR's deploy account).
FORBIDDEN_ACCOUNT="977237815409"

if ! ident=$(aws sts get-caller-identity --output json 2>&1); then
  echo "✗ AWS profile '$AWS_PROFILE' is not configured or its keys are invalid." >&2
  echo "  Run:  aws configure --profile $AWS_PROFILE" >&2
  return 1 2>/dev/null || exit 1
fi

account=$(printf '%s' "$ident" | python3 -c 'import json,sys; print(json.load(sys.stdin)["Account"])')
arn=$(printf '%s' "$ident" | python3 -c 'import json,sys; print(json.load(sys.stdin)["Arn"])')

if [ "$account" = "$FORBIDDEN_ACCOUNT" ]; then
  echo "✗ REFUSING TO CONTINUE — profile '$AWS_PROFILE' resolves to the TYCHR account ($account)." >&2
  echo "  Yunto must deploy to its own account. Reconfigure:  aws configure --profile $AWS_PROFILE" >&2
  return 1 2>/dev/null || exit 1
fi

# Pin the account on first successful use, then require it to stay stable.
PIN_FILE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)/.aws-account"
if [ -f "$PIN_FILE" ]; then
  pinned=$(cat "$PIN_FILE")
  if [ "$pinned" != "$account" ]; then
    echo "✗ Account mismatch: expected $pinned (pinned), got $account." >&2
    echo "  If this change is intentional, delete $PIN_FILE and re-run." >&2
    return 1 2>/dev/null || exit 1
  fi
else
  printf '%s' "$account" > "$PIN_FILE"
  echo "→ pinned Yunto to AWS account $account"
fi

export AWS_REGION="${AWS_REGION:-$(aws configure get region 2>/dev/null || echo ap-south-1)}"
echo "✓ AWS profile=$AWS_PROFILE account=$account region=$AWS_REGION"
echo "  identity: $arn"
