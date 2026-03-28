#!/usr/bin/env python3
"""24小时预约提醒"""

from datetime import datetime, timedelta
from pymongo import MongoClient


def handler(event, config):
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    tomorrow = datetime.now() + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")

    appointments = db.appointments.find({
        "date": tomorrow_str,
        "status": "scheduled",
        "reminder_24h_sent": {"$ne": True}
    })

    sent = 0
    for appt in appointments:
        patient = db.patients.find_one({"_id": appt['patient_id']})
        if patient and patient.get('wechat_openid'):
            message = f"""📅 明天就诊提醒

患者: {patient['name']}
时间: {appt['time']}
科室: {appt.get('department', '全科')}
医生: {appt.get('doctor_name', '值班医生')}

请携带身份证和医保卡，提前15分钟到达。

[确认就诊] [取消预约]"""

            print(f"[发送24h提醒] {patient['name']}")
            sent += 1

            db.appointments.update_one(
                {"_id": appt['_id']},
                {"$set": {"reminder_24h_sent": True, "reminder_24h_sent_at": datetime.now()}}
            )

    client.close()
    return {"status": "success", "sent": sent}
