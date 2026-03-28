#!/usr/bin/env python3
"""
Medication Reminder Handler
发送用药提醒消息给患者
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import pymongo
from pymongo import MongoClient


def get_mongodb_client(config: Dict[str, Any]) -> MongoClient:
    """获取MongoDB连接"""
    return MongoClient(config['mongodb_uri'])


def get_patients_for_time_bucket(client: MongoClient, time_bucket: str) -> list:
    """
    获取在指定时间 bucket 需要服药的患者列表

    time_bucket: 早上|中午|晚上|睡前
    """
    db = client.chronic_care

    # 查找在该时间 bucket 有 medication 的患者
    patients = db.patients.find({
        "medications.time_bucket": time_bucket,
        "status": "active",
        "wechat_openid": {"$exists": True}
    })

    return list(patients)


def should_send_reminder(patient: Dict, medication: Dict, today: datetime) -> bool:
    """
    检查是否应该发送提醒（避免重复发送）
    """
    client = get_mongodb_client({})
    db = client.chronic_care

    # 检查今天是否已经发送过该药物的提醒
    existing = db.reminders.find_one({
        "patient_id": patient['_id'],
        "medication_id": medication['_id'],
        "date": today.strftime("%Y-%m-%d"),
        "time_bucket": medication['time_bucket'],
        "status": {"$in": ["sent", "confirmed", "snoozed"]}
    })

    return existing is None


def send_wechat_message(to_openid: str, message: str, config: Dict) -> bool:
    """
    发送微信模板消息
    (实际实现需要接入 WeChat API)
    """
    # TODO: 实现真实的 WeChat API 调用
    # 这里返回模拟成功
    print(f"[模拟发送] To: {to_openid}")
    print(f"Message: {message[:100]}...")
    return True


def handler(event: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """
    主处理函数

    Args:
        event: 触发事件数据
        config: 技能配置

    Returns:
        处理结果
    """
    # 根据 cron trigger 确定时间 bucket
    trigger_name = event.get('trigger_name', '')

    time_bucket_map = {
        'scheduled_morning': '早上',
        'scheduled_noon': '中午',
        'scheduled_evening': '晚上',
        'scheduled_bedtime': '睡前'
    }

    time_bucket = time_bucket_map.get(trigger_name)

    if not time_bucket:
        return {
            "status": "error",
            "message": f"Unknown trigger: {trigger_name}"
        }

    # 连接数据库
    client = get_mongodb_client(config)
    db = client.chronic_care

    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")

    # 获取患者列表
    patients = get_patients_for_time_bucket(client, time_bucket)

    sent_count = 0
    skipped_count = 0
    errors = []

    for patient in patients:
        # 获取该患者在此时间 bucket 的所有药物
        medications = [med for med in patient.get('medications', [])
                      if med['time_bucket'] == time_bucket]

        for medication in medications:
            # 检查是否应该发送
            if not should_send_reminder(patient, medication, today):
                skipped_count += 1
                continue

            try:
                # 构建消息
                with_food_note = "饭后服用" if medication.get('with_food') else ""

                message = f"""{patient['name']}，该吃药了

💊 {medication['name']} {medication['dosage']}
🎯 {medication['purpose']}
⏰ {time_bucket} {with_food_note}

[已服用] [稍后提醒]"""

                # 发送消息
                success = send_wechat_message(
                    patient['wechat_openid'],
                    message,
                    config
                )

                if success:
                    # 记录提醒
                    reminder_doc = {
                        "patient_id": patient['_id'],
                        "patient_name": patient['name'],
                        "medication_id": medication['_id'],
                        "medication_name": medication['name'],
                        "date": today_str,
                        "time_bucket": time_bucket,
                        "scheduled_time": today,
                        "sent_at": datetime.now(),
                        "status": "sent",
                        "snooze_count": 0
                    }
                    db.reminders.insert_one(reminder_doc)
                    sent_count += 1

            except Exception as e:
                errors.append({
                    "patient": patient['name'],
                    "medication": medication['name'],
                    "error": str(e)
                })

    client.close()

    return {
        "status": "success",
        "time_bucket": time_bucket,
        "date": today_str,
        "sent": sent_count,
        "skipped": skipped_count,
        "errors": errors
    }


if __name__ == "__main__":
    # 测试
    test_event = {"trigger_name": "scheduled_morning"}
    test_config = {"mongodb_uri": "mongodb://localhost:27017/"}
    result = handler(test_event, test_config)
    print(json.dumps(result, indent=2, ensure_ascii=False))
