import pandas as pd
from fastapi import HTTPException
import requests
import io

def load_dataset(dataset_id: str, user_email: str, db):
    """Load dataset from Cloudinary URL"""
    datasets_collection = db.datasets
    
    # Fetch dataset metadata
    dataset = datasets_collection.find_one({
        "dataset_id": dataset_id,
        "user_email": user_email
    })
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Get file URL (Cloudinary) or fallback to local path
    file_url = dataset.get("file_url") or dataset.get("file_path")

    if not file_url:
        raise HTTPException(status_code=500, detail="Dataset file information missing")

    # Load file
    try:
        filename = dataset.get("filename", "")

        # Check if it's a URL or local path
        if file_url.startswith("http"):
            response = requests.get(file_url, timeout=30)
            response.raise_for_status()
            file_content = io.BytesIO(response.content)
        else:
            file_content = open(file_url, "rb")

        if filename.endswith(".csv"):
            df = pd.read_csv(file_content)
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        # Safe automatic numeric conversion
        for col in df.columns:
            try:
                if df[col].dtype == "object":
                    converted = pd.to_numeric(df[col], errors="coerce")
                    non_null_ratio = converted.notna().sum() / max(len(converted), 1)
                    if non_null_ratio > 0.7:
                        df[col] = converted
            except Exception:
                pass

        print("\n=== DATAFRAME INFO ===")
        print(df.dtypes)
        print("======================\n")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unable to read dataset: {str(e)}")

    metadata = {
        "dataset_id": dataset.get("dataset_id"),
        "user_email": dataset.get("user_email"),
        "filename": dataset.get("filename"),
        "columns": dataset.get("columns"),
        "row_count": dataset.get("row_count"),
        "column_count": dataset.get("column_count"),
        "uploaded_at": dataset.get("uploaded_at")
    }
    return df, metadata