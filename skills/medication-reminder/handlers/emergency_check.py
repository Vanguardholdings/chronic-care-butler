#!/usr/bin/env python3
"""
Emergency Keyword Detection Handler
检测紧急关键词并立即升级
"""

from datetime import datetime
from typing import Dict, Any
from pymongo import MongoClient


EMERGENCY_KEYWORDS = [
    "疼痛", "胸痛", "头晕", "昏倒", "出血",
    "救命", "急", "emergency", "疼", "难受",
    "不行", "不行了", "痛", "晕", "流血"
]


def contains_emergency_keywords(message: str) -> bool:
    """检查消息是否包含紧急关键词"""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in EMERGENCY_KEYWORDS)


def send_wechat_message(to_openid: str, message: str, config: Dict) -> bool:
    """发送微信消息 (模拟)"""
    print(f"[紧急消息发送] To: {to_openid}")
    print(f"Message: {message}")
    return True


def handler(event: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """
    检查消息中的紧急关键词

    Args:
        event: {
            "patient_id": str,
            "message": str,
            "wechat_openid": str
        }
    """
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    patient_id = event.get('patient_id')
    message = event.get('message', '')
    wechat_openid = event.get('wechat_openid')

    if not contains_emergency_keywords(message):
        client.close()
        return {
            "status": "no_action",
            "message": "No emergency keywords detected"
        }

    # 获取患者信息
    patient = db.patients.find_one({"_id": patient_id})

    if not patient:
        client.close()
        return {
            "status": "error",
            "message": "Patient not found"
        }

    # 立即发送紧急响应给患者
    emergency_response = """🚨 我们已收到您的消息，护士会立即与您联系。
如情况紧急，请直接拨打120或前往急诊。"""

    send_wechat_message(wechat_openid, emergency_response, config)

    # 发送警报到护士
    clinic_emergency_phone = config.get('default_clinic_phone', '')
    alert_message = f"""🚨 紧急警报

患者: {patient['name']}
消息: {message}
时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}

请立即联系患者！"""

    # 添加到高优先级护士队列
    db.nurse_queue.insert_one({
        "patient_id": patient_id,
        "patient_name": patient['name'],
        "patient_phone": patient.get('phone', ''),
        "issue": f"紧急: {message[:50]}...",
        "priority": "urgent",
        "created_at": datetime.now(),
        "status": "pending",
        "type": "emergency",
        "original_message": message
    })

    # 记录紧急事件
    db.emergency_logs.insert_one({
        "patient_id": patient_id,
        "patient_name": patient['name'],
        "message": message,
        "detected_keywords": [k for k in EMERGENCY_KEYWORDS if k in message],
        "created_at": datetime.now(),
        "status": "alerted"
    })

    client.close()

    return {
        "status": "emergency_escalated",
        "patient": patient['name'],
        "message": message,
        "response_sent": emergency_response
    }
