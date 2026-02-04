# app/analytics/serialization.py

import pandas as pd
import numpy as np
import json
from datetime import datetime
from typing import Any, Dict


def safe_serialize(obj: Any) -> Any:
    """
    Safely serialize objects for MongoDB storage
    Converts all non-string keys to strings and handles numpy types
    """
    if isinstance(obj, dict):
        # Convert all keys to strings and recursively serialize values
        return {str(k): safe_serialize(v) for k, v in obj.items()}
    
    elif isinstance(obj, (list, tuple)):
        return [safe_serialize(item) for item in obj]
    
    elif isinstance(obj, (np.integer, int)):
        return int(obj)
    
    elif isinstance(obj, (np.floating, float)):
        if pd.isna(obj) or np.isinf(obj):
            return None
        return float(obj)
    
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    
    elif isinstance(obj, (pd.Timestamp, datetime)):
        return obj.isoformat()
    
    elif pd.isna(obj):
        return None
    
    elif isinstance(obj, str):
        return obj
    
    elif isinstance(obj, bool):
        return obj
    
    else:
        # Try to convert to string as fallback
        try:
            return str(obj)
        except:
            return None


def prepare_analytics_for_storage(analytics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare analytics data for MongoDB storage by ensuring all keys are strings
    and all values are JSON serializable
    """
    try:
        # Deep serialize the entire analytics object
        serialized = safe_serialize(analytics)
        
        # Additional validation for common problematic areas
        if 'correlation_analysis' in serialized:
            corr_data = serialized['correlation_analysis']
            if 'correlation_matrix' in corr_data:
                # Ensure correlation matrix has string keys
                matrix = corr_data['correlation_matrix']
                if isinstance(matrix, dict):
                    corr_data['correlation_matrix'] = {
                        str(k1): {str(k2): v2 for k2, v2 in v1.items()} if isinstance(v1, dict) else v1
                        for k1, v1 in matrix.items()
                    }
        
        if 'outlier_analysis' in serialized:
            outlier_data = serialized['outlier_analysis']
            if 'outliers_by_column' in outlier_data:
                # Ensure outlier column keys are strings
                outliers_by_col = outlier_data['outliers_by_column']
                if isinstance(outliers_by_col, dict):
                    outlier_data['outliers_by_column'] = {
                        str(k): v for k, v in outliers_by_col.items()
                    }
        
        if 'statistics' in serialized:
            # Ensure statistics column keys are strings
            stats = serialized['statistics']
            if isinstance(stats, dict):
                serialized['statistics'] = {
                    str(k): v for k, v in stats.items()
                }
        
        if 'categorical' in serialized:
            # Ensure categorical column keys are strings
            categorical = serialized['categorical']
            if isinstance(categorical, dict):
                serialized['categorical'] = {
                    str(k): v for k, v in categorical.items()
                }
        
        if 'columns' in serialized:
            # Ensure column profile keys are strings
            columns = serialized['columns']
            if isinstance(columns, dict):
                serialized['columns'] = {
                    str(k): v for k, v in columns.items()
                }
        
        return serialized
        
    except Exception as e:
        print(f"Error in prepare_analytics_for_storage: {e}")
        # Return a minimal safe structure
        return {
            "error": "Serialization failed",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


def validate_mongodb_document(doc: Dict[str, Any]) -> bool:
    """
    Validate that a document is safe for MongoDB storage
    """
    try:
        # Try to serialize to JSON as a test
        json.dumps(doc, default=str)
        
        # Check for non-string keys
        def check_keys(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    if not isinstance(key, str):
                        print(f"Non-string key found at {path}: {key} (type: {type(key)})")
                        return False
                    if not check_keys(value, f"{path}.{key}"):
                        return False
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    if not check_keys(item, f"{path}[{i}]"):
                        return False
            return True
        
        return check_keys(doc)
        
    except Exception as e:
        print(f"Document validation failed: {e}")
        return False