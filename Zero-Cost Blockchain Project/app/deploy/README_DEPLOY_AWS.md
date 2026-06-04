This folder contains starter deployment artifacts for AWS.

Quick steps (PowerShell):

1. Export build-time vars in PowerShell:

```powershell
$env:VITE_GOOGLE_CLIENT_ID="your-google-client-id"
$env:VITE_ALCHEMY_API_KEY="your-alchemy-key"
$env:VITE_CONTRACT_ADDRESS="0x..."
$env:VITE_PINATA_API_KEY="your-pinata-key"
$env:VITE_PINATA_SECRET_KEY="your-pinata-secret"
$env:VITE_PINATA_JWT="your-pinata-jwt"
```

2. From `app/`, run the helper script to build and push to ECR (ensure AWS CLI + Docker configured):

```powershell
cd app
./aws-deploy-helper.sh
```

3. Deploy CloudFormation (replace parameters):

```powershell
aws cloudformation deploy \
  --template-file deploy/ecs-service-cloudformation.yml \
  --stack-name skillchain-stack \
  --parameter-overrides \
    ContainerImage="<account>.dkr.ecr.<region>.amazonaws.com/skillchain:latest" \
    VpcId="vpc-..." \
    SubnetIds="subnet-aaa,subnet-bbb" \
    CertificateArn="arn:aws:acm:..." \
    DBSecretArn="arn:aws:secretsmanager:..."
```

4. Verify:

- Check CloudFormation stack events for progress.
- Confirm `/healthz` on the ALB DNS from the stack outputs.
- Run `npm run db:push` locally or run migrations from a temporary container with `DATABASE_URL` pointing at RDS.

Notes:
- This is a starter template; production deployments should add autoscaling, proper security group rules, private subnets, and an RDS instance or Amazon RDS proxy as required.
- If you need a CDK version instead, tell me and I will scaffold it.
