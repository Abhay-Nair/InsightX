# app/analytics/advanced_stats.py

import pandas as pd
import numpy as np
import math
from typing import Dict, Any


def safe_float(value):
    """Convert value to float, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return None
    return float(round(value, 3))


def safe_int(value):
    """Convert value to int, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return 0
    return int(value)


def calculate_advanced_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate advanced metrics for travel approval or business data"""
    
    advanced_metrics = {}
    
    # Detect data type
    is_travel_data = any(col in df.columns for col in ['approval_status', 'travel_purpose', 'source_state'])
    is_business_data = any(col in df.columns for col in ['revenue_musd', 'industry', 'employees'])
    
    if is_travel_data:
        advanced_metrics.update(_calculate_travel_metrics(df))
    elif is_business_data:
        advanced_metrics.update(_calculate_business_metrics(df))
    
    # General advanced metrics
    advanced_metrics.update(_calculate_general_metrics(df))
    
    return advanced_metrics


def _calculate_travel_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate travel approval specific metrics"""
    metrics = {}
    
    # Approval rate analysis
    if 'approval_status' in df.columns:
        approval_counts = df['approval_status'].value_counts()
        total_requests = len(df)
        
        approved_count = sum(count for status, count in approval_counts.items() 
                           if 'APPROVED' in str(status).upper())
        rejected_count = sum(count for status, count in approval_counts.items() 
                           if 'REJECTED' in str(status).upper())
        pending_count = sum(count for status, count in approval_counts.items() 
                          if 'PENDING' in str(status).upper())
        
        metrics['approval_analysis'] = {
            'total_requests': safe_int(total_requests),
            'approved_count': safe_int(approved_count),
            'rejected_count': safe_int(rejected_count),
            'pending_count': safe_int(pending_count),
            'approval_rate': safe_float((approved_count / total_requests) * 100) if total_requests > 0 else 0,
            'rejection_rate': safe_float((rejected_count / total_requests) * 100) if total_requests > 0 else 0,
            'pending_rate': safe_float((pending_count / total_requests) * 100) if total_requests > 0 else 0
        }
    
    # Travel purpose analysis
    if 'travel_purpose' in df.columns:
        purpose_counts = df['travel_purpose'].value_counts()
        metrics['purpose_analysis'] = {
            'top_purposes': purpose_counts.head(5).to_dict(),
            'purpose_diversity': len(purpose_counts),
            'most_common_purpose': purpose_counts.index[0] if len(purpose_counts) > 0 else None
        }
    
    # Geographic analysis
    if 'source_state' in df.columns and 'destination_state' in df.columns:
        # Interstate travel patterns
        travel_flows = df.groupby(['source_state', 'destination_state']).size().reset_index(name='count')
        top_flows = travel_flows.nlargest(10, 'count')
        
        metrics['geographic_analysis'] = {
            'unique_source_states': df['source_state'].nunique(),
            'unique_destination_states': df['destination_state'].nunique(),
            'top_travel_corridors': [
                {
                    'route': f"{row['source_state']} → {row['destination_state']}",
                    'count': safe_int(row['count'])
                }
                for _, row in top_flows.iterrows()
            ]
        }
    
    # Demographic analysis
    if 'age' in df.columns:
        age_stats = df['age'].describe()
        metrics['demographic_analysis'] = {
            'age_distribution': {
                'mean_age': safe_float(age_stats['mean']),
                'median_age': safe_float(age_stats['50%']),
                'age_range': f"{safe_int(age_stats['min'])}-{safe_int(age_stats['max'])}",
                'age_groups': _calculate_age_groups(df['age'])
            }
        }
    
    # Economic analysis
    if 'monthly_income' in df.columns:
        income_stats = df['monthly_income'].describe()
        metrics['economic_analysis'] = {
            'income_distribution': {
                'mean_income': safe_float(income_stats['mean']),
                'median_income': safe_float(income_stats['50%']),
                'income_range': f"₹{safe_int(income_stats['min']):,}-₹{safe_int(income_stats['max']):,}",
                'income_brackets': _calculate_income_brackets(df['monthly_income'])
            }
        }
        
        # Income vs Age correlation if both exist
        if 'age' in df.columns:
            correlation = df['age'].corr(df['monthly_income'])
            if not pd.isna(correlation):
                metrics['economic_analysis']['age_income_correlation'] = safe_float(correlation)
    
    # Health status analysis
    if 'health_status' in df.columns:
        health_counts = df['health_status'].value_counts()
        metrics['health_analysis'] = {
            'health_distribution': health_counts.to_dict(),
            'health_score': _calculate_health_score(health_counts)
        }
    
    return metrics


def _calculate_business_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate business data specific metrics"""
    metrics = {}
    
    # Financial analysis
    if 'revenue_musd' in df.columns:
        revenue_stats = df['revenue_musd'].describe()
        metrics['financial_analysis'] = {
            'revenue_distribution': {
                'mean_revenue': safe_float(revenue_stats['mean']),
                'median_revenue': safe_float(revenue_stats['50%']),
                'total_revenue': safe_float(df['revenue_musd'].sum()),
                'revenue_range': f"${safe_float(revenue_stats['min'])}M-${safe_float(revenue_stats['max'])}M"
            }
        }
    
    # Growth analysis
    if 'growth_rate' in df.columns:
        growth_stats = df['growth_rate'].describe()
        metrics['growth_analysis'] = {
            'average_growth': safe_float(growth_stats['mean']),
            'growth_leaders': df.nlargest(5, 'growth_rate')[['company', 'growth_rate']].to_dict('records') if 'company' in df.columns else None
        }
    
    # Industry analysis
    if 'industry' in df.columns:
        industry_counts = df['industry'].value_counts()
        metrics['industry_analysis'] = {
            'industry_distribution': industry_counts.to_dict(),
            'dominant_industry': industry_counts.index[0] if len(industry_counts) > 0 else None
        }
    
    return metrics


def _calculate_general_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Calculate general data quality and structure metrics"""
    metrics = {}
    
    # Data completeness analysis
    missing_by_column = df.isnull().sum()
    total_cells = df.shape[0] * df.shape[1]
    total_missing = df.isnull().sum().sum()
    
    metrics['data_quality'] = {
        'completeness_score': safe_float(((total_cells - total_missing) / total_cells) * 100) if total_cells > 0 else 0,
        'columns_with_missing': safe_int((missing_by_column > 0).sum()),
        'most_incomplete_columns': {k: safe_int(v) for k, v in missing_by_column[missing_by_column > 0].head(5).to_dict().items()}
    }
    
    # Data type distribution
    type_counts = df.dtypes.value_counts()
    metrics['data_structure'] = {
        'column_types': {str(dtype): int(count) for dtype, count in type_counts.items()},
        'numeric_columns': len(df.select_dtypes(include=[np.number]).columns),
        'categorical_columns': len(df.select_dtypes(include=['object', 'category']).columns),
        'datetime_columns': len(df.select_dtypes(include=['datetime64']).columns)
    }
    
    # Uniqueness analysis
    uniqueness_scores = {}
    for col in df.columns:
        unique_ratio = df[col].nunique() / len(df) if len(df) > 0 else 0
        uniqueness_scores[col] = safe_float(unique_ratio)
    
    metrics['uniqueness_analysis'] = {
        'column_uniqueness': uniqueness_scores,
        'high_cardinality_columns': [col for col, ratio in uniqueness_scores.items() if ratio and ratio > 0.8],
        'low_cardinality_columns': [col for col, ratio in uniqueness_scores.items() if ratio and ratio < 0.1]
    }
    
    return metrics


def _calculate_age_groups(age_series: pd.Series) -> Dict[str, int]:
    """Calculate age group distribution"""
    age_groups = {
        '18-25': 0, '26-35': 0, '36-45': 0, 
        '46-55': 0, '56-65': 0, '65+': 0
    }
    
    for age in age_series.dropna():
        if 18 <= age <= 25:
            age_groups['18-25'] += 1
        elif 26 <= age <= 35:
            age_groups['26-35'] += 1
        elif 36 <= age <= 45:
            age_groups['36-45'] += 1
        elif 46 <= age <= 55:
            age_groups['46-55'] += 1
        elif 56 <= age <= 65:
            age_groups['56-65'] += 1
        elif age > 65:
            age_groups['65+'] += 1
    
    return age_groups


def _calculate_income_brackets(income_series: pd.Series) -> Dict[str, int]:
    """Calculate income bracket distribution"""
    income_brackets = {
        'Low (< ₹25K)': 0,
        'Lower-Middle (₹25K-₹50K)': 0,
        'Middle (₹50K-₹100K)': 0,
        'Upper-Middle (₹100K-₹200K)': 0,
        'High (> ₹200K)': 0
    }
    
    for income in income_series.dropna():
        if income < 25000:
            income_brackets['Low (< ₹25K)'] += 1
        elif 25000 <= income < 50000:
            income_brackets['Lower-Middle (₹25K-₹50K)'] += 1
        elif 50000 <= income < 100000:
            income_brackets['Middle (₹50K-₹100K)'] += 1
        elif 100000 <= income < 200000:
            income_brackets['Upper-Middle (₹100K-₹200K)'] += 1
        else:
            income_brackets['High (> ₹200K)'] += 1
    
    return income_brackets


def _calculate_health_score(health_counts: pd.Series) -> float:
    """Calculate overall health score based on health status distribution"""
    total = health_counts.sum()
    if total == 0:
        return 0.0
    
    # Weight different health statuses
    weights = {
        'Good': 1.0,
        'Average': 0.7,
        'Critical': 0.3
    }
    
    weighted_score = 0
    for status, count in health_counts.items():
        weight = weights.get(status, 0.5)  # Default weight for unknown statuses
        weighted_score += (count / total) * weight
    
    return safe_float(weighted_score * 100) or 0.0