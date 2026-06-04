# GCP deployment guide

This app is a single container: Vite builds the frontend into `dist/public`, and the Hono/tRPC backend runs from `dist/boot.js` on `PORT` or `3000`.

## Recommendation

For this project, Google Cloud Run is the easiest GCP target because it can run the existing Dockerfile, injects the `PORT` environment variable, supports Secret Manager, and can connect to Cloud SQL MySQL.

Cloud Run compute can stay low cost for light traffic, but the database is the catch: Cloud SQL is a paid managed database. For a truly zero-cost demo, use a free external MySQL-compatible database and set `DATABASE_URL` to that provider's TCP connection string.

## Required values

Build-time frontend values are baked into the browser bundle:

```env
VITE_GOOGLE_CLIENT_ID=
VITE_ALCHEMY_API_KEY=
VITE_CONTRACT_ADDRESS=
VITE_PINATA_API_KEY=
VITE_PINATA_SECRET_KEY=
VITE_PINATA_JWT=
```

Runtime server values are injected when Cloud Run starts:

```env
NODE_ENV=production
DATABASE_URL=
VITE_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OWNER_UNION_ID=
APP_URL=
```

Important: the current frontend reads Pinata values in the browser bundle. Treat this as acceptable only for demo/test deployments until uploads are moved behind the API.

## 1. Prepare local project

From PowerShell:

```powershell
cd "C:\Users\user\Desktop\Zero-Cost Blockchain Project\app"
npm install
npm run build
```

## 2. Configure Google Cloud

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
$env:REGION="us-central1"

gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com sqladmin.googleapis.com
```

Use `asia-south1` instead of `us-central1` if you want a region closer to Pakistan.

## 3. Create the database

### Option A: free/external MySQL

Use the provider's connection string:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/skillchain
```

### Option B: Google Cloud SQL MySQL

Create the instance and database:

```powershell
gcloud sql instances create skillchain-db --database-version=MYSQL_8_0 --region=$env:REGION
gcloud sql databases create skillchain --instance=skillchain-db
gcloud sql users create skillchain --instance=skillchain-db --password="YOUR_DB_PASSWORD"
$env:CLOUDSQL_CONNECTION_NAME=$(gcloud sql instances describe skillchain-db --format="value(connectionName)")
```

For Cloud Run, use a Unix socket connection string:

```powershell
$env:DATABASE_URL="mysql://skillchain:YOUR_DB_PASSWORD@localhost/skillchain?socketPath=/cloudsql/$env:CLOUDSQL_CONNECTION_NAME"
```

## 4. Create runtime secrets

```powershell
Write-Output $env:DATABASE_URL | gcloud secrets create DATABASE_URL --data-file=-
Write-Output "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
Write-Output "YOUR_OWNER_UNION_ID" | gcloud secrets create OWNER_UNION_ID --data-file=-
```

If a secret already exists, add a new version:

```powershell
Write-Output "NEW_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-
```

## 5. Deploy to Cloud Run

Replace the placeholder values before running:

```powershell
gcloud run deploy skillchain `
  --source . `
  --region $env:REGION `
  --allow-unauthenticated `
  --port 3000 `
  --set-build-env-vars VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID",VITE_ALCHEMY_API_KEY="YOUR_ALCHEMY_API_KEY",VITE_CONTRACT_ADDRESS="0x...",VITE_PINATA_API_KEY="YOUR_PINATA_API_KEY",VITE_PINATA_SECRET_KEY="YOUR_PINATA_SECRET_KEY",VITE_PINATA_JWT="YOUR_PINATA_JWT" `
  --set-env-vars NODE_ENV=production,VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID",APP_URL="https://YOUR_CLOUD_RUN_URL" `
  --set-secrets DATABASE_URL=DATABASE_URL:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,OWNER_UNION_ID=OWNER_UNION_ID:latest `
  --add-cloudsql-instances $env:CLOUDSQL_CONNECTION_NAME
```

If you use an external MySQL database instead of Cloud SQL, remove the `--add-cloudsql-instances` line.

After the first deploy, Cloud Run prints the service URL. Put that URL into Google OAuth:

```text
Authorized JavaScript origin: https://YOUR_CLOUD_RUN_URL
Authorized redirect URI: https://YOUR_CLOUD_RUN_URL/api/oauth/callback
```

Then redeploy with the final `APP_URL`.

## 6. Push database schema

For an external MySQL database:

```powershell
$env:DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/skillchain"
npm run db:push
```

For Cloud SQL, run Cloud SQL Auth Proxy locally, then push:

```powershell
cloud-sql-proxy $env:CLOUDSQL_CONNECTION_NAME --port 3306
$env:DATABASE_URL="mysql://skillchain:YOUR_DB_PASSWORD@127.0.0.1:3306/skillchain"
npm run db:push
```

## 7. Verify

```powershell
curl https://YOUR_CLOUD_RUN_URL/healthz
```

Also verify:

- homepage loads
- Google login redirects back successfully
- dashboard/API calls reach the database
- credential issuing can reach Alchemy and Pinata

If frontend actions fail but the server starts, rebuild/redeploy because `VITE_*` values are build-time values.
