# app/analytics/correlation.py

import pandas as pd
import numpy as np
import math
from typing import Dict, Any, List, Tuple


def safe_float(value):
    """Convert value to float, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return None
    return float(round(value, 4))


def calculate_correlation_matrix(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate comprehensive correlation analysis"""
    
    # Get numeric columns only
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.empty or len(numeric_df.columns) < 2:
        return {
            "correlation_matrix": {},
            "strong_correlations": [],
            "correlation_summary": {
                "total_pairs": 0,
                "strong_positive": 0,
                "strong_negative": 0,
                "moderate_correlations": 0
            }
        }
    
    # Calculate correlation matrix
    corr_matrix = numeric_df.corr()
    
    # Convert to serializable format
    correlation_dict = {}
    for col1 in corr_matrix.columns:
        correlation_dict[col1] = {}
        for col2 in corr_matrix.columns:
            corr_value = corr_matrix.loc[col1, col2]
            correlation_dict[col1][col2] = safe_float(corr_value)
    
    # Find strong correlations (excluding self-correlations)
    strong_correlations = []
    correlation_pairs = []
    
    for i, col1 in enumerate(corr_matrix.columns):
        for j, col2 in enumerate(corr_matrix.columns):
            if i < j:  # Avoid duplicates and self-correlation
                corr_value = corr_matrix.loc[col1, col2]
                if not pd.isna(corr_value):
                    correlation_pairs.append({
                        'column1': col1,
                        'column2': col2,
                        'correlation': safe_float(corr_value),
                        'strength': _get_correlation_strength(abs(corr_value)),
                        'direction': 'positive' if corr_value > 0 else 'negative'
                    })
                    
                    # Strong correlations (|r| > 0.7)
                    if abs(corr_value) > 0.7:
                        strong_correlations.append({
                            'column1': col1,
                            'column2': col2,
                            'correlation': safe_float(corr_value),
                            'strength': _get_correlation_strength(abs(corr_value)),
                            'direction': 'positive' if corr_value > 0 else 'negative',
                            'interpretation': _interpret_correlation(corr_value, col1, col2)
                        })
    
    # Summary statistics
    total_pairs = len(correlation_pairs)
    strong_positive = len([c for c in correlation_pairs if c['correlation'] and c['correlation'] > 0.7])
    strong_negative = len([c for c in correlation_pairs if c['correlation'] and c['correlation'] < -0.7])
    moderate_correlations = len([c for c in correlation_pairs if c['correlation'] and 0.3 <= abs(c['correlation']) <= 0.7])
    
    return {
        "correlation_matrix": correlation_dict,
        "strong_correlations": strong_correlations,
        "all_correlations": sorted(correlation_pairs, key=lambda x: abs(x['correlation'] or 0), reverse=True),
        "correlation_summary": {
            "total_pairs": total_pairs,
            "strong_positive": strong_positive,
            "strong_negative": strong_negative,
            "moderate_correlations": moderate_correlations,
            "weak_correlations": total_pairs - strong_positive - strong_negative - moderate_correlations
        }
    }


def _get_correlation_strength(abs_corr: float) -> str:
    """Classify correlation strength"""
    if abs_corr >= 0.9:
        return "very_strong"
    elif abs_corr >= 0.7:
        return "strong"
    elif abs_corr >= 0.5:
        return "moderate"
    elif abs_corr >= 0.3:
        return "weak"
    else:
        return "very_weak"


def _interpret_correlation(corr_value: float, col1: str, col2: str) -> str:
    """Provide business interpretation of correlation"""
    direction = "positively" if corr_value > 0 else "negatively"
    strength = _get_correlation_strength(abs(corr_value))
    
    strength_desc = {
        "very_strong": "very strongly",
        "strong": "strongly", 
        "moderate": "moderately",
        "weak": "weakly",
        "very_weak": "very weakly"
    }
    
    return f"{col1} and {col2} are {strength_desc[strength]} {direction} correlated (r={corr_value:.3f})"


def calculate_categorical_associations(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate associations between categorical variables using Cramér's V"""
    
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns
    
    if len(categorical_cols) < 2:
        return {
            "categorical_associations": {},
            "strong_associations": []
        }
    
    associations = {}
    strong_associations = []
    
    for i, col1 in enumerate(categorical_cols):
        associations[col1] = {}
        for j, col2 in enumerate(categorical_cols):
            if i <= j:  # Include self and avoid duplicates
                if i == j:
                    associations[col1][col2] = 1.0  # Perfect association with self
                else:
                    cramers_v = _calculate_cramers_v(df[col1], df[col2])
                    associations[col1][col2] = safe_float(cramers_v)
                    associations[col2] = associations.get(col2, {})
                    associations[col2][col1] = safe_float(cramers_v)
                    
                    # Strong associations (Cramér's V > 0.5)
                    if cramers_v and cramers_v > 0.5:
                        strong_associations.append({
                            'column1': col1,
                            'column2': col2,
                            'cramers_v': safe_float(cramers_v),
                            'strength': _get_association_strength(cramers_v),
                            'interpretation': f"{col1} and {col2} show {_get_association_strength(cramers_v)} association"
                        })
    
    return {
        "categorical_associations": associations,
        "strong_associations": strong_associations
    }


def _calculate_cramers_v(x: pd.Series, y: pd.Series) -> float:
    """Calculate Cramér's V statistic for categorical association"""
    try:
        # Create contingency table
        contingency_table = pd.crosstab(x, y)
        
        # Calculate chi-square statistic
        chi2 = 0
        n = contingency_table.sum().sum()
        
        for i in range(len(contingency_table.index)):
            for j in range(len(contingency_table.columns)):
                observed = contingency_table.iloc[i, j]
                expected = (contingency_table.iloc[i, :].sum() * contingency_table.iloc[:, j].sum()) / n
                if expected > 0:
                    chi2 += ((observed - expected) ** 2) / expected
        
        # Calculate Cramér's V
        min_dim = min(len(contingency_table.index) - 1, len(contingency_table.columns) - 1)
        if min_dim > 0 and n > 0:
            cramers_v = math.sqrt(chi2 / (n * min_dim))
            return min(cramers_v, 1.0)  # Cap at 1.0
        
        return 0.0
    except:
        return 0.0


def _get_association_strength(cramers_v: float) -> str:
    """Classify association strength for Cramér's V"""
    if cramers_v >= 0.8:
        return "very_strong"
    elif cramers_v >= 0.6:
        return "strong"
    elif cramers_v >= 0.4:
        return "moderate"
    elif cramers_v >= 0.2:
        return "weak"
    else:
        return "very_weak"


def detect_multicollinearity(df: pd.DataFrame) -> Dict[str, Any]:
    """Detect multicollinearity issues using VIF (Variance Inflation Factor)"""
    
    numeric_df = df.select_dtypes(include=[np.number]).dropna()
    
    if numeric_df.empty or len(numeric_df.columns) < 2:
        return {
            "multicollinearity_detected": False,
            "vif_scores": {},
            "problematic_variables": []
        }
    
    try:
        from statsmodels.stats.outliers_influence import variance_inflation_factor
        
        vif_scores = {}
        problematic_vars = []
        
        for i, col in enumerate(numeric_df.columns):
            try:
                vif = variance_inflation_factor(numeric_df.values, i)
                vif_scores[col] = safe_float(vif) if not math.isinf(vif) else None
                
                # VIF > 10 indicates multicollinearity
                if vif and vif > 10:
                    problematic_vars.append({
                        'variable': col,
                        'vif_score': safe_float(vif),
                        'severity': 'high' if vif > 20 else 'moderate'
                    })
            except:
                vif_scores[col] = None
        
        return {
            "multicollinearity_detected": len(problematic_vars) > 0,
            "vif_scores": vif_scores,
            "problematic_variables": problematic_vars
        }
    
    except ImportError:
        # Fallback: use correlation-based detection
        corr_matrix = numeric_df.corr()
        high_corr_pairs = []
        
        for i, col1 in enumerate(corr_matrix.columns):
            for j, col2 in enumerate(corr_matrix.columns):
                if i < j:
                    corr_value = corr_matrix.loc[col1, col2]
                    if not pd.isna(corr_value) and abs(corr_value) > 0.9:
                        high_corr_pairs.append({
                            'variable1': col1,
                            'variable2': col2,
                            'correlation': safe_float(corr_value)
                        })
        
        return {
            "multicollinearity_detected": len(high_corr_pairs) > 0,
            "high_correlation_pairs": high_corr_pairs,
            "note": "VIF calculation requires statsmodels package"
        }