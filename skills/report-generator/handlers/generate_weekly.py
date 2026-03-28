#!/usr/bin/env python3
"""生成周报"""

from datetime import datetime, timedelta
from pymongo import MongoClient
import json


def handler(event, config):
    client = MongoClient(config['mongodb_uri'])
    db = client.chronic_care

    week_end = datetime.now()
    week_start = week_end - timedelta(days=7)

    # 统计指标
    total_patients = db.patients.count_documents({"status": "active"})

    adherence_data = list(db.adherence.find({
        "date": {
            "$gte": week_start.strftime("%Y-%m-%d"),
            "$lte": week_end.strftime("%Y-%m-%d")
        }
    }))

    total_reminders = len(adherence_data)
    confirmed = sum(1 for a in adherence_data if a['taken'])
    adherence_rate = (confirmed / total_reminders * 100) if total_reminders > 0 else 0

    report = {
        "type": "weekly",
        "period": f"{week_start.strftime('%Y-%m-%d')} to {week_end.strftime('%Y-%m-%d')}",
        "generated_at": datetime.now().isoformat(),
        "metrics": {
            "total_patients": total_patients,
            "total_reminders_sent": total_reminders,
            "confirmed_doses": confirmed,
            "adherence_rate": round(adherence_rate, 2),
            "missed_doses": total_reminders - confirmed
        }
    }

    db.reports.insert_one(report)

    client.close()
    return {"status": "success", "report": report}
