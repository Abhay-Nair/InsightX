# app/analytics/statistics.py

import pandas as pd
import numpy as np
import math


def safe_float(value):
    """Convert value to float, handling NaN and infinity"""
    if pd.isna(value) or math.isinf(value):
        return None
    return float(round(value, 3))


def descriptive_statistics(df: pd.DataFrame):
    stats = {}

    numeric_cols = df.select_dtypes(include=["number"]).columns

    for col in numeric_cols:
        series = df[col].dropna()

        if series.empty:
            continue

        # Calculate statistics with NaN handling
        mean_val = safe_float(series.mean())
        median_val = safe_float(series.median())
        min_val = safe_float(series.min())
        max_val = safe_float(series.max())
        std_val = safe_float(series.std())
        p25_val = safe_float(series.quantile(0.25))
        p75_val = safe_float(series.quantile(0.75))

        # Only include non-null values
        stats[col] = {}
        if mean_val is not None:
            stats[col]["mean"] = mean_val
        if median_val is not None:
            stats[col]["median"] = median_val
        if min_val is not None:
            stats[col]["min"] = min_val
        if max_val is not None:
            stats[col]["max"] = max_val
        if std_val is not None:
            stats[col]["std"] = std_val
        if p25_val is not None:
            stats[col]["p25"] = p25_val
        if p75_val is not None:
            stats[col]["p75"] = p75_val

    return stats

