#!/usr/bin/env python3
"""
Escalation Handler
升级超时未确认的提醒
"""

from datetime import datetime, timedelta
from typing import Dict, Any
from pymongo import MongoClient


def send_wechat_message(to_openid: str, message: str, config: Dict) -> bool:
    """发送微信消息 (模拟)"""
    print(f"[模拟发送] To: {to_openid}")
    print(f"Message: {message[:100]}...")
    return True


def handler(event: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """
    检查并升级超时的提醒

    每30分钟运行一次
    """
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    # 查找2小时前发送但未被确认的提醒
    two_hours_ago = datetime.now() - timedelta(hours=2)

    overdue_reminders = db.reminders.find({
        "status": "sent",
        "sent_at": {"$lte": two_hours_ago},
        "escalated": {"$ne": True}
    })

    escalated_count = 0
    errors = []

    for reminder in overdue_reminders:
        try:
            patient = db.patients.find_one({"_id": reminder['patient_id']})

            if not patient:
                continue

            # 更新提醒状态
            db.reminders.update_one(
                {"_id": reminder['_id']},
                {
                    "$set": {
                        "status": "missed",
                        "escalated": True,
                        "escalated_at": datetime.now()
                    }
                }
            )

            # 记录未依从
            adherence_doc = {
                "patient_id": reminder['patient_id'],
                "patient_name": patient['name'],
                "medication_id": reminder['medication_id'],
                "medication_name": reminder['medication_name'],
                "date": reminder['date'],
                "time_bucket": reminder['time_bucket'],
                "taken": False,
                "reason": "no_response",
                "missed_at": datetime.now()
            }
            db.adherence.insert_one(adherence_doc)

            # 升级给家属（如果有）
            caregiver_openid = patient.get('caregiver_openid')
            if caregiver_openid:
                missed_duration = "2小时"
                message = f"""提醒：{patient['name']} 尚未确认服药

💊 {reminder['medication_name']}
⏰ 应于 {reminder['scheduled_time']} 服用
⏱️ 已超时 {missed_duration}

[查看详情] [联系患者]"""

                send_wechat_message(caregiver_openid, message, config)

                # 记录升级
                db.escalations.insert_one({
                    "reminder_id": reminder['_id'],
                    "patient_id": reminder['patient_id'],
                    "escalated_to": "caregiver",
                    "escalated_at": datetime.now(),
                    "message": message
                })

            # 添加到护士队列
            db.nurse_queue.insert_one({
                "patient_id": reminder['patient_id'],
                "patient_name": patient['name'],
                "medication_name": reminder['medication_name'],
                "issue": "未确认服药",
                "priority": "medium",
                "created_at": datetime.now(),
                "status": "pending",
                "reminder_id": reminder['_id']
            })

            escalated_count += 1

        except Exception as e:
            errors.append({
                "reminder_id": str(reminder['_id']),
                "error": str(e)
            })

    client.close()

    return {
        "status": "success",
        "escalated": escalated_count,
        "errors": errors
    }
