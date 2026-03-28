#!/usr/bin/env python3
"""
Handle Patient Response Handler
处理患者对用药提醒的响应
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Any
from pymongo import MongoClient


def handler(event: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """
    处理患者响应

    Args:
        event: {
            "patient_id": str,
            "reminder_id": str,
            "action": "confirm" | "snooze",
            "wechat_openid": str
        }
        config: 技能配置
    """
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    patient_id = event.get('patient_id')
    reminder_id = event.get('reminder_id')
    action = event.get('action')  # 'confirm' or 'snooze'

    if not all([patient_id, reminder_id, action]):
        return {
            "status": "error",
            "message": "Missing required fields: patient_id, reminder_id, or action"
        }

    # 查找提醒记录
    reminder = db.reminders.find_one({
        "_id": reminder_id,
        "patient_id": patient_id
    })

    if not reminder:
        return {
            "status": "error",
            "message": "Reminder not found"
        }

    patient = db.patients.find_one({"_id": patient_id})

    if not patient:
        return {
            "status": "error",
            "message": "Patient not found"
        }

    now = datetime.now()

    if action == 'confirm':
        # 患者确认已服药
        db.reminders.update_one(
            {"_id": reminder_id},
            {
                "$set": {
                    "status": "confirmed",
                    "confirmed_at": now,
                    "updated_at": now
                }
            }
        )

        # 记录依从性
        adherence_doc = {
            "patient_id": patient_id,
            "patient_name": patient['name'],
            "medication_id": reminder['medication_id'],
            "medication_name": reminder['medication_name'],
            "date": reminder['date'],
            "time_bucket": reminder['time_bucket'],
            "taken": True,
            "confirmed_at": now,
            "confirmed_by": "patient",
            "reminder_id": reminder_id
        }
        db.adherence.insert_one(adherence_doc)

        # 发送确认消息
        message = f"✅ 已记录：{reminder['medication_name']} {reminder.get('dosage', '')}\n继续保持！"

        client.close()

        return {
            "status": "success",
            "action": "confirmed",
            "message": message,
            "patient_name": patient['name'],
            "medication": reminder['medication_name']
        }

    elif action == 'snooze':
        # 患者选择稍后提醒
        snooze_count = reminder.get('snooze_count', 0) + 1
        snooze_until = now + timedelta(minutes=30)

        db.reminders.update_one(
            {"_id": reminder_id},
            {
                "$set": {
                    "status": "snoozed",
                    "snooze_count": snooze_count,
                    "snooze_until": snooze_until,
                    "updated_at": now
                }
            }
        )

        # 发送稍后提醒确认
        message = "⏰ 好的，30分钟后再次提醒。"

        client.close()

        return {
            "status": "success",
            "action": "snoozed",
            "message": message,
            "snooze_until": snooze_until.isoformat(),
            "snooze_count": snooze_count
        }

    else:
        return {
            "status": "error",
            "message": f"Unknown action: {action}"
        }
