# app/analytics/cleaning.py

import pandas as pd


def clean_dataset(df: pd.DataFrame):
    cleaning_actions = []
    original_shape = df.shape
    
    # Track cleaning metrics
    rows_cleaned = 0
    columns_normalized = 0
    types_converted = 0

    # 1️⃣ Strip column names
    original_columns = df.columns.tolist()
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

    if original_columns != df.columns.tolist():
        cleaning_actions.append("Normalized column names")
        columns_normalized = len([col for col in original_columns if col != col.strip().lower().replace(" ", "_")])

    # 2️⃣ Strip whitespace from string values
    object_cols = df.select_dtypes(include="object").columns
    for col in object_cols:
        original_values = df[col].copy()
        df[col] = df[col].astype(str).str.strip()
        # Count rows that were actually cleaned
        if not original_values.equals(df[col]):
            rows_cleaned += (original_values != df[col]).sum()
            
    if len(object_cols) > 0:
        cleaning_actions.append("Stripped whitespace from text columns")

    # 3️⃣ Missing values report
    missing_values = df.isnull().sum().to_dict()

    # 4️⃣ Try numeric conversion
    converted_columns = []
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                # Try to convert to numeric
                original_dtype = df[col].dtype
                df[col] = pd.to_numeric(df[col], errors='coerce')
                if df[col].dtype != original_dtype:
                    converted_columns.append(col)
                    types_converted += 1
            except Exception:
                pass

    if converted_columns:
        cleaning_actions.append(f"Converted columns to numeric: {converted_columns}")

    # 5️⃣ Remove duplicate rows
    initial_rows = len(df)
    df = df.drop_duplicates()
    duplicates_removed = initial_rows - len(df)
    
    if duplicates_removed > 0:
        cleaning_actions.append(f"Removed {duplicates_removed} duplicate rows")
        rows_cleaned += duplicates_removed

    return df, {
        "missing_values": missing_values,
        "cleaning_actions": cleaning_actions,
        # Frontend expects these specific keys
        "rows_cleaned": int(rows_cleaned),
        "columns_normalized": int(columns_normalized), 
        "types_converted": int(types_converted),
        "duplicates_removed": int(duplicates_removed),
        "original_shape": original_shape,
        "final_shape": df.shape
    }
