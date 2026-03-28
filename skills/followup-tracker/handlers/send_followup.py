#!/usr/bin/env python3
"""发送随访消息"""

from datetime import datetime, timedelta
from pymongo import MongoClient


def handler(event, config):
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    three_days_ago = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")

    visits = db.visits.find({
        "date": three_days_ago,
        "followup_sent": {"$ne": True}
    })

    sent = 0
    for visit in visits:
        patient = db.patients.find_one({"_id": visit['patient_id']})
        if patient and patient.get('wechat_openid'):
            message = f"""🏥 就诊后随访

患者: {patient['name']}
就诊时间: {visit['date']}

您好，您3天前在社区卫生服务中心就诊，现在想了解您的恢复情况：

1. 症状是否缓解？
2. 是否有新的不适？
3. 服药是否有不良反应？

[症状好转] [仍有不适] [需要复诊]"""

            print(f"[发送随访] {patient['name']}")
            sent += 1

            db.followups.insert_one({
                "patient_id": visit['patient_id'],
                "visit_id": visit['_id'],
                "sent_at": datetime.now(),
                "status": "sent",
                "responses": []
            })

            db.visits.update_one(
                {"_id": visit['_id']},
                {"$set": {"followup_sent": True}}
            )

    client.close()
    return {"status": "success", "sent": sent}
