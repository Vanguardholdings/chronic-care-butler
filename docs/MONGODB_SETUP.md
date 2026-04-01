# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended) - Free Forever

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Verify your email

### Step 2: Create Cluster
1. Click "Build a Cluster"
2. Choose **M0 (Free)** tier
3. Select region: **AWS / Oregon (us-west-2)** or closest to you
4. Cluster name: `chronic-care`
5. Click "Create"

### Step 3: Configure Access
1. In "Database Access", click "Add New Database User"
2. Username: `chronic_admin`
3. Password: Click "Autogenerate" and **SAVE IT**
4. Role: **Read and Write to Any Database**
5. Click "Add User"

### Step 4: Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (or add your specific IP)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" → Click "Connect" on your cluster
2. Select "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://chronic_admin:<password>@chronic-care.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

### Step 6: Update Backend
1. Edit `dashboard-3d-final/.env`:
   ```
   MONGODB_URI=mongodb+srv://chronic_admin:YOUR_PASSWORD@chronic-care.xxxxx.mongodb.net/chronic_care?retryWrites=true&w=majority
   USE_MEMORY_DB=false
   ```
2. Restart backend: `npm run server`

---

## Option 2: Local MongoDB (Docker) - Quick Setup

### Run with Docker:
```bash
# Pull and run MongoDB with persistent volume
docker run -d \
  --name chronic-mongo \
  -p 27017:27017 \
  -v ~/mongodb-data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret123 \
  mongo:7

# Update .env
MONGODB_URI=mongodb://admin:secret123@localhost:27017/chronic_care?authSource=admin
USE_MEMORY_DB=false
```

---

## Option 3: Local MongoDB (Install)

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

### Ubuntu:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

Then update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/chronic_care
USE_MEMORY_DB=false
```

---

## Verification

After setup, restart the backend and check logs:
```
✅ MongoDB connected successfully
   Database: chronic_care
   Host: cluster