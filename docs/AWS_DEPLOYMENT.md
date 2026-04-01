# AWS Deployment Guide

## Option 1: ECS Fargate (Recommended)

### Prerequisites
- AWS CLI installed and configured
- Docker installed locally
- MongoDB Atlas account (already set up)

### Step 1: Create ECR Repositories

```bash
# Login to AWS ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name chronic-care-backend
aws ecr create-repository --repository-name chronic-care-frontend
```

### Step 2: Build and Push Images

```bash
# Build backend
cd dashboard-3d-final
docker build -t chronic-care-backend .
docker tag chronic-care-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chronic-care-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chronic-care-backend:latest

# Build frontend
cd ../unified-dashboard
docker build -t chronic-care-frontend .
docker tag chronic-care-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chronic-care-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chronic-care-frontend:latest
```

### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name chronic-care-cluster
```

### Step 4: Create Task Definitions

See `ecs-task-definition.json` for the full configuration.

### Step 5: Create Service

```bash
aws ecs create-service \
  --cluster chronic-care-cluster \
  --service-name chronic-care-service \
  --task-definition chronic-care-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxx],securityGroups=[sg-xxxx],assignPublicIp=ENABLED}"
```

### Step 6: Configure Load Balancer

1. Go to EC2 Console → Load Balancers
2. Create Application Load Balancer
3. Add listener on port 80 (HTTP) and 443 (HTTPS)
4. Target group pointing to ECS service

### Step 7: Configure Domain & SSL

1. Register domain in Route 53 (or use existing)
2. Request certificate in ACM
3. Update ALB listener to use HTTPS with ACM certificate
4. Create Route 53 A record pointing to ALB

---

## Option 2: Elastic Beanstalk (Easiest)

### Step 1: Install EB CLI

```bash
pip install awsebcli
```

### Step 2: Initialize EB Application

```bash
cd dashboard-3d-final
eb init -p docker chronic-care-backend
eb create chronic-care-backend-env
```

### Step 3: Deploy

```bash
eb deploy
```

---

## Option 3: EC2 with Docker

### Step 1: Launch EC2 Instance
- AMI: Amazon Linux 2023
- Instance type: t3.small (minimum)
- Security group: Allow ports 22, 80, 443, 3001

### Step 2: Install Docker

```bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
```

### Step 3: Run Containers

```bash
docker run -d \
  --name backend \
  -p 3001:3001 \
  -e MONGODB_URI="your-atlas-uri" \
  -e JWT_SECRET="your-secret" \
  YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chronic-care-backend:latest

docker run -d \
  --name frontend \
  -p 80:3000 \
  -e NEXT_PUBLIC_API_URL="http://YOUR_EC2_IP:3001/api" \
  YOUR_ACCOUNT_ID.dkr.ecr.us-west-2.amazonaws.com/chronic-care-frontend:latest
```

---

## Environment Variables (All Options)

### Backend
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Random secret for JWT signing
- `CORS_ORIGIN` - Allowed frontend domains
- `PORT` - 3001

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NODE_ENV` - production

---

## Post-Deployment Checklist

- [ ] Health check endpoint responding
- [ ] Login works
- [ ] CRUD operations working
- [ ] SSL certificate valid
- [ ] Domain resolves correctly
- [ ] Database connected to Atlas
