import pandas as pd


def categorical_statistics(df: pd.DataFrame, top_n: int = 8):
    results = {}

    categorical_cols = df.select_dtypes(include=["object", "category"]).columns
    total_rows = len(df)

    for col in categorical_cols:
        series = df[col].dropna()

        if series.empty:
            continue

        value_counts = series.value_counts()
        unique_count = int(series.nunique())

        # Create top_values as a dictionary for frontend compatibility
        top_values_dict = {}
        for value, count in value_counts.head(top_n).items():
            top_values_dict[str(value)] = int(count)

        # Also keep the detailed list format
        top_values_list = []
        for value, count in value_counts.head(top_n).items():
            pct = round((count / total_rows) * 100, 2) if total_rows > 0 else 0
            top_values_list.append({
                "value": str(value),
                "count": int(count),
                "percentage": pct
            })

        results[col] = {
            "unique_values": unique_count,
            "top_values": top_values_dict,  # For chart compatibility
            "top_values_detailed": top_values_list,  # For detailed analysis
            "high_cardinality": unique_count > 20
        }

    return results
