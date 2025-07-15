# backend/src/datafool/api/routes.py

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import engine, get_db
from ..models.schemas import QueryRequest, QueryResponse, UploadSuccessResponse
from ..services.llm_handler import construct_prompt, get_table_ddl, llm_instance
from ..services.uploader import process_and_upload_file

router = APIRouter()


@router.get("/health")
def health_check():
    """API health check."""
    return {"status": "ok"}


@router.post("/upload", response_model=UploadSuccessResponse)
async def upload_file_route(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    # We can move the upload logic into its own service later if it grows
    try:
        result = await process_and_upload_file(file, db, engine)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query", response_model=QueryResponse)
async def handle_query_route(request: QueryRequest, db: AsyncSession = Depends(get_db)):
    try:
        ddl = await get_table_ddl(request.table_name, db)
        prompt = construct_prompt(question=request.question, ddl_list=[ddl])
        generated_sql = llm_instance.generate_sql(prompt)
        result = await db.execute(text(generated_sql))
        rows = result.fetchall()
        columns = result.keys()
        data = [dict(zip(columns, row)) for row in rows]
        return QueryResponse(
            query_generated=generated_sql, data=data, ran_successfully=True
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
