# Skill: Caregiver Alert
# 家属通知技能

## Purpose
当患者出现用药遗漏、未回复随访或紧急情况时，自动通知家属。

## Triggers

### 1. Medication Missed (2 hours)
```yaml
trigger: event
event: medication.no_response
after: 2 hours
```

### 2. Follow-up No Response (48 hours)
```yaml
trigger: event
event: followup.no_response
after: 48 hours
```

### 3. Emergency Detected
```yaml
trigger: message
keywords: ["疼痛", "胸痛", "头晕", "昏倒", "出血", "急", "emergency", "救命"]
```

### 4. Missed Appointment
```yaml
trigger: event
event: appointment.no_show
```

## Context Required

```json
{
  "patient": {
    "id": "string",
    "name": "string",
    "phone": "string",
    "wechat_openid": "string"
  },
  "caregiver": {
    "id": "string",
    "name": "string",
    "relationship": "子女|配偶|其他",
    "wechat_openid": "string",
    "phone": "string",
    "notification_preferences": {
      "medication_missed": true,
      "appointment_reminders": true,
      "followup_alerts": true,
      "emergency_alerts": true
    }
  },
  "alert": {
    "type": "medication_missed|followup_no_response|emergency|missed_appointment",
    "severity": "low|medium|high|urgent",
    "timestamp": "datetime",
    "details": {}
  }
}
```

## Workflow: Medication Missed Alert

```javascript
# Triggered when patient doesn't confirm medication after 2 hours

action: send_wechat_template_message
to: {{caregiver.wechat_openid}}
template: caregiver_medication_alert
data:
  caregiver_name: {{caregiver.name}}
  patient_name: {{patient.name}}
  patient_relationship: {{caregiver.relationship}}
  medication_name: {{alert.details.medication_name}}
  scheduled_time: {{alert.details.scheduled_time}}
  missed_duration: "2小时"
  patient_phone: {{patient.phone}}
  
message: |
  {{caregiver_name}}您好，
  
  {{patient.name}}（您的{{caregiver.relationship}}）尚未确认服药：
  
  💊 {{alert.details.medication_name}}
  ⏰ 应于 {{alert.details.scheduled_time}} 服用
  ⏱️ 已超时 2 小时
  
  建议您：
  1. 致电询问：{{patient.phone}}
  2. 提醒按时服药
  3. 如有特殊情况请告知护士
  
  [查看详细用药计划]
  [联系社区卫生服务中心]

action: log_caregiver_alert
data:
  alert_id: {{alert.id}}
  caregiver_id: {{caregiver.id}}
  patient_id: {{patient.id}}
  alert_type: "medication_missed"
  sent_at: {{now()}}
  severity: "medium"

# Rate limiting: Max 2 alerts per day per patient
if (caregiver_alert_count_today({{patient.id}}) >= 2) {
  action: skip_alert
  reason: "Rate limited - max 2 alerts per day"
}
```

## Workflow: Emergency Alert

```javascript
# Triggered immediately when patient sends emergency keywords

action: send_wechat_template_message
to: {{caregiver.wechat_openid}}
template: caregiver_emergency_alert
data:
  caregiver_name: {{caregiver.name}}
  patient_name: {{patient.name}}
  patient_phone: {{patient.phone}}
  patient_message: {{alert.details.patient_message}}
  
message: |
  🚨 紧急通知
  
  {{caregiver_name}}，{{patient.name}}刚刚发送了可能需要关注的消息：
  
  "{{alert.details.patient_message}}"
  
  请立即：
  1. 联系 {{patient.name}}：{{patient.phone}}
  2. 询问具体情况
  3. 如情况紧急，请立即拨打120
  
  护士站已收到通知并会跟进。
  
  [查看患者位置] [一键拨打120]

action: send_sms_fallback
to: {{caregiver.phone}}
message: "【慢病管家】{{patient.name}}可能遇到紧急情况，请立即联系。点击查看详情：{{link}}"

action: log_emergency_alert
data:
  alert_id: {{alert.id}}
  severity: "urgent"
  sent_at: {{now()}}
  response_required: true

# Also notify on-call nurse immediately
action: notify_nurse_on_call
data:
  patient_id: {{patient.id}}
  patient_name: {{patient.name}}
  patient_phone: {{patient.phone}}
  caregiver_notified: true
  patient_message: {{alert.details.patient_message}}
```

## Workflow: Weekly Summary for Caregiver

```javascript
# Sent every Sunday evening

trigger: cron
schedule: "0 18 * * 0"  # Sunday 6pm
timezone: Asia/Shanghai

# Gather week's data
week_stats = calculate_weekly_stats(
  patient_id: {{patient.id}},
  start_date: {{last_sunday()}},
  end_date: {{today()}}
)

action: send_wechat_template_message
to: {{caregiver.wechat_openid}}
template: caregiver_weekly_summary
data:
  caregiver_name: {{caregiver.name}}
  patient_name: {{patient.name}}
  week_range: "{{last_sunday()}} - {{today()}}"
  
message: |
  📊 {{patient.name}} 本周健康周报
  （{{last_sunday()}} - {{today()}}）
  
  💊 用药情况：
     按时服药：{{week_stats.medication.taken}}/{{week_stats.medication.total}} 次
     依从率：{{week_stats.medication.adherence_rate}}%
     
  📅 预约情况：
     按时就诊：{{week_stats.appointments.attended}}
     爽约：{{week_stats.appointments.missed}}
     
  📋 随访回复：
     已回复：{{week_stats.followups.responded}}
     待回复：{{week_stats.followups.pending}}
  
  {{#if week_stats.medication.adherence_rate < 70}}
  ⚠️ 提醒：本周用药依从率较低，请关注。
  {{/if}}
  
  {{#if week_stats.concerning_events.length > 0}}
  ⚠️ 注意事件：
  {{#each week_stats.concerning_events}}
  - {{this.description}}
  {{/each}}
  {{/if}}
  
  [查看详细报告] [联系护士]

action: log_weekly_summary
data:
  caregiver_id: {{caregiver.id}}
  patient_id: {{patient.id}}
  week_start: {{last_sunday()}}
  week_end: {{today()}}
  adherence_rate: {{week_stats.medication.adherence_rate}}
  sent_at: {{now()}}
```

## Caregiver Preferences Management

```javascript
# Allow caregivers to customize alerts

action: handle_preference_change
when: message.matches("设置通知")

options = [
  "1. 用药提醒 - 当前：{{caregiver.preferences.medication_missed ? '开' : '关'}}",
  "2. 预约提醒 - 当前：{{caregiver.preferences.appointment_reminders ? '开' : '关'}}", 
  "3. 随访提醒 - 当前：{{caregiver.preferences.followup_alerts ? '开' : '关'}}",
  "4. 紧急通知 - 当前：{{caregiver.preferences.emergency_alerts ? '开' : '关'}}"
]

action: reply
message: "请选择要修改的通知类型（回复数字）：\n\n" + options.join("\n")

# Handle selection
if (message == "1") {
  caregiver.preferences.medication_missed = !caregiver.preferences.medication_missed
  action: reply
  message: "用药提醒已" + (caregiver.preferences.medication_missed ? "开启" : "关闭")
}
```

## Alert Throttling & Smart Batching

```javascript
# Prevent alert fatigue

rules:
  # Max 2 medication alerts per day
  - type: medication_missed
    max_per_day: 2
    batch_window: 4 hours  # Batch multiple misses into one alert
    
  # Max 1 follow-up alert per week
  - type: followup_no_response
    max_per_week: 1
    
  # No limit for emergencies
  - type: emergency
    limit: none

# Smart batching example
if (multiple_medication_missed_within_4h) {
  action: send_combined_alert
  message: |
    {{patient.name}}今天有多次用药未确认：
    - 早上8点：二甲双胍
    - 中午12点：氨氯地平
    - 晚上6点：阿司匹林
    
    建议联系了解原因。
}
```

## Message Templates

### Medication Missed
```
{{caregiver_name}}，{{patient.name}}尚未确认服药：

💊 {{medication_name}}
⏰ 应于 {{time}} 服用
⏱️ 已超时 {{duration}}

建议致电询问：{{patient_phone}}
```

### Emergency Alert
```
🚨 紧急通知

{{patient.name}}发送了需要关注的消息：
"{{patient_message}}"

请立即联系：{{patient_phone}}
如情况紧急请拨打120
```

### Weekly Summary
```
📊 {{patient_name}} 本周健康周报

💊 用药：{{taken}}/{{total}} 次 ({{rate}}%)
📅 预约：{{attended}} 次
📋 随访：{{responded}} 回复

{{#if low_adherence}}
⚠️ 本周依从率较低，请关注
{{/if}}
```

## Analytics

### Metrics
- Caregiver alert open rate (家属通知打开率)
- Response time to alerts (家属响应时间)
- Alert fatigue rate (同一患者连续提醒次数)
- Weekly summary engagement (周报查看率)

### Reports
- Weekly: Caregiver engagement by patient
- Monthly: Alert effectiveness (did patient take medication after alert?)
