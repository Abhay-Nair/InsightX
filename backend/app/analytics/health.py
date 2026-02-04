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


def dataset_health_score(df: pd.DataFrame):
    issues = []
    score = 100

    total_cells = df.shape[0] * df.shape[1]
    total_missing = df.isnull().sum().sum()
    missing_percentage = safe_float((total_missing / total_cells) * 100) if total_cells > 0 else 0

    # Count duplicate rows
    duplicates = df.duplicated().sum()

    # 🔻 Missing data penalty
    if missing_percentage > 20:
        score -= 20
        issues.append(f"High missing data: {missing_percentage}%")
    elif missing_percentage > 10:
        score -= 10
        issues.append(f"Moderate missing data: {missing_percentage}%")

    # 🔄 Duplicate data penalty
    if duplicates > 0:
        duplicate_pct = safe_float((duplicates / len(df)) * 100) if len(df) > 0 else 0
        if duplicate_pct > 10:
            score -= 15
            issues.append(f"High duplicate rate: {duplicate_pct}%")
        elif duplicate_pct > 5:
            score -= 8
            issues.append(f"Moderate duplicate rate: {duplicate_pct}%")

    # 🔢 Column type balance
    numeric_cols = df.select_dtypes(include="number").columns
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns

    total_cols = len(df.columns)
    numeric_pct = safe_float((len(numeric_cols) / total_cols) * 100) if total_cols > 0 else 0
    categorical_pct = safe_float((len(categorical_cols) / total_cols) * 100) if total_cols > 0 else 0

    # ⚠️ Cardinality risk
    high_cardinality_cols = []
    for col in categorical_cols:
        if df[col].nunique(dropna=True) > 50:  # Increased threshold for large datasets
            high_cardinality_cols.append(col)

    if high_cardinality_cols:
        score -= min(15, len(high_cardinality_cols) * 5)
        issues.append(f"High-cardinality columns: {high_cardinality_cols}")

    # 🕳️ Near-empty columns
    near_empty = []
    for col in df.columns:
        col_missing_pct = safe_float((df[col].isnull().sum() / len(df)) * 100) if len(df) > 0 else 0
        if col_missing_pct > 90:
            near_empty.append(col)

    if near_empty:
        score -= min(20, len(near_empty) * 10)
        issues.append(f"Near-empty columns: {near_empty}")

    score = max(score, 0)

    return {
        "score": safe_int(score),
        "missing_percentage": missing_percentage,  # Frontend expects this key
        "duplicates": safe_int(duplicates),  # Frontend expects this key
        "numeric_pct": numeric_pct,
        "categorical_pct": categorical_pct,
        "issues": issues
    }
