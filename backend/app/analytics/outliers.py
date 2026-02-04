# app/analytics/outliers.py

import pandas as pd
import numpy as np
import math
from typing import Dict, Any, List


def safe_float(value):
    """Convert value to float, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return None
    return float(round(value, 4))


def safe_int(value):
    """Convert value to int, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return 0
    return int(value)


def detect_outliers(df: pd.DataFrame) -> Dict[str, Any]:
    """Comprehensive outlier detection using multiple methods"""
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    if numeric_cols.empty:
        return {
            "outlier_summary": {
                "total_outliers": 0,
                "affected_columns": 0,
                "outlier_percentage": 0.0
            },
            "outliers_by_column": {},
            "outlier_methods": []
        }
    
    outliers_by_column = {}
    total_outliers = 0
    affected_columns = 0
    
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 4:  # Need minimum data points
            continue
            
        column_outliers = {
            "column": col,
            "total_values": len(series),
            "methods": {}
        }
        
        # Method 1: IQR (Interquartile Range)
        iqr_outliers = _detect_iqr_outliers(series)
        column_outliers["methods"]["iqr"] = iqr_outliers
        
        # Method 2: Z-Score
        zscore_outliers = _detect_zscore_outliers(series)
        column_outliers["methods"]["zscore"] = zscore_outliers
        
        # Method 3: Modified Z-Score (using median)
        modified_zscore_outliers = _detect_modified_zscore_outliers(series)
        column_outliers["methods"]["modified_zscore"] = modified_zscore_outliers
        
        # Method 4: Isolation Forest (if enough data)
        if len(series) >= 10:
            isolation_outliers = _detect_isolation_outliers(series)
            column_outliers["methods"]["isolation_forest"] = isolation_outliers
        
        # Consensus outliers (detected by multiple methods)
        consensus_outliers = _find_consensus_outliers(column_outliers["methods"])
        column_outliers["consensus_outliers"] = consensus_outliers
        
        # Summary for this column
        column_outliers["summary"] = {
            "total_outliers": len(consensus_outliers["indices"]),
            "outlier_percentage": safe_float((len(consensus_outliers["indices"]) / len(series)) * 100),
            "most_extreme_value": consensus_outliers["most_extreme"],
            "outlier_range": consensus_outliers["range"]
        }
        
        outliers_by_column[col] = column_outliers
        
        if len(consensus_outliers["indices"]) > 0:
            total_outliers += len(consensus_outliers["indices"])
            affected_columns += 1
    
    # Overall summary
    total_data_points = len(df) * len(numeric_cols)
    outlier_percentage = safe_float((total_outliers / total_data_points) * 100) if total_data_points > 0 else 0
    
    return {
        "outlier_summary": {
            "total_outliers": safe_int(total_outliers),
            "affected_columns": safe_int(affected_columns),
            "total_numeric_columns": len(numeric_cols),
            "outlier_percentage": outlier_percentage,
            "severity": _classify_outlier_severity(outlier_percentage)
        },
        "outliers_by_column": outliers_by_column,
        "outlier_methods": [
            "IQR (Interquartile Range)",
            "Z-Score",
            "Modified Z-Score", 
            "Isolation Forest"
        ],
        "recommendations": _generate_outlier_recommendations(outliers_by_column)
    }


def _detect_iqr_outliers(series: pd.Series) -> Dict[str, Any]:
    """Detect outliers using Interquartile Range method"""
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    outlier_mask = (series < lower_bound) | (series > upper_bound)
    outlier_indices = series[outlier_mask].index.tolist()
    outlier_values = series[outlier_mask].tolist()
    
    return {
        "method": "IQR",
        "lower_bound": safe_float(lower_bound),
        "upper_bound": safe_float(upper_bound),
        "outlier_count": len(outlier_indices),
        "outlier_indices": outlier_indices,
        "outlier_values": [safe_float(v) for v in outlier_values],
        "parameters": {
            "Q1": safe_float(Q1),
            "Q3": safe_float(Q3),
            "IQR": safe_float(IQR)
        }
    }


def _detect_zscore_outliers(series: pd.Series, threshold: float = 3.0) -> Dict[str, Any]:
    """Detect outliers using Z-Score method"""
    mean_val = series.mean()
    std_val = series.std()
    
    if std_val == 0:
        return {
            "method": "Z-Score",
            "outlier_count": 0,
            "outlier_indices": [],
            "outlier_values": [],
            "note": "No variation in data (std = 0)"
        }
    
    z_scores = np.abs((series - mean_val) / std_val)
    outlier_mask = z_scores > threshold
    
    outlier_indices = series[outlier_mask].index.tolist()
    outlier_values = series[outlier_mask].tolist()
    outlier_zscores = z_scores[outlier_mask].tolist()
    
    return {
        "method": "Z-Score",
        "threshold": threshold,
        "outlier_count": len(outlier_indices),
        "outlier_indices": outlier_indices,
        "outlier_values": [safe_float(v) for v in outlier_values],
        "outlier_zscores": [safe_float(z) for z in outlier_zscores],
        "parameters": {
            "mean": safe_float(mean_val),
            "std": safe_float(std_val)
        }
    }


def _detect_modified_zscore_outliers(series: pd.Series, threshold: float = 3.5) -> Dict[str, Any]:
    """Detect outliers using Modified Z-Score (median-based)"""
    median_val = series.median()
    mad = np.median(np.abs(series - median_val))  # Median Absolute Deviation
    
    if mad == 0:
        return {
            "method": "Modified Z-Score",
            "outlier_count": 0,
            "outlier_indices": [],
            "outlier_values": [],
            "note": "No variation in data (MAD = 0)"
        }
    
    modified_z_scores = 0.6745 * (series - median_val) / mad
    outlier_mask = np.abs(modified_z_scores) > threshold
    
    outlier_indices = series[outlier_mask].index.tolist()
    outlier_values = series[outlier_mask].tolist()
    outlier_scores = modified_z_scores[outlier_mask].tolist()
    
    return {
        "method": "Modified Z-Score",
        "threshold": threshold,
        "outlier_count": len(outlier_indices),
        "outlier_indices": outlier_indices,
        "outlier_values": [safe_float(v) for v in outlier_values],
        "outlier_scores": [safe_float(s) for s in outlier_scores],
        "parameters": {
            "median": safe_float(median_val),
            "mad": safe_float(mad)
        }
    }


def _detect_isolation_outliers(series: pd.Series, contamination: float = 0.1) -> Dict[str, Any]:
    """Detect outliers using Isolation Forest"""
    try:
        from sklearn.ensemble import IsolationForest
        
        # Reshape for sklearn
        X = series.values.reshape(-1, 1)
        
        # Fit Isolation Forest
        iso_forest = IsolationForest(contamination=contamination, random_state=42)
        outlier_labels = iso_forest.fit_predict(X)
        
        # Get outlier indices (labeled as -1)
        outlier_mask = outlier_labels == -1
        outlier_indices = series[outlier_mask].index.tolist()
        outlier_values = series[outlier_mask].tolist()
        
        # Get anomaly scores
        anomaly_scores = iso_forest.decision_function(X)
        outlier_scores = anomaly_scores[outlier_mask].tolist()
        
        return {
            "method": "Isolation Forest",
            "contamination": contamination,
            "outlier_count": len(outlier_indices),
            "outlier_indices": outlier_indices,
            "outlier_values": [safe_float(v) for v in outlier_values],
            "anomaly_scores": [safe_float(s) for s in outlier_scores]
        }
    
    except ImportError:
        return {
            "method": "Isolation Forest",
            "outlier_count": 0,
            "outlier_indices": [],
            "outlier_values": [],
            "note": "Requires scikit-learn package"
        }
    except Exception as e:
        return {
            "method": "Isolation Forest",
            "outlier_count": 0,
            "outlier_indices": [],
            "outlier_values": [],
            "error": str(e)
        }


def _find_consensus_outliers(methods: Dict[str, Any]) -> Dict[str, Any]:
    """Find outliers detected by multiple methods"""
    all_indices = set()
    method_counts = {}
    
    # Collect all outlier indices from different methods
    for method_name, method_result in methods.items():
        if "outlier_indices" in method_result:
            indices = set(method_result["outlier_indices"])
            all_indices.update(indices)
            
            for idx in indices:
                method_counts[idx] = method_counts.get(idx, 0) + 1
    
    # Consensus: detected by at least 2 methods (or 1 if only 1-2 methods available)
    min_methods = min(2, len([m for m in methods.values() if "outlier_indices" in m]))
    consensus_indices = [idx for idx, count in method_counts.items() if count >= min_methods]
    
    if not consensus_indices:
        return {
            "indices": [],
            "values": [],
            "method_agreement": {},
            "most_extreme": None,
            "range": None
        }
    
    # Get consensus outlier values and find most extreme
    consensus_values = []
    method_agreement = {}
    
    for idx in consensus_indices:
        # Find the value (assuming it's consistent across methods)
        value = None
        for method_result in methods.values():
            if "outlier_indices" in method_result and idx in method_result["outlier_indices"]:
                idx_pos = method_result["outlier_indices"].index(idx)
                if idx_pos < len(method_result["outlier_values"]):
                    value = method_result["outlier_values"][idx_pos]
                    break
        
        if value is not None:
            consensus_values.append(value)
            method_agreement[idx] = method_counts[idx]
    
    # Find most extreme value
    most_extreme = None
    if consensus_values:
        # Calculate distance from median
        median_val = np.median(consensus_values)
        distances = [abs(v - median_val) for v in consensus_values]
        max_distance_idx = np.argmax(distances)
        most_extreme = consensus_values[max_distance_idx]
    
    # Calculate range
    value_range = None
    if len(consensus_values) >= 2:
        value_range = {
            "min": safe_float(min(consensus_values)),
            "max": safe_float(max(consensus_values)),
            "span": safe_float(max(consensus_values) - min(consensus_values))
        }
    
    return {
        "indices": consensus_indices,
        "values": [safe_float(v) for v in consensus_values],
        "method_agreement": method_agreement,
        "most_extreme": safe_float(most_extreme),
        "range": value_range
    }


def _classify_outlier_severity(outlier_percentage: float) -> str:
    """Classify the severity of outlier presence"""
    if outlier_percentage >= 10:
        return "high"
    elif outlier_percentage >= 5:
        return "moderate"
    elif outlier_percentage >= 1:
        return "low"
    else:
        return "minimal"


def _generate_outlier_recommendations(outliers_by_column: Dict[str, Any]) -> List[str]:
    """Generate actionable recommendations based on outlier analysis"""
    recommendations = []
    
    high_outlier_columns = []
    for col, data in outliers_by_column.items():
        if data["summary"]["outlier_percentage"] > 10:
            high_outlier_columns.append(col)
    
    if high_outlier_columns:
        recommendations.append(
            f"Investigate columns with high outlier rates: {', '.join(high_outlier_columns)}"
        )
    
    # Check for extreme outliers
    extreme_outliers = []
    for col, data in outliers_by_column.items():
        if data["summary"]["total_outliers"] > 0:
            # Check if any method detected very extreme values
            for method_name, method_data in data["methods"].items():
                if method_name == "zscore" and "outlier_zscores" in method_data:
                    max_zscore = max(method_data["outlier_zscores"]) if method_data["outlier_zscores"] else 0
                    if max_zscore > 5:
                        extreme_outliers.append(col)
                        break
    
    if extreme_outliers:
        recommendations.append(
            f"Consider data validation for extreme outliers in: {', '.join(extreme_outliers)}"
        )
    
    # General recommendations
    total_affected = len([col for col, data in outliers_by_column.items() 
                         if data["summary"]["total_outliers"] > 0])
    
    if total_affected > len(outliers_by_column) * 0.5:
        recommendations.append(
            "Multiple columns show outliers - consider reviewing data collection process"
        )
    
    if not recommendations:
        recommendations.append("Outlier levels are within normal ranges")
    
    return recommendations