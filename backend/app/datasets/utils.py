import pandas as pd

def extract_metadata(df: pd.DataFrame):
    columns_metadata = {}

    for col in df.columns:
        col_series = df[col]

        columns_metadata[col] = {
            "dtype": str(col_series.dtype),
            "missing_values": int(col_series.isna().sum()),
            "unique_values": int(col_series.nunique()),
            "is_numeric": pd.api.types.is_numeric_dtype(col_series)
        }

    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": columns_metadata
    }
