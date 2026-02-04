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
from app.analytics.correlation import calculate_correlation_matrix, calculate_categorical_associations, detect_multicollinearity
from app.analytics.outliers import detect_outliers
from app.analytics.serialization import prepare_analytics_for_storage, validate_mongodb_document
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

        # Generate comprehensive analytics with individual error handling
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
        }
        
        # Add each analytics component with individual error handling
        try:
            analytics["columns"] = profile_columns(cleaned_df)
        except Exception as e:
            print(f"Column profiling failed: {e}")
            analytics["columns"] = {}
        
        try:
            analytics["statistics"] = descriptive_statistics(cleaned_df)
        except Exception as e:
            print(f"Statistics calculation failed: {e}")
            analytics["statistics"] = {}
        
        try:
            analytics["categorical"] = categorical_statistics(cleaned_df)
        except Exception as e:
            print(f"Categorical analysis failed: {e}")
            analytics["categorical"] = {}
        
        try:
            analytics["health"] = dataset_health_score(cleaned_df)
        except Exception as e:
            print(f"Health score calculation failed: {e}")
            analytics["health"] = {"score": 0, "issues": ["Health calculation failed"]}
        
        try:
            analytics["advanced_metrics"] = calculate_advanced_metrics(cleaned_df)
        except Exception as e:
            print(f"Advanced metrics calculation failed: {e}")
            analytics["advanced_metrics"] = {}
        
        try:
            analytics["correlation_analysis"] = calculate_correlation_matrix(cleaned_df)
        except Exception as e:
            print(f"Correlation analysis failed: {e}")
            analytics["correlation_analysis"] = {
                "correlation_matrix": {},
                "strong_correlations": [],
                "correlation_summary": {"total_pairs": 0}
            }
        
        try:
            analytics["categorical_associations"] = calculate_categorical_associations(cleaned_df)
        except Exception as e:
            print(f"Categorical associations failed: {e}")
            analytics["categorical_associations"] = {
                "categorical_associations": {},
                "strong_associations": []
            }
        
        try:
            analytics["outlier_analysis"] = detect_outliers(cleaned_df)
        except Exception as e:
            print(f"Outlier detection failed: {e}")
            analytics["outlier_analysis"] = {
                "outlier_summary": {"total_outliers": 0, "affected_columns": 0},
                "outliers_by_column": {}
            }
        
        try:
            analytics["multicollinearity"] = detect_multicollinearity(cleaned_df)
        except Exception as e:
            print(f"Multicollinearity detection failed: {e}")
            analytics["multicollinearity"] = {"multicollinearity_detected": False}

        # Prepare analytics for MongoDB storage (fix serialization issues)
        safe_analytics = prepare_analytics_for_storage(analytics)
        
        # Validate before saving
        if not validate_mongodb_document(safe_analytics):
            print("Warning: Analytics document failed validation, using fallback")
            # Create a minimal safe version
            safe_analytics = {
                "summary": analytics["summary"],
                "health": analytics.get("health", {}),
                "error": "Some analytics data could not be serialized safely"
            }

        # Cache results
        save_cached_analytics(db, dataset_id, current_user, safe_analytics)
        
        return safe_analytics

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

@router.get("/{dataset_id}/correlation")
async def get_correlation_analysis(
    dataset_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get detailed correlation analysis"""
    try:
        df, metadata = load_dataset(dataset_id, current_user, db)
        cleaned_df, _ = clean_dataset(df)
        
        correlation_data = calculate_correlation_matrix(cleaned_df)
        categorical_associations = calculate_categorical_associations(cleaned_df)
        multicollinearity = detect_multicollinearity(cleaned_df)
        
        return {
            "dataset_id": dataset_id,
            "correlation_analysis": correlation_data,
            "categorical_associations": categorical_associations,
            "multicollinearity": multicollinearity,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Correlation analysis failed: {str(e)}")


@router.get("/{dataset_id}/outliers")
async def get_outlier_analysis(
    dataset_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get detailed outlier analysis"""
    try:
        df, metadata = load_dataset(dataset_id, current_user, db)
        cleaned_df, _ = clean_dataset(df)
        
        outlier_data = detect_outliers(cleaned_df)
        
        return {
            "dataset_id": dataset_id,
            "outlier_analysis": outlier_data,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outlier analysis failed: {str(e)}")


@router.post("/{dataset_id}/refresh")
async def refresh_analytics_cache(
    dataset_id: str,
    current_user: str = Depends(get_current_user),
    db = Depends(get_db)
):
    """Refresh cached analytics for a dataset"""
    try:
        # Clear existing cache
        db.analytics_cache.delete_many({
            "dataset_id": dataset_id,
            "user_email": current_user
        })
        
        # Regenerate analytics
        df, metadata = load_dataset(dataset_id, current_user, db)
        cleaned_df, cleaning_summary = clean_dataset(df)
        
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
            "advanced_metrics": calculate_advanced_metrics(cleaned_df),
            "correlation_analysis": calculate_correlation_matrix(cleaned_df),
            "categorical_associations": calculate_categorical_associations(cleaned_df),
            "outlier_analysis": detect_outliers(cleaned_df),
            "multicollinearity": detect_multicollinearity(cleaned_df)
        }
        
        # Cache new results
        save_cached_analytics(db, dataset_id, current_user, analytics)
        
        return {
            "message": "Analytics cache refreshed successfully",
            "dataset_id": dataset_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache refresh failed: {str(e)}")