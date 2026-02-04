# app/analytics/profiling.py

import pandas as pd
import math


def safe_float(value):
    """Convert value to float, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return 0.0
    return float(round(value, 2))


def safe_int(value):
    """Convert value to int, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return 0
    return int(value)


def profile_columns(df: pd.DataFrame):
    total_rows = len(df)
    profiles = {}

    for col in df.columns:
        series = df[col]

        # Missing values - both count and percentage
        missing_count = series.isnull().sum()
        missing_percentage = safe_float((missing_count / total_rows) * 100) if total_rows > 0 else 0

        # Unique values
        unique_count = series.nunique(dropna=True)

        # Detect type
        if pd.api.types.is_numeric_dtype(series):
            col_type = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(series):
            col_type = "datetime"
        else:
            col_type = "categorical"

        # Sample values (safe, non-null)
        samples = (
            series.dropna()
            .astype(str)
            .unique()
            .tolist()[:3]
        )

        profiles[col] = {
            "type": col_type,
            "missing_count": safe_int(missing_count),  # Frontend KPICards expects this
            "missing_percentage": missing_percentage,  # Frontend charts expect this
            "unique_count": safe_int(unique_count),
            "samples": samples
        }

    return profiles
