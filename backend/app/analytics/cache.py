from datetime import datetime

def get_cached_analytics(db, dataset_id: str, user_email: str):
    return db.analytics_cache.find_one({
        "dataset_id": dataset_id,
        "user_email": user_email,
        "version": "v1"
    })


def save_cached_analytics(db, dataset_id: str, user_email: str, analytics: dict):
    db.analytics_cache.insert_one({
        "dataset_id": dataset_id,
        "user_email": user_email,
        "analytics": analytics,
        "version": "v1",
        "created_at": datetime.utcnow()
    })
