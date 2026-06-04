# AWS deployment guide

This project ships as one container: the Vite frontend is built into `dist/public` and the Hono/tRPC backend runs from `dist/boot.js`.

## What must be set

There are two kinds of configuration:

- **Build-time frontend values** are baked into the Vite bundle when the Docker image is built.
- **Runtime server values** are injected into the ECS task definition or Secrets Manager when the container starts.

If you skip the build-time values, the app may start but the browser bundle will be missing the Google, Pinata, or Alchemy configuration it expects.

## Recommended AWS stack

- **ECR** for the container image
- **ECS Fargate** for the app service
- **ALB** for HTTPS traffic and health checks
- **RDS MySQL** for `DATABASE_URL`
- **Secrets Manager** for runtime secrets
- **ACM + Route 53** for TLS and domain routing

## 1. Prepare AWS resources

Create:

1. An ECR repository.
2. An RDS MySQL database in the same VPC as ECS.
3. A public ALB with HTTPS listener on 443.
4. An ECS cluster and Fargate task definition.
5. A Secrets Manager secret for app config.

Store these values:

- `DATABASE_URL`
- `GOOGLE_CLIENT_SECRET`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_ALCHEMY_API_KEY`
- `VITE_CONTRACT_ADDRESS`
- `OWNER_UNION_ID`
- `VITE_PINATA_API_KEY`
- `VITE_PINATA_SECRET_KEY`
- `VITE_PINATA_JWT`

Also set these optional integration values if you use the ATS webhooks:

- `APP_URL`
- `GREENHOUSE_SECRET_KEY`
- `LEVER_WEBHOOK_SECRET`
- `LEVER_VERIFICATION_STAGE_ID`

## 2. Build and push the image

From `app/`:

```bash
docker build \
	--build-arg VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
	--build-arg VITE_ALCHEMY_API_KEY=$VITE_ALCHEMY_API_KEY \
	--build-arg VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS \
	--build-arg VITE_PINATA_API_KEY=$VITE_PINATA_API_KEY \
	--build-arg VITE_PINATA_SECRET_KEY=$VITE_PINATA_SECRET_KEY \
	--build-arg VITE_PINATA_JWT=$VITE_PINATA_JWT \
	-t skillchain .
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag skillchain:latest <account>.dkr.ecr.<region>.amazonaws.com/skillchain:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/skillchain:latest
```

If you are using PowerShell, pass the same values with `$env:...`.

## 3. ECS task definition

Use:

- **CPU/Mem:** 1 vCPU / 2 GB minimum
- **Port:** 3000
- **Command:** `npm run start`
- **Env:** inject the variables above from Secrets Manager
- **Health check path:** `GET /healthz`

The container listens on `PORT` and defaults to `3000`, so make sure the ECS port mapping and ALB target group both use that port.

## 4. RDS connection

Use the RDS endpoint in `DATABASE_URL`, for example:

```env
DATABASE_URL=mysql://user:password@host:3306/skillchain
```

Allow ECS security group access to RDS on port 3306 only.

## 5. Google OAuth setup

Set the Google OAuth redirect URI to:

```text
https://<your-domain>/api/oauth/callback
```

Make sure the ALB domain or Route 53 record matches the origin used by the browser.

If you use a custom domain, also set `APP_URL=https://<your-domain>` in the ECS task so generated verification links point at the production site.

## 6. DNS and TLS

1. Request an ACM certificate for your domain.
2. Attach it to the ALB HTTPS listener.
3. Point Route 53 to the ALB.

## 7. Deploy

After the service is running, confirm:

- `/healthz` returns `ok`
- the homepage loads
- OAuth sign-in redirects back successfully
- DB queries reach RDS

If the homepage loads but client actions fail, double-check the build-time `VITE_*` values in the image you pushed to ECR. Rebuilding the image is required whenever those values change.

## Notes

- Keep `NODE_ENV=production`.
- Keep cookies behind HTTPS; the app sets secure cookies outside localhost.
- If you scale beyond one task, move file uploads and any shared state to AWS-managed services only.
- The current frontend reads Pinata credentials in the browser bundle. For a production-hardening pass, move upload flows behind the API before treating those values as secrets.
