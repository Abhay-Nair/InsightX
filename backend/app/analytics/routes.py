from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db
from app.core.auth import get_current_user
from app.analytics.loader import load_dataset
from app.analytics.cleaning import clean_dataset
from app.analytics.profiling import profile_columns
from app.analytics.statistics import descriptive_statistics
from app.analytics.categorical_stats import categorical_statistics
from app.analytics.health import dataset_health_score
from app.analytics.advanced_stats import calculate_advanced_metrics
from app.analytics.cache import (
    get_cached_analytics,
    save_cached_analytics
)
from datetime import datetime

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/{dataset_id}/summary")
async def get_analytics_summary(
    dataset_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get comprehensive analytics summary"""
    
    try:
        # Check cache first
        cached = get_cached_analytics(db, dataset_id, current_user)
        if cached:
            return cached["analytics"]

        # Load and analyze dataset
        df, metadata = load_dataset(dataset_id, current_user, db)
        
        cleaned_df, cleaning_summary = clean_dataset(df)

        # Generate comprehensive analytics
        analytics = {
            "summary": {
                "dataset_id": dataset_id,
                "total_rows": len(cleaned_df),
                "total_columns": len(cleaned_df.columns),
                "filename": metadata.get("original_filename", metadata.get("filename")),
                "uploaded_at": metadata.get("uploaded_at"),
                "analysis_timestamp": datetime.utcnow().isoformat()
            },
            "cleaning_summary": cleaning_summary,
            "columns": profile_columns(cleaned_df),
            "statistics": descriptive_statistics(cleaned_df),
            "categorical": categorical_statistics(cleaned_df),
            "health": dataset_health_score(cleaned_df),
            "advanced_metrics": calculate_advanced_metrics(cleaned_df)
        }

        # Cache results
        save_cached_analytics(db, dataset_id, current_user, analytics)
        
        return analytics

    except HTTPException:
        raise
    except Exception as e:
        print(f"Analytics generation failed for {dataset_id}: {e}")
        raise HTTPException(status_code=500, detail="Analytics generation failed")


@router.get("/{dataset_id}/advanced")
async def get_advanced_analytics(
    dataset_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get advanced analytics metrics"""
    
    try:
        # Load dataset
        df, metadata = load_dataset(dataset_id, current_user, db)
        
        cleaned_df, _ = clean_dataset(df)
        
        # Calculate advanced metrics
        advanced_metrics = calculate_advanced_metrics(cleaned_df)
        
        return {
            "dataset_id": dataset_id,
            "filename": metadata.get("original_filename", metadata.get("filename")),
            "advanced_metrics": advanced_metrics,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Advanced analytics failed for {dataset_id}: {e}")
        raise HTTPException(status_code=500, detail="Advanced analytics failed")


@router.post("/{dataset_id}/refresh")
async def refresh_analytics_cache(
    dataset_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Refresh analytics cache"""
    
    try:
        # Verify dataset ownership
        datasets_collection = db.datasets
        dataset = datasets_collection.find_one({
            "dataset_id": dataset_id,
            "user_email": current_user
        })
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Clear existing cache
        cache_collection = db.analytics_cache
        result = cache_collection.delete_many({
            "dataset_id": dataset_id,
            "user_email": current_user
        })
        
        # Regenerate analytics
        return await get_analytics_summary(dataset_id, current_user, db)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Cache refresh failed for {dataset_id}: {e}")
        raise HTTPException(status_code=500, detail="Cache refresh failed")