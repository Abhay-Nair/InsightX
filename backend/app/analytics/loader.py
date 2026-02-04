import pandas as pd
from fastapi import HTTPException
import os

def load_dataset(dataset_id: str, user_email: str, db):
    """Load dataset with basic authorization"""
    datasets_collection = db.datasets

    # Fetch dataset metadata
    dataset = datasets_collection.find_one({
        "dataset_id": dataset_id,
        "user_email": user_email
    })

    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Get file path
    file_path = dataset.get("file_path")
    
    if not file_path:
        # Fallback to old system
        filename = dataset.get("filename")
        if filename:
            file_path = os.path.join("uploaded_datasets", filename)
        else:
            raise HTTPException(status_code=500, detail="Dataset file information missing")

    # Verify file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Dataset file missing on server")

    # Load file
    try:
        filename = dataset.get("filename", "")
        
        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unable to read dataset: {str(e)}")
    
    # Return metadata
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
