# Skill: Follow-up Tracker
# 随访跟踪技能

## Purpose
跟踪患者就诊后的恢复情况，收集反馈，识别需要护士关注的情况。

## Triggers

### 1. Post-Appointment Follow-up (3 Days)
```yaml
trigger: cron
schedule: "0 10 * * *"  # 每天上午10点
timezone: Asia/Shanghai
condition: appointment.date == 3 days ago AND appointment.type == "复诊"
```

### 2. Post-Discharge Follow-up (7 Days)
```yaml
trigger: cron
schedule: "0 10 * * *"
timezone: Asia/Shanghai
condition: discharge.date == 7 days ago
```

### 3. Medication Side Effect Check (14 Days)
```yaml
trigger: cron
schedule: "0 10 * * *"
timezone: Asia/Shanghai
condition: new_medication.date == 14 days ago
```

## Context Required

```json
{
  "patient": {
    "id": "string",
    "name": "string",
    "wechat_openid": "string",
    "age": "number",
    "conditions": ["高血压", "糖尿病"]
  },
  "appointment": {
    "id": "string",
    "date": "date",
    "type": "string",
    "doctor": "string",
    "diagnosis": "string",
    "medications_added": ["药名"],
    "notes": "string"
  },
  "followup": {
    "id": "string",
    "type": "post_appointment|post_discharge|medication_check",
    "scheduled_date": "date"
  }
}
```

## Workflow: Post-Appointment Follow-up

### Step 1: Send Follow-up Message

```javascript
action: send_wechat_template_message
to: {{patient.wechat_openid}}
template: followup_post_appointment
data:
  patient_name: {{patient.name}}
  appointment_date: {{appointment.date}}
  days_since: 3
  doctor: {{appointment.doctor}}
  
message: |
  {{patient_name}}您好，
  
  您{{appointment.date}}在{{appointment.doctor}}医生处就诊，现已过去3天。
  
  我们想了解您的恢复情况：
  
  1️⃣ 您目前感觉如何？
     A. 好多了  B. 差不多  C. 不太好
  
  2️⃣ 有按时服用医生开的药吗？
     A. 是的  B. 偶尔忘记  C. 没有吃
  
  3️⃣ 有什么不舒服吗？（如：头晕、恶心、疼痛等）
     A. 没有  B. 有一点  C. 比较严重
  
  请回复数字+字母，例如："1A 2A 3A"
  
  如有紧急情况，请立即拨打护士电话：{{clinic_phone}}
  或前往急诊。

action: log_followup_sent
data:
  followup_id: {{followup.id}}
  patient_id: {{patient.id}}
  sent_at: {{now()}}
  expected_response: true
```

### Step 2: Parse Patient Response

```javascript
# Example response: "1A 2B 3A" or "好多了 按时吃 没有不舒服"

response_text = message.content

# Extract answers
answers = parse_followup_response(response_text)
# Returns: { q1: "A", q2: "B", q3: "A" }

# Map to meaning
sentiment_map = {
  "A": "improved",
  "B": "same", 
  "C": "worse"
}

adherence_map = {
  "A": "perfect",
  "B": "partial",
  "C": "none"
}

symptoms_map = {
  "A": "none",
  "B": "mild",
  "C": "severe"
}

result = {
  overall_sentiment: sentiment_map[answers.q1],
  medication_adherence: adherence_map[answers.q2],
  symptoms: symptoms_map[answers.q3],
  free_text: extract_free_text(response_text)
}
```

### Step 3: Analyze and Route

```javascript
# Log the response
action: log_followup_response
data:
  followup_id: {{followup.id}}
  patient_id: {{patient.id}}
  sentiment: {{result.overall_sentiment}}
  adherence: {{result.medication_adherence}}
  symptoms: {{result.symptoms}}
  response_text: {{response_text}}
  responded_at: {{now()}}

# Determine action based on responses
if (result.overall_sentiment == "worse" || result.symptoms == "severe") {
  # Urgent - nurse needs to call
  action: urgent_nurse_escalation
  data:
    patient_id: {{patient.id}}
    patient_name: {{patient.name}}
    phone: {{patient.phone}}
    reason: "患者反馈症状严重或感觉变差"
    followup_responses: {{result}}
    priority: "urgent"
    
  action: reply_to_patient
  message: "收到您的回复。护士会尽快电话联系您，请保持手机畅通。如感觉很不舒服，请立即前往医院。"
  
} else if (result.medication_adherence == "none" || result.symptoms == "mild") {
  # Moderate - add to nurse callback list
  action: add_to_nurse_queue
  data:
    patient_id: {{patient.id}}
    patient_name: {{patient.name}}
    reason: "未按时服药或有轻微不适"
    priority: "medium"
    callback_within: "24 hours"
    
  action: reply_to_patient
  message: "收到您的回复。护士会在1-2天内电话了解情况。请尽量按时服药，如有疑问可随时联系我们：{{clinic_phone}}"
  
} else if (result.overall_sentiment == "improved" && result.medication_adherence == "perfect") {
  # Good - positive reinforcement
  action: reply_to_patient
  message: "太好了！很高兴听到您感觉好转。请继续保持，按时服药。下次复诊见！"
  
} else {
  # Neutral - standard response
  action: reply_to_patient
  message: "收到您的回复，已记录。请继续按医嘱治疗，如有变化请随时联系我们。"
}
```

### Step 4: Handle No Response

```javascript
action: wait_for_response
  timeout: 48 hours
  
# If no response after 48h
action: log_followup_no_response
data:
  followup_id: {{followup.id}}
  patient_id: {{patient.id}}
  
action: add_to_nurse_queue
data:
  patient_id: {{patient.id}}
  patient_name: {{patient.name}}
  reason: "随访未回复"
  priority: "low"
  action: "phone_call"
  
action: send_final_reminder
to: {{patient.wechat_openid}}
message: "{{patient_name}}，我们之前询问您的恢复情况，尚未收到回复。护士可能会电话联系您。如有问题请随时拨打：{{clinic_phone}}"
```

## Workflow: Medication Side Effect Check

```javascript
# Triggered 14 days after new medication prescribed

action: send_wechat_message
to: {{patient.wechat_openid}}
message: |
  {{patient_name}}，您{{medication.date}}开始服用{{medication.name}}，现已两周。
  
  请问：
  1. 服药后有什么不舒服吗？
     A. 没有  B. 轻微不适  C. 明显不适
  
  2. 不适的具体表现：（如头晕、恶心、皮疹等）
     请简单描述，或回复"无"
  
  3. 您是否继续服药？
     A. 是的  B. 已停药
  
  请回复数字+答案
  
  注意：如有严重不适，请立即停药并联系医生！

# Parse and escalate if needed
if (response.contains("停药") || response.contains("明显不适")) {
  action: urgent_escalation
  reason: "患者可能因副作用停药"
  to: [prescribing_doctor, head_nurse]
}
```

## Safety Guardrails

### No Diagnosis
```javascript
if (message.contains_any(["我这是什么病", "我得了什么病", "严重吗", "会不会死"])) {
  action: reply
  message: "我无法诊断病情。请直接联系您的主治医生或到院就诊。紧急情况请拨打120。"
  action: flag_for_nurse_review
}
```

### Medication Questions
```javascript
if (message.contains_any(["这个药还要吃多久", "可以减量吗", "可以换成别的药吗"])) {
  action: reply
  message: "用药调整需要医生决定。请联系{{appointment.doctor}}医生或到院复诊。"
  action: add_to_nurse_queue
}
```

## Analytics

### Metrics
- Follow-up response rate (随访回复率)
- Patient-reported improvement rate (患者自报改善率)
- Medication adherence self-report (用药依从性自报)
- Symptom report rate (症状报告率)
- Nurse escalation rate (护士升级率)

### Reports
- Weekly: Follow-up completion summary
- Monthly: Patient-reported outcomes by doctor
- Monthly: Medication adherence trends

## Message Templates

### Post-Appointment Follow-up
```
{{patient_name}}您好，

您{{date}}就诊后已过去3天。

请花1分钟回复以下问题：
1️⃣ 感觉如何？（A.好多了 B.差不多 C.不太好）
2️⃣ 按时服药？（A.是的 B.偶尔忘 C.没吃）
3️⃣ 有不舒服？（A.没有 B.有一点 C.比较严重）

回复如：1A 2A 3A

紧急情况请拨打：{{phone}}
```

### Medication Side Effect Check
```
{{patient_name}}，您服用{{medication}}已两周。

1. 有副作用？（A.没有 B.轻微 C.明显）
2. 继续服药？（A.是的 B.已停）

如有严重不适，请立即联系医生！
```

## Testing

### Test Case: Positive Response
```yaml
patient: 王先生
appointment: 3 days ago
response: "1A 2A 3A"
expected:
  - sentiment: improved
  - adherence: perfect
  - symptoms: none
  - action: positive reinforcement reply
```

### Test Case: Concerning Response
```yaml
patient: 李女士
appointment: 3 days ago
response: "1C 2C 3C 头晕得厉害"
expected:
  - sentiment: worse
  - adherence: none
  - symptoms: severe
  - action: urgent_nurse_escalation
  - message: "护士会尽快联系您"
```

### Test Case: No Response
```yaml
patient: 张先生
sent: 48 hours ago
no_response: true
expected:
  - action: add_to_nurse_queue
  - priority: low
  - action_type: phone_call
```
