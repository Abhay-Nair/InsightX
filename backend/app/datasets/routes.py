from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import pandas as pd
import os
import uuid
from datetime import datetime
from app.db.database import get_db
from app.core.auth import get_current_user

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """Upload a dataset file"""
    try:
        # Validate file type
        if not file.filename.endswith(('.csv', '.xlsx')):
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploaded_datasets"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Load and analyze the dataset
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
        except Exception as e:
            os.remove(file_path)  # Clean up file if loading fails
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
        
        # Generate dataset metadata
        dataset_id = str(uuid.uuid4())
        
        # Save dataset metadata to database
        db = get_db()
        datasets = db.datasets
        
        dataset_doc = {
            "dataset_id": dataset_id,
            "user_email": current_user,
            "filename": file.filename,
            "file_path": file_path,
            "uploaded_at": datetime.utcnow(),
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist()
        }
        
        datasets.insert_one(dataset_doc)
        
        return {
            "message": "Dataset uploaded successfully",
            "dataset_id": dataset_id,
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload dataset")

@router.get("/")
def get_user_datasets(current_user: str = Depends(get_current_user)):
    """Get all datasets for the current user"""
    try:
        db = get_db()
        datasets = db.datasets
        
        user_datasets = list(datasets.find(
            {"user_email": current_user},
            {"_id": 0, "file_path": 0}  # Exclude internal fields
        ))
        
        # Format for frontend compatibility
        for dataset in user_datasets:
            dataset["_id"] = dataset["dataset_id"]
            dataset["rows"] = dataset.get("row_count")
            dataset["columns"] = dataset.get("column_count")
            if "uploaded_at" in dataset:
                dataset["upload_date"] = dataset["uploaded_at"].isoformat()
        
        return user_datasets
        
    except Exception as e:
        print(f"Error retrieving datasets: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve datasets")

@router.get("/{dataset_id}/preview")
def get_dataset_preview(
    dataset_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get a preview of the dataset"""
    try:
        db = get_db()
        datasets = db.datasets
        
        # Find dataset and verify ownership
        dataset = datasets.find_one({
            "dataset_id": dataset_id,
            "user_email": current_user
        })
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Load preview data
        file_path = dataset["file_path"]
        
        try:
            if dataset["filename"].endswith('.csv'):
                df = pd.read_csv(file_path, nrows=10)  # Preview first 10 rows
            else:
                df = pd.read_excel(file_path, nrows=10)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")
        
        # Convert to JSON format
        preview_data = df.to_dict('records')
        
        return {
            "dataset_id": dataset_id,
            "columns": df.columns.tolist(),
            "data": preview_data,
            "preview_rows": len(preview_data),
            "total_rows": dataset.get("row_count", 0),
            "filename": dataset["filename"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Preview error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load dataset preview")

@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete a dataset"""
    try:
        db = get_db()
        datasets = db.datasets
        
        # Find dataset and verify ownership
        dataset = datasets.find_one({
            "dataset_id": dataset_id,
            "user_email": current_user
        })
        
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Delete file
        file_path = dataset.get("file_path")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete database record
        result = datasets.delete_one({
            "dataset_id": dataset_id,
            "user_email": current_user
        })
        
        if result.deleted_count > 0:
            return {"message": "Dataset deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete dataset")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete dataset")