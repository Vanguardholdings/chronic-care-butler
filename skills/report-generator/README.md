# Skill: Report Generator
# 报告生成技能

## Purpose
生成患者依从性报告和诊所运营报告，供护士和医生查看。

## Triggers

### 1. Weekly Report (Every Friday 5pm)
```yaml
trigger: cron
schedule: "0 17 * * 5"  # Friday 5pm
timezone: Asia/Shanghai
```

### 2. Monthly Report (1st of month, 9am)
```yaml
trigger: cron
schedule: "0 9 1 * *"
timezone: Asia/Shanghai
```

### 3. On-Demand Report (Admin request)
```yaml
trigger: message
pattern: ["生成报告", "查看报告", "统计", "数据"]
from_role: admin
```

## Context Required

```json
{
  "clinic": {
    "id": "string",
    "name": "string",
    "admin_wechat": "string",
    "patient_count": "number",
    "nurse_count": "number"
  },
  "report": {
    "type": "weekly|monthly|on_demand",
    "start_date": "date",
    "end_date": "date",
    "scope": "clinic|department|patient"
  }
}
```

## Workflow: Weekly Clinic Report

### Step 1: Gather Data

```javascript
// Calculate date range (last Monday to today)
week_start = get_last_monday()
week_end = today()

// Query all patients in clinic
patients = db.patients.find({
  clinic_id: {{clinic.id}},
  active: true
})

// Aggregate adherence data
adherence_data = db.adherence.aggregate([
  {
    $match: {
      patient_id: { $in: patients.map(p => p.id) },
      date: { $gte: week_start, $lte: week_end }
    }
  },
  {
    $group: {
      _id: "$patient_id",
      total_reminders: { $sum: 1 },
      confirmed_taken: { $sum: { $cond: ["$taken", 1, 0] } }
    }
  }
])

// Calculate metrics
total_patients = patients.length
patients_with_data = adherence_data.length
total_reminders = sum(adherence_data.map(d => d.total_reminders))
total_confirmed = sum(adherence_data.map(d => d.confirmed_taken))
overall_adherence_rate = total_confirmed / total_reminders * 100

// Categorize patients by adherence
high_adherence = adherence_data.filter(d => d.confirmed/d.total >= 0.9).length
medium_adherence = adherence_data.filter(d => d.confirmed/d.total >= 0.7 && d.confirmed/d.total < 0.9).length
low_adherence = adherence_data.filter(d => d.confirmed/d.total < 0.7).length

// Escalations this week
escalations = db.escalations.count({
  clinic_id: {{clinic.id}},
  created_at: { $gte: week_start, $lte: week_end }
})

// Follow-up completion
followups_sent = db.followups.count({
  clinic_id: {{clinic.id}},
  sent_at: { $gte: week_start, $lte: week_end }
})
followups_responded = db.followups.count({
  clinic_id: {{clinic.id}},
  responded_at: { $gte: week_start, $lte: week_end }
})
followup_response_rate = followups_responded / followups_sent * 100
```

### Step 2: Generate Report

```javascript
report = {
  period: "{{week_start}} - {{week_end}}",
  generated_at: {{now()}},
  
  summary: {
    total_patients: total_patients,
    active_patients: patients_with_data,
    overall_adherence_rate: round(overall_adherence_rate, 1),
    total_reminders_sent: total_reminders,
    total_confirmations: total_confirmed
  },
  
  adherence_breakdown: {
    high: {
      count: high_adherence,
      percentage: round(high_adherence / patients_with_data * 100, 1),
      label: "优秀 (≥90%)"
    },
    medium: {
      count: medium_adherence,
      percentage: round(medium_adherence / patients_with_data * 100, 1),
      label: "良好 (70-90%)"
    },
    low: {
      count: low_adherence,
      percentage: round(low_adherence / patients_with_data * 100, 1),
      label: "需关注 (<70%)"
    }
  },
  
  alerts: {
    total_escalations: escalations,
    to_caregivers: db.escalations.count({ type: "caregiver", created_at: {...} }),
    to_nurses: db.escalations.count({ type: "nurse", created_at: {...} })
  },
  
  followups: {
    sent: followups_sent,
    responded: followups_responded,
    response_rate: round(followup_response_rate, 1)
  },
  
  top_concerns: get_low_adherence_patients(limit: 5),
  
  nurse_workload_saved: calculate_time_saved(total_reminders)
}
```

### Step 3: Send Report

```javascript
action: send_wechat_template_message
to: {{clinic.admin_wechat}}
template: weekly_report
data:
  clinic_name: {{clinic.name}}
  week_range: report.period
  
message: |
  📊 {{clinic.name}} 本周慢病管理报告
  （{{report.period}}）
  
  ════════════════════════
  
  📈 总体依从性：{{report.summary.overall_adherence_rate}}%
  
  👥 活跃患者：{{report.summary.active_patients}}/{{report.summary.total_patients}}
  
  💊 提醒发送：{{report.summary.total_reminders_sent}} 次
     患者确认：{{report.summary.total_confirmations}} 次
  
  ════════════════════════
  
  📊 依从性分布：
  🟢 优秀 (≥90%)：{{report.adherence_breakdown.high.count}} 人
  🟡 良好 (70-90%)：{{report.adherence_breakdown.medium.count}} 人
  🔴 需关注 (<70%)：{{report.adherence_breakdown.low.count}} 人
  
  ════════════════════════
  
  🔔 本周升级：{{report.alerts.total_escalations}} 次
     → 家属通知：{{report.alerts.to_caregivers}} 次
     → 护士跟进：{{report.alerts.to_nurses}} 次
  
  📋 随访回复率：{{report.followups.response_rate}}%
     ({{report.followups.responded}}/{{report.followups.sent}})
  
  ════════════════════════
  
  ⚠️ 需重点关注患者：
  {{#each report.top_concerns}}
  {{@index + 1}}. {{this.name}} - 依从性 {{this.adherence_rate}}%
  {{/each}}
  
  ════════════════════════
  
  ⏱️ 估算节省护士时间：{{report.nurse_workload_saved}} 小时
  
  [查看完整报告] [导出Excel] [查看详细患者列表]

action: save_report
data:
  clinic_id: {{clinic.id}}
  type: "weekly"
  content: report
  generated_at: {{now()}}
```

## Monthly Government KPI Report

```javascript
// Government-required metrics
kpi_report = {
  period: "{{month_start}} - {{month_end}}",
  
  // Chronic disease management KPIs
  hypertension_management: {
    total_patients: count_hypertension_patients(),
    regular_followup_rate: calculate_followup_rate("hypertension"),
    blood_pressure_control_rate: get_bp_control_rate(),
    medication_adherence_rate: get_adherence_rate("hypertension")
  },
  
  diabetes_management: {
    total_patients: count_diabetes_patients(),
    regular_followup_rate: calculate_followup_rate("diabetes"),
    blood_sugar_control_rate: get_bs_control_rate(),
    medication_adherence_rate: get_adherence_rate("diabetes")
  },
  
  // Service metrics
  appointment_utilization: calculate_appointment_utilization(),
  patient_satisfaction: get_satisfaction_score(),
  
  // Digital adoption
  wechat_engagement_rate: calculate_wechat_engagement(),
  digital_followup_completion: report.followups.response_rate
}

action: generate_pdf_report
data: kpi_report
format: "government_kpi_template"

action: notify_admin
message: "月度政府KPI报告已生成，可直接上传至卫健委系统。"
```

## On-Demand Patient Report

```javascript
# When nurse requests specific patient report

patient_report = {
  patient: {
    name: patient.name,
    id: patient.id,
    conditions: patient.conditions,
    caregiver: patient.caregiver_name
  },
  
  medication_adherence: {
    last_7_days: calculate_adherence(patient.id, days: 7),
    last_30_days: calculate_adherence(patient.id, days: 30),
    trend: calculate_trend(patient.id, weeks: 4)
  },
  
  recent_alerts: db.escalations.find({
    patient_id: patient.id,
    created_at: { $gte: 7_days_ago }
  }),
  
  followup_responses: db.followups.find({
    patient_id: patient.id,
    responded_at: { $exists: true }
  }).sort({ responded_at: -1 }).limit(5),
  
  upcoming_appointments: db.appointments.find({
    patient_id: patient.id,
    datetime: { $gte: now() }
  }).sort({ datetime: 1 })
}

action: send_report
to: requesting_nurse
format: "patient_summary"
```

## Time Savings Calculation

```javascript
function calculate_time_saved(total_reminders) {
  // Assumptions:
  // - Manual reminder call: 3 minutes per patient
  // - AI automated reminder: 0 minutes (fully automated)
  // - Nurse review of escalations: 2 minutes per escalation
  
  manual_time_per_reminder = 3  // minutes
  nurse_review_time_per_escalation = 2  // minutes
  
  total_manual_time = total_reminders * manual_time_per_reminder
  total_nurse_review_time = escalations * nurse_review_time_per_escalation
  
  time_saved = total_manual_time - total_nurse_review_time
  
  return {
    hours_saved: round(time_saved / 60, 1),
    manual_calls_avoided: total_reminders,
    nurse_reviews_required: escalations,
    efficiency_gain: round((time_saved / total_manual_time) * 100, 0)
  }
}
```

## Export Functions

```javascript
// Export to Excel for clinic admin
action: export_weekly_excel
data: report
columns: [
  "患者姓名",
  "病种",
  "本周提醒次数",
  "确认次数",
  "依从率",
  "家属通知次数",
  "护士跟进次数",
  "随访回复"
]

// Export to PDF for government submission
action: export_monthly_pdf
data: kpi_report
template: "government_kpi_template"
```

## Analytics Dashboard Data

```javascript
// Real-time metrics for admin dashboard

dashboard_metrics = {
  today: {
    reminders_sent: count_today("reminders.sent"),
    confirmations_received: count_today("reminders.confirmed"),
    escalations_triggered: count_today("escalations"),
    current_adherence_rate: calculate_today_adherence()
  },
  
  this_week: {
    adherence_trend: get_daily_adherence_last_7_days(),
    top_patients_needing_attention: get_low_adherence_patients(limit: 10),
    caregiver_engagement_rate: calculate_caregiver_response_rate()
  },
  
  comparisons: {
    vs_last_week: calculate_week_over_week_change(),
    vs_last_month: calculate_month_over_month_change(),
    vs_clinic_average: compare_to_other_clinics()
  }
}
```

## Message Templates

### Weekly Report
```
📊 {{clinic_name}} 本周慢病管理报告
（{{week_range}}）

📈 总体依从性：{{adherence_rate}}%
👥 活跃患者：{{active_patients}}/{{total_patients}}
💊 提醒发送：{{reminders_sent}} 次

依从性分布：
🟢 优秀：{{high_count}} 人
🟡 良好：{{medium_count}} 人  
🔴 需关注：{{low_count}} 人

⏱️ 节省护士时间：{{hours_saved}} 小时

[查看详细报告]
```

### Monthly KPI Report
```
📋 {{month}} 月度慢病管理KPI报告

高血压管理：
- 规范管理率：{{htn_management_rate}}%
- 血压控制率：{{htn_control_rate}}%
- 用药依从率：{{htn_adherence_rate}}%

糖尿病管理：
- 规范管理率：{{dm_management_rate}}%
- 血糖控制率：{{dm_control_rate}}%
- 用药依从率：{{dm_adherence_rate}}%

报告已生成PDF，可上传卫健委系统。
```
