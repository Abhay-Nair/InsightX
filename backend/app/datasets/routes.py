from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import pandas as pd
import os
import uuid
import cloudinary
import cloudinary.uploader
from datetime import datetime
from dotenv import load_dotenv
from app.db.database import get_db
from app.core.auth import get_current_user

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

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

        # Read and validate file size
        content = await file.read()
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")

        # Generate unique ID
        dataset_id = str(uuid.uuid4())

        # Upload to Cloudinary as raw file
        upload_result = cloudinary.uploader.upload(
            content,
            resource_type="raw",
            public_id=f"insightx/datasets/{dataset_id}",
            original_filename=file.filename,
            overwrite=True
        )
        file_url = upload_result["secure_url"]

        # Load dataframe from content in memory
        import io
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))

        # Save dataset metadata to MongoDB
        db = get_db()
        datasets = db.datasets

        dataset_doc = {
            "dataset_id": dataset_id,
            "user_email": current_user,
            "filename": file.filename,
            "file_url": file_url,        # Cloudinary URL
            "file_path": file_url,       # Keep for compatibility
            "uploaded_at": datetime.utcnow(),
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist(),
            "file_size": len(content)
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
            {"_id": 0}
        ))

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

        dataset = datasets.find_one({
            "dataset_id": dataset_id,
            "user_email": current_user
        })

        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Load from Cloudinary URL
        import requests
        import io

        file_url = dataset.get("file_url") or dataset.get("file_path")
        response = requests.get(file_url)
        response.raise_for_status()

        if dataset["filename"].endswith('.csv'):
            df = pd.read_csv(io.BytesIO(response.content), nrows=10)
        else:
            df = pd.read_excel(io.BytesIO(response.content), nrows=10)

        df = df.where(pd.notnull(df), None)

        return {
            "dataset_id": dataset_id,
            "columns": df.columns.tolist(),
            "data": df.to_dict('records'),
            "preview_rows": len(df),
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

        dataset = datasets.find_one({
            "dataset_id": dataset_id,
            "user_email": current_user
        })

        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Delete from Cloudinary
        try:
            cloudinary.uploader.destroy(
                f"insightx/datasets/{dataset_id}",
                resource_type="raw"
            )
        except Exception as e:
            print(f"Cloudinary delete warning: {e}")

        # Delete from MongoDB
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