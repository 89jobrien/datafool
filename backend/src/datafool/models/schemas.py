from typing import Any, Dict, List

from pydantic import BaseModel


class UploadSuccessResponse(BaseModel):
    message: str
    filename: str
    table_name: str
    columns: List[str]
    rows: int


class QueryRequest(BaseModel):
    table_name: str
    question: str


class QueryResponse(BaseModel):
    query_generated: str
    data: List[Dict[str, Any]]
    ran_successfully: bool
