from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from app.database import incidents, tickets
from app.auth import get_official_user

router = APIRouter(prefix="/api/analytics")

def _day_key(dt_value):
    if isinstance(dt_value, datetime):
        return dt_value.strftime("%Y-%m-%d")
    if isinstance(dt_value, str) and len(dt_value) >= 10:
        return dt_value[:10]
    return datetime.utcnow().strftime("%Y-%m-%d")

@router.get("/dashboard")
def dashboard(current_user: dict = Depends(get_official_user)):
    total_incidents = incidents.count_documents({})
    open_incidents = incidents.count_documents({"status": "open"})
    in_progress_incidents = incidents.count_documents({"status": "in_progress"})
    resolved_incidents = incidents.count_documents({"status": "resolved"})
    total_tickets = tickets.count_documents({})
    open_tickets = tickets.count_documents({"status": "open"})
    in_progress_tickets = tickets.count_documents({"status": "in_progress"})
    resolved_tickets = tickets.count_documents({"status": "resolved"})
    category_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    categories = list(incidents.aggregate(category_pipeline))
    by_category = [{"category": item["_id"] or "unknown", "count": item["count"]} for item in categories]
    productivity_pipeline = [
        {"$match": {"assignedTo": {"$exists": True, "$ne": None}}},
        {"$group": {
            "_id": "$assignedTo",
            "total": {"$sum": 1},
            "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "resolved"]}, 1, 0]}},
            "inProgress": {"$sum": {"$cond": [{"$eq": ["$status", "in_progress"]}, 1, 0]}},
            "open": {"$sum": {"$cond": [{"$eq": ["$status", "open"]}, 1, 0]}}
        }},
        {"$sort": {"resolved": -1}}
    ]
    workers = list(tickets.aggregate(productivity_pipeline))
    worker_productivity = []
    for worker in workers:
        total = worker.get("total", 0)
        resolved = worker.get("resolved", 0)
        rate = round((resolved / total) * 100, 2) if total > 0 else 0
        worker_productivity.append({
            "worker": worker["_id"],
            "total": total,
            "resolved": resolved,
            "open": worker.get("open", 0),
            "inProgress": worker.get("inProgress", 0),
            "resolutionRate": rate
        })
    city_cleanliness_score = round((resolved_incidents / total_incidents) * 100, 2) if total_incidents > 0 else 0
    safety_incident_count = incidents.count_documents({"category": {"$in": ["safety", "fire", "emergency", "crowd"]}})
    safety_index = max(0, round(100 - (safety_incident_count * 3), 2))
    return {
        "success": True,
        "data": {
            "incidents": {
                "total": total_incidents,
                "open": open_incidents,
                "inProgress": in_progress_incidents,
                "resolved": resolved_incidents
            },
            "tickets": {
                "total": total_tickets,
                "open": open_tickets,
                "inProgress": in_progress_tickets,
                "resolved": resolved_tickets
            },
            "cityCleanlinessScore": city_cleanliness_score,
            "safetyIndex": safety_index,
            "byCategory": by_category,
            "workerProductivity": worker_productivity
        }
    }

@router.get("/heatmap")
def heatmap(current_user: dict = Depends(get_official_user)):
    points = []
    cursor = incidents.find({"latitude": {"$ne": None}, "longitude": {"$ne": None}}, {
        "latitude": 1,
        "longitude": 1,
        "priority": 1,
        "status": 1,
        "category": 1
    })
    priority_weights = {"low": 0.5, "medium": 1.0, "high": 1.5, "critical": 2.0}
    for row in cursor:
        lat = row.get("latitude")
        lng = row.get("longitude")
        if lat is None or lng is None:
            continue
        weight = priority_weights.get((row.get("priority") or "medium").lower(), 1.0)
        if row.get("status") == "resolved":
            weight = max(0.2, weight - 0.6)
        points.append({
            "lat": lat,
            "lng": lng,
            "weight": weight,
            "category": row.get("category"),
            "status": row.get("status")
        })
    return {"success": True, "data": points}

@router.get("/trends")
def trends(days: int = 14, current_user: dict = Depends(get_official_user)):
    days = min(max(days, 7), 60)
    now = datetime.utcnow().date()
    labels = []
    stats_map = {}
    for i in range(days):
        day = now - timedelta(days=(days - i - 1))
        key = day.strftime("%Y-%m-%d")
        labels.append(key)
        stats_map[key] = {"date": key, "created": 0, "resolved": 0}
    cursor = incidents.find({}, {"createdAt": 1, "updatedAt": 1, "status": 1})
    for row in cursor:
        created_key = _day_key(row.get("createdAt"))
        if created_key in stats_map:
            stats_map[created_key]["created"] += 1
        if row.get("status") == "resolved":
            resolved_key = _day_key(row.get("updatedAt"))
            if resolved_key in stats_map:
                stats_map[resolved_key]["resolved"] += 1
    trend = [stats_map[key] for key in labels]
    return {"success": True, "data": trend}
