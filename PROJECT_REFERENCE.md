# Chronic Care Butler — Master Project Reference

## 🔗 Accounts & Services

### MongoDB Atlas (Database)
- **URL:** https://cloud.mongodb.com
- **Email:** vanguardironholdings@gmail.com
- **Cluster:** chronic-care
- **Connection String:** `mongodb+srv://chronic_admin:e4MSj5Z0gU8FI0fX@chronic-care.kcsfdrn.mongodb.net/chronic_care`
- **Tier:** M0 Free (512MB storage)
- **Region:** AWS

### AWS (Deployment - Not Yet Set Up)
- **Status:** Deployment scripts ready, needs AWS account
- **URL:** https://aws.amazon.com/activate (for startup credits)
- **Needed:** AWS account + credentials to run deployment

### WeChat Official Account (Not Yet Set Up)
- **Status:** Backend integration code complete, needs WeChat account
- **URL:** https://mp.weixin.qq.com (to register)
- **Needed:** Chinese business license or personal ID for registration

---

## 🖥️ Local Development URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:3005 | Running |
| **Backend API** | http://localhost:3001/api | Running |
| **Health Check** | http://localhost:3001/api/health | Running |
| **WebSocket** | ws://localhost:3001 | Running |
| **WeChat Webhook** | http://localhost:3001/api/wechat/webhook | Ready |

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@chroniccare.com | admin123 |
| **Doctor** | doctor@chroniccare.com | doctor123 |
| **Nurse** | nurse@chroniccare.com | nurse123 |
| **Staff** | staff@chroniccare.com | staff123 |

---

## 📁 Project Structure

```
chronic-care-butler/
├── dashboard-3d-final/          # Backend (Express + MongoDB)
│   ├── src/server/
│   │   ├── config/database.ts   # MongoDB connection
│   │   ├── middleware/auth.ts   # JWT + Role-based auth
│   │   ├── models/              # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Patient.ts
│   │   │   ├── Medication.ts
│   │   │   ├── Appointment.ts
│   │   │   ├── Alert.ts
│   │   │   └── WeChatBinding.ts
│   │   ├── routes/              # API routes
│   │   │   ├── auth.ts
│   │   │   ├── patients.ts
│   │   │   ├── medications.ts
│   │   │   ├── appointments.ts
│   │   │   ├── alerts.ts
│   │   │   ├── reports.ts
│   │   │   └── wechat.ts
│   │   ├── services/
│   │   │   └── wechat.ts        # WeChat API service
│   │   ├── cron/
│   │   │   └── reminders.ts     # Medication reminder cron
│   │   ├── websocket.ts         # Real-time notifications
│   │   ├── seed.ts              # Database seeder
│   │   └── index.ts             # Server entry point
│   ├── .env                     # Environment variables
│   ├── Dockerfile               # Backend container
│   └── package.json
│
├── unified-dashboard/            # Frontend (Next.js 14)
│   ├── src/
│   │   ├── app/[locale]/        # i18n pages (zh/en)
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── login/page.tsx   # Login
│   │   │   └── (dashboard)/     # Protected dashboard
│   │   │       ├── dashboard/   # Main dashboard
│   │   │       ├── patients/    # Patient management
│   │   │       ├── medications/ # Medication tracking
│   │   │       ├── appointments/# Appointment management
│   │   │       ├── reports/     # Reports
│   │   │       └── settings/    # Settings
│   │   ├── stores/              # Zustand state
│   │   │   ├── authStore.ts
│   │   │   ├── patientStore.ts
│   │   │   ├── medicationStore.ts
│   │   │   └── appointmentStore.ts
│   │   ├── components/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── WeChatBinding.tsx
│   │   └── lib/i18n.ts          # Internationalization
│   ├── messages/zh.json         # Chinese translations
│   ├── messages/en.json         # English translations
│   ├── Dockerfile               # Frontend container
│   └── package.json
│
├── docker-compose.yml            # Container orchestration
├── scripts/
│   ├── deploy-aws.sh            # AWS deployment script
│   └── demo-seed.ts             # Demo data seeder
├── aws/
│   └── ecs-task-definition.json # ECS task config
├── .github/workflows/
│   └── deploy.yml               # CI/CD pipeline
└── docs/
    ├── AWS_DEPLOYMENT.md         # Deployment guide
    ├── MONGODB_SETUP.md          # Database setup guide
    └── investor-site/            # GitHub Pages site
```

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Current user
- `GET /api/auth/users` - List users (admin only)

### Patients
- `GET /api/patients` - List patients (role-filtered)
- `POST /api/patients` - Create patient (admin only)
- `GET /api/patients/:id` - Get patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/patients/:id/assign-nurse` - Assign nurse
- `POST /api/patients/:id/assign-staff` - Assign staff

### Medications
- `GET /api/patients/:id/medications` - List medications
- `POST /api/patients/:id/medications` - Add medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Appointments
- `GET /api/patients/:id/appointments` - List appointments
- `POST /api/patients/:id/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert

### Reports
- `GET /api/reports/dashboard-stats` - Dashboard statistics
- `GET /api/reports/patient-summary` - Patient summary
- `GET /api/reports/medication-adherence` - Adherence report
- `GET /api/reports/appointment-analytics` - Appointment analytics

### WeChat
- `GET /api/wechat/webhook` - WeChat verification
- `POST /api/wechat/webhook` - Receive messages
- `POST /api/wechat/bind` - Bind patient (dashboard)
- `GET /api/wechat/bindings` - List bindings

---

## ✅ Completion Status

| Phase | Status | Details |
|-------|--------|---------|
| Phase 1: Data Layer | ✅ Complete | MongoDB Atlas, full CRUD, real stats |
| Phase 2: Role-Based Access | ✅ Complete | Admin, Doctor, Nurse, Staff roles |
| Phase 3: WeChat Integration | ✅ Complete | Webhook, reminders, binding, symptoms |
| Phase 4: AWS Deployment | ⚠️ Scripts Ready | Needs AWS account to execute |
| Phase 5: Investor Polish | ⚠️ In Progress | Site template created, needs content |

---

## 🚀 Remaining Steps

### AWS Deployment
1. Install AWS CLI: `brew install awscli`
2. Configure: `aws configure`
3. Start Docker Desktop
4. Run: `cd chronic-care-butler && ./scripts/deploy-aws.sh YOUR_ACCOUNT_ID`

### WeChat Setup
1. Register WeChat Official Account at https://mp.weixin.qq.com
2. Get App ID, App Secret, Token
3. Add to `.env` file
4. Configure webhook URL in WeChat admin panel

### Investor Site
1. Complete the GitHub Pages site
2. Record demo video
3. Push to GitHub and enable Pages

---

## 🔧 Quick Start Commands

```bash
# Start backend
cd chronic-care-butler/dashboard-3d-final
npm run server

# Start frontend
cd chronic-care-butler/unified-dashboard
npm run dev -- --port 3005

# Re-seed database
cd chronic-care-butler/dashboard-3d-final
npm run seed

# Build Docker containers
docker-compose build

# Deploy to AWS
./scripts/deploy-aws.sh YOUR_ACCOUNT_ID
```
