#!/usr/bin/env python3
"""2小时预约提醒"""

from datetime import datetime, timedelta
from pymongo import MongoClient


def handler(event, config):
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    today = datetime.now().strftime("%Y-%m-%d")
    two_hours_later = datetime.now() + timedelta(hours=2)

    appointments = db.appointments.find({
        "date": today,
        "status": "confirmed",
        "reminder_2h_sent": {"$ne": True}
    })

    sent = 0
    for appt in appointments:
        appt_time = datetime.strptime(f"{appt['date']} {appt['time']}", "%Y-%m-%d %H:%M")

        if abs((appt_time - two_hours_later).total_seconds()) < 1800:  # 30分钟内
            patient = db.patients.find_one({"_id": appt['patient_id']})
            if patient and patient.get('wechat_openid'):
                message = f"""⏰ 即将就诊

患者: {patient['name']}
时间: {appt['time']} (2小时后)
地点: {appt.get('clinic_address', '社区卫生服务中心')}

请准时到达。"""

                print(f"[发送2h提醒] {patient['name']}")
                sent += 1

                db.appointments.update_one(
                    {"_id": appt['_id']},
                    {"$set": {"reminder_2h_sent": True, "reminder_2h_sent_at": datetime.now()}}
                )

    client.close()
    return {"status": "success", "sent": sent}
