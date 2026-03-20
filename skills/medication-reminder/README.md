# Skill: Medication Reminder
# 用药提醒技能

## Purpose
自动发送用药提醒给患者，并在未确认时升级通知家属或护士。

## Triggers

### 1. Scheduled Reminder (Primary)
```yaml
trigger: cron
schedule: "0 8,12,18,21 * * *"  # 早上8点, 中午12点, 晚上6点, 晚上9点
timezone: Asia/Shanghai
```

### 2. Snoozed Reminder
```yaml
trigger: event
event: reminder.snoozed
```

## Context Required

```json
{
  "patient": {
    "id": "string",
    "name": "string",
    "wechat_openid": "string",
    "caregiver_openid": "string | null"
  },
  "medication": {
    "id": "string",
    "name": "string",
    "dosage": "string",
    "purpose": "string",
    "time_bucket": "早上|中午|晚上|睡前",
    "with_food": "boolean"
  },
  "reminder": {
    "id": "string",
    "scheduled_time": "datetime",
    "snooze_count": "number"
  }
}
```

## Workflow

### Step 1: Send Initial Reminder
```javascript
action: send_wechat_template_message
to: {{patient.wechat_openid}}
template: medication_reminder
data:
  patient_name: {{patient.name}}
  medication_name: {{medication.name}}
  dosage: {{medication.dosage}}
  purpose: {{medication.purpose}}
  time_bucket: {{medication.time_bucket}}
  with_food_note: {{medication.with_food ? "饭后服用" : ""}}
buttons:
  - text: "已服用 ✓"
    action: "confirm_taken"
    data:
      reminder_id: {{reminder.id}}
      medication_id: {{medication.id}}
  - text: "稍后提醒 (30分钟)"
    action: "snooze"
    data:
      reminder_id: {{reminder.id}}
      minutes: 30
```

### Step 2: Wait for Response
```yaml
action: wait
 timeout: 2 hours
 on_timeout: escalate
```

### Step 3: Handle Patient Response

#### If "已服用":
```javascript
action: log_adherence
data:
  patient_id: {{patient.id}}
  medication_id: {{medication.id}}
  taken: true
  timestamp: {{now()}}
  confirmed_by: "patient"

action: send_confirmation
 to: {{patient.wechat_openid}}
 message: "已记录：{{medication.name}} {{medication.dosage}}。继续保持！"
```

#### If "稍后提醒":
```javascript
action: schedule_reminder
 at: {{now() + 30 minutes}}
 reminder_id: {{reminder.id}}
 snooze_count: {{reminder.snooze_count + 1}}
 
action: send_snooze_confirmation
 to: {{patient.wechat_openid}}
 message: "好的，30分钟后再次提醒。"
```

### Step 4: Escalation (No Response After 2 Hours)

```javascript
action: log_adherence
data:
  patient_id: {{patient.id}}
  medication_id: {{medication.id}}
  taken: false
  timestamp: {{now()}}
  reason: "no_response"

# Escalate to caregiver if available
if (patient.caregiver_openid) {
  action: send_wechat_template_message
  to: {{patient.caregiver_openid}}
  template: caregiver_escalation
  data:
    patient_name: {{patient.name}}
    medication_name: {{medication.name}}
    scheduled_time: {{reminder.scheduled_time}}
    missed_duration: "2小时"
  
  action: log_escalation
  data:
    reminder_id: {{reminder.id}}
    escalated_to: "caregiver"
    escalated_at: {{now()}}
}

# Always flag for nurse review
action: add_to_nurse_queue
data:
  patient_id: {{patient.id}}
  patient_name: {{patient.name}}
  medication_name: {{medication.name}}
  issue: "未确认服药"
  priority: "medium"
  created_at: {{now()}}
```

## Safety Guardrails

### Never Provide Medical Advice
```yaml
if patient asks:
  - "这个药能停吗？"
  - "我觉得好多了，还要吃吗？"
  - "这个药有副作用怎么办？"
  
response: "这个问题需要咨询您的医生或护士。请拨打社区卫生服务中心电话：{{clinic_phone}}"
action: flag_for_nurse_review
```

### Emergency Keywords Detection
```yaml
keywords: ["疼痛", "胸痛", "头晕", "昏倒", "出血", "急", "emergency", "救命"]

if message_contains_any(keywords):
  action: send_immediate_alert
  to: [nurse_on_call, clinic_emergency_line]
  message: "患者 {{patient.name}} 发送了可能紧急的消息：{{message}}"
  
  action: reply_to_patient
  message: "我们已收到您的消息，护士会立即与您联系。如情况紧急，请直接拨打120或前往急诊。"
  
  action: escalate_to_human
  priority: "urgent"
```

## Message Templates

### Medication Reminder Template
```
{{patient_name}}，该吃药了

💊 {{medication_name}} {{dosage}}
🎯 {{purpose}}
⏰ {{time_bucket}} {{with_food_note}}

[已服用] [稍后提醒]
```

### Caregiver Escalation Template
```
提醒：{{patient_name}} 尚未确认服药

💊 {{medication_name}}
⏰ 应于 {{scheduled_time}} 服用
⏱️ 已超时 {{missed_duration}}

[查看详情] [联系患者]
```

## Logging & Analytics

### Events Logged
- `reminder.sent` - 提醒已发送
- `reminder.confirmed` - 患者已确认
- `reminder.snoozed` - 患者选择稍后
- `reminder.missed` - 超时未响应
- `reminder.escalated` - 已升级通知

### Metrics
- Response rate (响应率)
- Confirmation rate (确认率)
- Average response time (平均响应时间)
- Escalation rate (升级率)
- Snooze frequency (稍后提醒频率)

## Testing

### Test Case 1: Happy Path
```yaml
patient: 张先生
medication: 二甲双胍 1片
scheduled: 08:00
expected:
  - 08:00: Send reminder
  - 08:05: Patient clicks "已服用"
  - 08:05: Log adherence = true
  - 08:05: Send confirmation
```

### Test Case 2: Snooze
```yaml
scheduled: 08:00
action: Click "稍后提醒"
expected:
  - 08:00: Send reminder
  - 08:00: Patient snoozes
  - 08:00: Send snooze confirmation
  - 08:30: Send reminder again
```

### Test Case 3: Escalation
```yaml
scheduled: 08:00
no_response_until: 10:00
expected:
  - 08:00: Send reminder
  - 10:00: Log missed
  - 10:00: Send to caregiver
  - 10:00: Add to nurse queue
```

## Implementation Notes

### Local Development (Zero Cost)
```bash
# Run OpenClaw locally
openclaw serve --skills ./skills

# Test with mock patient data
curl -X POST http://localhost:3000/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "medication-reminder",
    "context": {
      "patient": { "name": "测试患者", "wechat_openid": "test_openid" },
      "medication": { "name": "二甲双胍", "dosage": "1片", "time_bucket": "早上" }
    }
  }'
```

### Production Deployment
- Requires: WeChat Service Account credentials
- Requires: Message template IDs
- Database: PostgreSQL for patient data
- Queue: Redis for reminder scheduling
