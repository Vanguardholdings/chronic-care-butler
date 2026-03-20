# Skill: Appointment Manager
# 预约管理技能

## Purpose
管理患者预约，发送提醒，处理改期请求，跟踪随访。

## Triggers

### 1. Pre-Appointment Reminder (24 hours)
```yaml
trigger: cron
schedule: "0 9 * * *"  # 每天早上9点检查明天的预约
timezone: Asia/Shanghai
condition: appointment.date == tomorrow
```

### 2. Pre-Appointment Reminder (2 hours)
```yaml
trigger: cron
schedule: "0 * * * *"  # 每小时检查
timezone: Asia/Shanghai
condition: appointment.datetime == now + 2 hours
```

### 3. Post-Appointment Follow-up
```yaml
trigger: cron
schedule: "0 10 * * *"  # 每天早上10点
timezone: Asia/Shanghai
condition: appointment.date == 3 days ago
```

### 4. Patient-Initiated Reschedule
```yaml
trigger: message
pattern: ["改期", "改时间", "reschedule", "换时间"]
```

## Context Required

```json
{
  "appointment": {
    "id": "string",
    "patient_id": "string",
    "patient_name": "string",
    "patient_wechat": "string",
    "datetime": "datetime",
    "type": "复诊|检查|随访",
    "department": "string",
    "doctor": "string",
    "location": "string",
    "notes": "string"
  },
  "clinic": {
    "name": "string",
    "address": "string",
    "phone": "string",
    "available_slots": ["datetime"]
  }
}
```

## Workflow: 24-Hour Reminder

### Step 1: Send Reminder
```javascript
action: send_wechat_template_message
to: {{appointment.patient_wechat}}
template: appointment_reminder_24h
data:
  patient_name: {{appointment.patient_name}}
  appointment_type: {{appointment.type}}
  department: {{appointment.department}}
  doctor: {{appointment.doctor}}
  date: {{format_date(appointment.datetime)}}
  time: {{format_time(appointment.datetime)}}
  location: {{appointment.location}}
  clinic_phone: {{clinic.phone}}
buttons:
  - text: "确认就诊"
    action: "confirm_appointment"
    data:
      appointment_id: {{appointment.id}}
  - text: "需要改期"
    action: "request_reschedule"
    data:
      appointment_id: {{appointment.id}}
  - text: "查看地址"
    action: "show_location"
    data:
      address: {{clinic.address}}
```

### Step 2: Handle Responses

#### If "确认就诊":
```javascript
action: update_appointment
data:
  appointment_id: {{appointment.id}}
  patient_confirmed: true
  confirmed_at: {{now()}}

action: reply_to_patient
message: "已确认：{{appointment.date}} {{appointment.time}} 的{{appointment.type}}。请准时到达，携带身份证和医保卡。"
```

#### If "需要改期":
```javascript
action: show_reschedule_options
message: "请选择新的时间："
options: {{clinic.available_slots}}

# Store request
action: log_reschedule_request
data:
  appointment_id: {{appointment.id}}
  requested_at: {{now()}}
```

#### If "查看地址":
```javascript
action: send_location_card
message: "{{clinic.name}}\n{{clinic.address}}\n\n电话：{{clinic.phone}}"
mini_map: true
```

## Workflow: 2-Hour Reminder

```javascript
action: send_wechat_template_message
to: {{appointment.patient_wechat}}
template: appointment_reminder_2h
data:
  patient_name: {{appointment.patient_name}}
  appointment_type: {{appointment.type}}
  time: {{format_time(appointment.datetime)}}
  department: {{appointment.department}}
  preparation: {{appointment.notes}}

# If no confirmation from 24h reminder
if (!appointment.patient_confirmed) {
  action: add_to_nurse_queue
  data:
    appointment_id: {{appointment.id}}
    issue: "预约未确认"
    priority: "high"
}
```

## Workflow: Post-Appointment Follow-up (3 Days)

```javascript
action: send_wechat_template_message
to: {{appointment.patient_wechat}}
template: post_appointment_followup
data:
  patient_name: {{appointment.patient_name}}
  appointment_type: {{appointment.type}}
  doctor: {{appointment.doctor}}
message: |
  {{patient_name}}，您{{appointment.date}}的{{appointment.type}}已过去3天。
  
  请简单回复：
  1. 目前感觉如何？（好/一般/不好）
  2. 有按时服药吗？（是/否）
  3. 有什么不适吗？
  
  如有紧急情况，请立即联系护士或拨打120。

action: wait_for_response
  timeout: 48 hours
  on_timeout: flag_for_nurse_call
```

### Handle Follow-up Response

```javascript
# Parse patient response
sentiment = analyze_sentiment(message)
medication_compliance = extract_yes_no(message, "服药")
symptoms = extract_symptoms(message)

# Log
action: log_followup
data:
  appointment_id: {{appointment.id}}
  patient_sentiment: {{sentiment}}
  medication_compliance: {{medication_compliance}}
  reported_symptoms: {{symptoms}}
  response_text: {{message}}

# Escalate if needed
if (sentiment == "negative" || symptoms.contains_concerning()) {
  action: flag_for_nurse_review
  priority: "high"
  reason: "患者反馈不适或症状"
}
```

## Workflow: Handle Reschedule Request

```javascript
# Parse patient availability
preferred_dates = extract_dates(message)
preferred_times = extract_times(message)

# Find available slots
available_slots = query_available_slots(
  doctor: {{appointment.doctor}},
  department: {{appointment.department}},
  preferred_dates: preferred_dates,
  limit: 3
)

if (available_slots.length > 0) {
  action: send_options
  message: "以下是可选时间："
  for (slot in available_slots) {
    - "{{slot.date}} {{slot.time}} [选择]"
  }
} else {
  action: reply
  message: "您希望的时间段暂无空位。请联系护士安排：{{clinic.phone}}"
  action: add_to_nurse_queue
}
```

### Confirm New Appointment

```javascript
# When patient selects new slot
action: update_appointment
data:
  appointment_id: {{appointment.id}}
  old_datetime: {{appointment.datetime}}
  new_datetime: {{selected_slot.datetime}}
  reschedule_count: {{appointment.reschedule_count + 1}}

action: send_confirmation
message: "已改期：\n原时间：{{old_datetime}}\n新时间：{{new_datetime}}\n\n请准时就诊。"

action: schedule_new_reminders
for: new_datetime
```

## Safety Guardrails

### No Medical Advice
```javascript
if (message.contains_any(["药", "剂量", "换药", "停药"])) {
  action: reply
  message: "用药问题请咨询您的主治医生或护士。请联系：{{clinic.phone}}"
  action: flag_for_nurse_review
}
```

### Emergency Detection
```javascript
if (message.contains_any(["疼", "痛", "出血", "晕", "急"])) {
  action: reply
  message: "我们已收到您的消息，护士会尽快联系您。如情况紧急，请立即拨打120。"
  action: urgent_escalation
  to: [nurse_on_call, appointment.doctor]
}
```

## Message Templates

### 24-Hour Reminder
```
{{patient_name}}，提醒您明天的预约：

📅 {{date}} {{time}}
🏥 {{department}} {{doctor}}
📍 {{location}}

[确认就诊] [需要改期] [查看地址]
```

### 2-Hour Reminder
```
{{patient_name}}，您的预约即将开始：

⏰ 还有2小时
📅 {{time}} {{type}}
🏥 {{department}}

{{preparation_notes}}

请携带身份证和医保卡，准时到达。
```

### Post-Appointment Follow-up
```
{{patient_name}}，您{{date}}的{{type}}已过去3天。

请问：
1. 目前感觉如何？
2. 有按时服药吗？
3. 有什么不适吗？

简单回复即可，护士会查看您的反馈。
```

## Analytics

### Metrics
- Appointment confirmation rate (预约确认率)
- No-show rate (爽约率)
- Reschedule rate (改期率)
- Follow-up response rate (随访回复率)
- Time-to-confirmation (确认耗时)

### Reports
- Daily: Next-day appointment list
- Weekly: No-show analysis
- Monthly: Department utilization

## Testing

### Test Case: Full Flow
```yaml
appointment:
  datetime: "2025-04-20 09:00"
  type: 复诊
  
schedule:
  - "2025-04-19 09:00": Send 24h reminder
  - patient_response: "确认就诊"
  - "2025-04-20 07:00": Send 2h reminder
  - "2025-04-23 10:00": Send follow-up
  - patient_response: "感觉好多了，按时吃药"
  
expected: All reminders sent, responses logged
```
