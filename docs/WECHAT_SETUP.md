# WeChat Official Account Setup Guide

## Step 1: Register WeChat Official Account

### Option A: Service Account (服务号) — Recommended
- URL: https://mp.weixin.qq.com
- Requires: Chinese business license
- Benefits: Template messages, WeChat Pay, menu API, unlimited messages
- Review time: 3-5 business days

### Option B: Subscription Account (订阅号)
- URL: https://mp.weixin.qq.com
- Requires: Chinese ID or business license
- Benefits: Basic messaging (1 broadcast/day)
- Limitation: No template messages, limited API access

### Option C: Test Account (测试号) — For Development
- URL: https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
- Requires: Any WeChat personal account
- Benefits: Full API access for testing
- Limitation: Max 100 followers, test only

**Recommendation:** Start with Option C (Test Account) for development, then upgrade to Option A (Service Account) for production.

## Step 2: Get Credentials

After registration, go to:
1. **Development** → **Basic Configuration**
2. Copy:
   - **AppID** (应用ID)
   - **AppSecret** (应用密钥)
3. Set **Token** to: `chronic_care_butler_2026`
4. Set **Encoding AES Key** (if using encrypted mode)

## Step 3: Configure Server URL

1. Go to **Development** → **Basic Configuration** → **Server Configuration**
2. Set:
   - **URL:** `https://your-domain.com/api/wechat/webhook`
   - **Token:** `chronic_care_butler_2026`
   - **Encoding AES Key:** (auto-generate)
   - **Message Encryption:** Plain text (for dev), Safe mode (for production)
3. Click **Submit** — WeChat will verify your server

## Step 4: Create Message Templates

Go to **Templates** → **Template Library** and add:

### 1. Medication Reminder Template
Search for: "服药提醒" or "用药通知"
Variables needed:
- `patient` — Patient name
- `medication` — Medication name
- `dosage` — Dosage
- `time` — Time

### 2. Appointment Reminder Template
Search for: "预约提醒" or "就诊通知"
Variables needed:
- `patient` — Patient name
- `type` — Appointment type
- `doctor` — Doctor name
- `time` — Date/time
- `location` — Location

### 3. Alert Template
Search for: "健康提醒" or "异常通知"
Variables needed:
- `patient` — Patient name
- `alertType` — Alert type
- `value` — Value
- `time` — Time

### 4. Daily Summary Template
Search for: "健康日报" or "每日摘要"

## Step 5: Update Environment Variables

Edit `dashboard-3d-final/.env`:

```env
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=your_app_secret_here
WECHAT_TOKEN=chronic_care_butler_2026
WECHAT_ENCODING_AES_KEY=your_encoding_aes_key

WECHAT_MEDICATION_TEMPLATE_ID=template_id_1
WECHAT_APPOINTMENT_TEMPLATE_ID=template_id_2
WECHAT_ALERT_TEMPLATE_ID=template_id_3
WECHAT_SUMMARY_TEMPLATE_ID=template_id_4
```

## Step 6: Create Custom Menu

Go to **Content & Interactions** → **Custom Menu**:

```json
{
  "button": [
    {
      "name": "健康管理",
      "sub_button": [
        { "type": "click", "name": "记录服药", "key": "MEDICATION_RECORD" },
        { "type": "click", "name": "上报症状", "key": "SYMPTOM_REPORT" },
        { "type": "click", "name": "查看预约", "key": "VIEW_APPOINTMENTS" }
      ]
    },
    {
      "name": "个人中心",
      "sub_button": [
        { "type": "click", "name": "绑定档案", "key": "BIND_PATIENT" },
        { "type": "click", "name": "使用帮助", "key": "HELP" }
      ]
    }
  ]
}
```

## Step 7: Test

1. Follow your Official Account with WeChat
2. Send "帮助" — should get menu instructions
3. Send "绑定 Eleanor Thompson" — should bind to patient
4. Send "服药 Metformin" — should record adherence
5. Send "预约" — should show upcoming appointments

## Verification Checklist

- [ ] WeChat Official Account registered
- [ ] Server URL configured and verified
- [ ] Message templates created
- [ ] Environment variables updated
- [ ] Custom menu published
- [ ] Test messages working
- [ ] Medication reminders sending (check cron logs)
