#!/usr/bin/env python3
"""发送每周摘要给家属"""

from datetime import datetime, timedelta
from pymongo import MongoClient


def handler(event, config):
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    week_end = datetime.now()
    week_start = week_end - timedelta(days=7)

    patients = db.patients.find({"caregiver_openid": {"$exists": True}})

    sent = 0
    for patient in patients:
        adherence = db.adherence.find({
            "patient_id": patient['_id'],
            "date": {
                "$gte": week_start.strftime("%Y-%m-%d"),
                "$lte": week_end.strftime("%Y-%m-%d")
            }
        })

        total = adherence.count()
        taken = db.adherence.count_documents({
            "patient_id": patient['_id'],
            "date": {
                "$gte": week_start.strftime("%Y-%m-%d"),
                "$lte": week_end.strftime("%Y-%m-%d")
            },
            "taken": True
        })

        rate = (taken / total * 100) if total > 0 else 0

        status = "✅ 依从性良好" if rate >= 80 else "⚠️ 依从性需关注" if rate >= 60 else "❌ 依从性较差"

        message = f"""📊 本周用药报告

患者: {patient['name']}
周期: {week_start.strftime('%m/%d')} - {week_end.strftime('%m/%d')}

本周服药依从率: {rate:.1f}%
应服药次数: {total}
实际服药次数: {taken}

{status}

[查看详情]"""

        print(f"[发送周报] {patient['name']} -> caregiver")
        sent += 1

    client.close()
    return {"status": "success", "sent": sent}
