from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class DatasetCreate(BaseModel):
    filename: str
    columns: List[str]
    row_count: int

class DatasetInDB(BaseModel):
    id: Optional[str]
    user_id: str
    filename: str
    columns: List[str]
    row_count: int
    uploaded_at: datetime = datetime.utcnow()
