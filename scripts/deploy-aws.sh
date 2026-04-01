#!/bin/bash

# AWS Deployment Script for Chronic Care Butler
# Usage: ./deploy-aws.sh [AWS_ACCOUNT_ID] [AWS_REGION]

set -e

AWS_ACCOUNT_ID=${1:-"YOUR_ACCOUNT_ID"}
AWS_REGION=${2:-"us-west-2"}
PROJECT_NAME="chronic-care"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Chronic Care Butler - AWS Deployment Script          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
command -v aws >/dev/null 2>&1 || { echo -e "${RED}❌ AWS CLI is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Check AWS credentials
aws sts get-caller-identity > /dev/null 2>&1 || { echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}" >&2; exit 1; }

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 1: Login to ECR
echo -e "${YELLOW}Step 1: Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
echo -e "${GREEN}✅ Logged in to ECR${NC}"
echo ""

# Step 2: Create ECR Repositories
echo -e "${YELLOW}Step 2: Creating ECR repositories...${NC}"

# Backend repo
if aws ecr describe-repositories --repository-names $PROJECT_NAME-backend --region $AWS_REGION 2>/dev/null; then
    echo -e "${GREEN}✅ Backend repository already exists${NC}"
else
    aws ecr create-repository --repository-name $PROJECT_NAME-backend --region $AWS_REGION
    echo -e "${GREEN}✅ Backend repository created${NC}"
fi

# Frontend repo
if aws ecr describe-repositories --repository-names $PROJECT_NAME-frontend --region $AWS_REGION 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend repository already exists${NC}"
else
    aws ecr create-repository --repository-name $PROJECT_NAME-frontend --region $AWS_REGION
    echo -e "${GREEN}✅ Frontend repository created${NC}"
fi
echo ""

# Step 3: Build and Push Backend
echo -e "${YELLOW}Step 3: Building and pushing backend...${NC}"
cd dashboard-3d-final

echo "Building backend image..."
docker build -t $PROJECT_NAME-backend:latest .
docker tag $PROJECT_NAME-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-backend:latest

echo "Pushing backend image..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-backend:latest

cd ..
echo -e "${GREEN}✅ Backend image pushed${NC}"
echo ""

# Step 4: Build and Push Frontend
echo -e "${YELLOW}Step 4: Building and pushing frontend...${NC}"
cd unified-dashboard

echo "Building frontend image..."
docker build -t $PROJECT_NAME-frontend:latest .
docker tag $PROJECT_NAME-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-frontend:latest

echo "Pushing frontend image..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-frontend:latest

cd ..
echo -e "${GREEN}✅ Frontend image pushed${NC}"
echo ""

# Step 5: Create ECS Cluster
echo -e "${YELLOW}Step 5: Setting up ECS...${NC}"

if aws ecs describe-clusters --clusters $PROJECT_NAME-cluster --region $AWS_REGION | grep -q '"status": "ACTIVE"'; then
    echo -e "${GREEN}✅ ECS cluster already exists${NC}"
else
    aws ecs create-cluster --cluster-name $PROJECT_NAME-cluster --region $AWS_REGION
    echo -e "${GREEN}✅ ECS cluster created${NC}"
fi

# Step 6: Create Task Definition
echo -e "${YELLOW}Step 6: Creating task definition...${NC}"

# Get MongoDB URI from user or environment
if [ -z "$MONGODB_URI" ]; then
    echo -e "${YELLOW}Enter your MongoDB Atlas connection string:${NC}"
    read -s MONGODB_URI
fi

# Create task definition with sed replacements
sed -e "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" \
    -e "s/us-west-2/$AWS_REGION/g" \
    aws/ecs-task-definition.json > /tmp/task-definition.json

# Register task definition
aws ecs register-task-definition --cli-input-json file:///tmp/task-definition.json --region $AWS_REGION

echo -e "${GREEN}✅ Task definition created${NC}"
echo ""

# Step 7: Create or Update Service
echo -e "${YELLOW}Step 7: Creating ECS service...${NC}"

# Get default VPC and subnets
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION)
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[*].SubnetId' --output text --region $AWS_REGION | tr '\t' ',')

# Create security group
SG_NAME="$PROJECT_NAME-sg"
if aws ec2 describe-security-groups --group-names $SG_NAME --region $AWS_REGION 2>/dev/null; then
    SG_ID=$(aws ec2 describe-security-groups --group-names $SG_NAME --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION)
else
    SG_ID=$(aws ec2 create-security-group --group-name $SG_NAME --description "Chronic Care Butler security group" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text)
    
    # Allow inbound traffic
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION
    aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3001 --cidr 0.0.0.0/0 --region $AWS_REGION
fi

# Create or update service
if aws ecs describe-services --cluster $PROJECT_NAME-cluster --services $PROJECT_NAME-service --region $AWS_REGION | grep -q '"status": "ACTIVE"'; then
    echo -e "${YELLOW}Updating existing service...${NC}"
    aws ecs update-service --cluster $PROJECT_NAME-cluster --service $PROJECT_NAME-service --task-definition $PROJECT_NAME-task --force-new-deployment --region $AWS_REGION
else
    echo -e "${YELLOW}Creating new service...${NC}"
    aws ecs create-service \
        --cluster $PROJECT_NAME-cluster \
        --service-name $PROJECT_NAME-service \
        --task-definition $PROJECT_NAME-task \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
        --region $AWS_REGION
fi

echo -e "${GREEN}✅ ECS service created/updated${NC}"
echo ""

# Step 8: Get service URL
echo -e "${YELLOW}Step 8: Getting service information...${NC}"
TASK_ARN=$(aws ecs list-tasks --cluster $PROJECT_NAME-cluster --service-name $PROJECT_NAME-service --region $AWS_REGION --query 'taskArns[0]' --output text)
if [ "$TASK_ARN" != "None" ] && [ -n "$TASK_ARN" ]; then
    ENI=$(aws ecs describe-tasks --cluster $PROJECT_NAME-cluster --tasks $TASK_ARN --region $AWS_REGION --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)
    if [ -n "$ENI" ]; then
        PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region $AWS_REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text)
        echo -e "${GREEN}✅ Service deployed!${NC}"
        echo ""
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                    DEPLOYMENT SUCCESSFUL!                ║${NC}"
        echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
        echo -e "${GREEN}║  Backend API:  http://$PUBLIC_IP:3001/api${NC}"
        echo -e "${GREEN}║  Frontend:     http://$PUBLIC_IP${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Service is starting... Check AWS console for status${NC}"
fi

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure a load balancer for HTTPS/SSL"
echo "2. Set up CloudFront CDN (optional)"
echo "3. Configure custom domain in Route 53"
echo "4. Set up CloudWatch monitoring and alerts"
echo ""
