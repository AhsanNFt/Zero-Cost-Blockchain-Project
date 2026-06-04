#!/usr/bin/env bash

# SkillChain AWS ECR Push & Deployment Helper Script
# This script is designed to be executed inside AWS Cloud9 or a Linux terminal with AWS CLI and Docker configured.

# Exit immediately if a command exits with a non-zero status
set -e

# --- Default Configurations ---
DEFAULT_REGION="us-east-1"
IMAGE_NAME="skillchain"
TAG="latest"

# --- Visual Colors ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}      SkillChain AWS ECR Deployment Helper           ${NC}"
echo -e "${BLUE}=====================================================${NC}"

required_vars=(
    VITE_GOOGLE_CLIENT_ID
    VITE_ALCHEMY_API_KEY
    VITE_CONTRACT_ADDRESS
    VITE_PINATA_API_KEY
    VITE_PINATA_SECRET_KEY
    VITE_PINATA_JWT
)

missing_vars=()
for var_name in "${required_vars[@]}"; do
    if [[ -z "${!var_name}" ]]; then
        missing_vars+=("$var_name")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    echo -e "${YELLOW}Warning: these build-time environment variables are not set in your shell:${NC}"
    printf '  - %s\n' "${missing_vars[@]}"
    echo -e "${YELLOW}Export them before running this script, or the built client bundle will be incomplete.${NC}"
    exit 1
fi

# Ensure AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed or not in PATH.${NC}"
    exit 1
fi

# Ensure Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not running.${NC}"
    exit 1
fi

# Request User Input
read -p "Enter your AWS Account ID (12 digits): " AWS_ACCOUNT_ID
if [[ -z "$AWS_ACCOUNT_ID" || ! "$AWS_ACCOUNT_ID" =~ ^[0-9]{12}$ ]]; then
    echo -e "${RED}Error: Invalid AWS Account ID. It must be exactly 12 digits.${NC}"
    exit 1
fi

read -p "Enter AWS Region [default: $DEFAULT_REGION]: " AWS_REGION
AWS_REGION=${AWS_REGION:-$DEFAULT_REGION}

REGISTRY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPO_URL="${REGISTRY_URI}/${IMAGE_NAME}"

echo -e "\n${BLUE}[1/4] Authenticating Docker with AWS ECR...${NC}"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY_URI}"

echo -e "\n${BLUE}[2/4] Building SkillChain Docker image...${NC}"
docker build \
    --build-arg VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID}" \
    --build-arg VITE_ALCHEMY_API_KEY="${VITE_ALCHEMY_API_KEY}" \
    --build-arg VITE_CONTRACT_ADDRESS="${VITE_CONTRACT_ADDRESS}" \
    --build-arg VITE_PINATA_API_KEY="${VITE_PINATA_API_KEY}" \
    --build-arg VITE_PINATA_SECRET_KEY="${VITE_PINATA_SECRET_KEY}" \
    --build-arg VITE_PINATA_JWT="${VITE_PINATA_JWT}" \
    -t "${IMAGE_NAME}" .

echo -e "\n${BLUE}[3/4] Tagging Docker image for ECR...${NC}"
docker tag "${IMAGE_NAME}:latest" "${ECR_REPO_URL}:${TAG}"

echo -e "\n${BLUE}[4/4] Pushing image to AWS ECR...${NC}"
docker push "${ECR_REPO_URL}:${TAG}"

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}🎉 Success! Your Docker image is now pushed to AWS ECR:${NC}"
echo -e "${YELLOW}${ECR_REPO_URL}:${TAG}${NC}"
echo -e "${GREEN}=====================================================${NC}"

# Database migration prompt
echo -e "\n${YELLOW}Would you like to run database migrations against RDS?${NC}"
echo -e "Make sure you have set the DATABASE_URL environment variable in Cloud9."
read -p "Run migrations now? (y/n): " RUN_MIGRATE

if [[ "$RUN_MIGRATE" =~ ^[Yy]$ ]]; then
    if [[ -z "$DATABASE_URL" ]]; then
        echo -e "${RED}Error: DATABASE_URL variable is not set in this terminal session.${NC}"
        echo -e "Please export it first: export DATABASE_URL=\"mysql://user:pass@host:3306/dbname\""
    else
        echo -e "\n${BLUE}Installing dependencies and running database migrations...${NC}"
        npm install
        npm run db:push
        echo -e "${GREEN}✓ Database schema pushed successfully!${NC}"
    fi
fi
