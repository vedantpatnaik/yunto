#!/usr/bin/env bash
# Provisions the Yunto demo box: key pair, security group, EC2 instance.
# Idempotent — re-running reuses anything that already exists.
#
#   source deploy/aws-env.sh && ./deploy/provision.sh
set -euo pipefail

NAME="yunto-demo"
TYPE="${INSTANCE_TYPE:-t3.small}"
HERE="$(cd "$(dirname "$0")" && pwd)"
KEY_PATH="$HERE/${NAME}.pem"

: "${AWS_PROFILE:?source deploy/aws-env.sh first}"
export AWS_PAGER=""

echo "▸ region: $(aws configure get region)"

# --- Amazon Linux 2023 AMI (resolved from SSM so it is never stale) ---------
AMI=$(aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query 'Parameters[0].Value' --output text)
echo "▸ ami: $AMI"

# --- key pair ---------------------------------------------------------------
if aws ec2 describe-key-pairs --key-names "$NAME" >/dev/null 2>&1; then
  echo "▸ key pair '$NAME' already exists"
  [ -f "$KEY_PATH" ] || { echo "✗ $KEY_PATH missing locally and the key cannot be re-downloaded."; echo "  Delete the key pair in EC2 and re-run to regenerate."; exit 1; }
else
  aws ec2 create-key-pair --key-name "$NAME" \
    --query 'KeyMaterial' --output text > "$KEY_PATH"
  chmod 400 "$KEY_PATH"
  echo "▸ key pair created → $KEY_PATH"
fi

# --- security group ---------------------------------------------------------
VPC=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query 'Vpcs[0].VpcId' --output text)

if ! SG=$(aws ec2 describe-security-groups --filters Name=group-name,Values="$NAME" \
    Name=vpc-id,Values="$VPC" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null) \
    || [ "$SG" = "None" ]; then
  SG=$(aws ec2 create-security-group --group-name "$NAME" \
    --description "Yunto demo: ssh + http" --vpc-id "$VPC" \
    --query 'GroupId' --output text)
  # SSH is world-open for convenience; lock to your IP for anything long-lived.
  aws ec2 authorize-security-group-ingress --group-id "$SG" \
    --ip-permissions \
      'IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=0.0.0.0/0,Description="ssh"}]' \
      'IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0,Description="http"}]' \
    >/dev/null
  echo "▸ security group created: $SG"
else
  echo "▸ security group exists: $SG"
fi

# --- instance ---------------------------------------------------------------
IID=$(aws ec2 describe-instances \
  --filters Name=tag:Name,Values="$NAME" Name=instance-state-name,Values=pending,running \
  --query 'Reservations[0].Instances[0].InstanceId' --output text 2>/dev/null || echo "None")

if [ "$IID" = "None" ] || [ -z "$IID" ]; then
  IID=$(aws ec2 run-instances \
    --image-id "$AMI" --instance-type "$TYPE" \
    --key-name "$NAME" --security-group-ids "$SG" \
    --block-device-mappings 'DeviceName=/dev/xvda,Ebs={VolumeSize=20,VolumeType=gp3}' \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$NAME},{Key=Project,Value=yunto}]" \
    --user-data '#!/bin/bash
dnf update -y
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user
mkdir -p /usr/local/lib/docker/cli-plugins
curl -sSL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
# Compose v2 delegates image builds to buildx; without it `compose build` fails.
curl -sSL https://github.com/docker/buildx/releases/download/v0.17.1/buildx-v0.17.1.linux-amd64 \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
touch /tmp/bootstrap-done' \
    --query 'Instances[0].InstanceId' --output text)
  echo "▸ instance launched: $IID"
else
  echo "▸ instance already running: $IID"
fi

aws ec2 wait instance-running --instance-ids "$IID"
IP=$(aws ec2 describe-instances --instance-ids "$IID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

printf '%s' "$IP" > "$HERE/.instance-ip"
printf '%s' "$IID" > "$HERE/.instance-id"

echo
echo "✓ instance : $IID"
echo "✓ public ip: $IP"
echo "✓ ssh      : ssh -i $KEY_PATH ec2-user@$IP"
echo
echo "next: ./deploy/ship.sh   (waits for bootstrap, copies code, brings the stack up)"
