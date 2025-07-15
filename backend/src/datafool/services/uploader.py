import io

import pandas as pd
from fastapi import UploadFile
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession


def _pandas_to_sql_type(dtype: str) -> str:
    """Maps a pandas dtype to its corresponding SQL data type."""
    if "int" in str(dtype):
        return "BIGINT"
    if "float" in str(dtype):
        return "FLOAT"
    if "datetime" in str(dtype):
        return "TIMESTAMP"
    if "bool" in str(dtype):
        return "BOOLEAN"
    return "TEXT"


def _sanitize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans the DataFrame by removing commas from numeric-like string columns
    and converting them to the correct data type.
    """
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                sanitized_col = df[col].str.replace(",", "", regex=False)
                if not sanitized_col.isnull().all():
                    df[col] = pd.to_numeric(sanitized_col)
            except (ValueError, AttributeError):
                pass
    return df


async def read_file_to_dataframe(file: UploadFile) -> pd.DataFrame:
    """
    Reads the content of an uploaded file into a pandas DataFrame and sanitizes it.
    """
    if not file.filename:
        raise ValueError("Filename is missing.")

    content = await file.read()
    file_io = io.BytesIO(content)

    if file.filename.endswith(".csv"):
        df = pd.read_csv(file_io)
    elif file.filename.endswith((".xls", ".xlsx")):
        df = pd.read_excel(file_io)
    else:
        raise ValueError("Unsupported file format.")
    return _sanitize_dataframe(df)


async def upload_dataframe_to_db(
    df: pd.DataFrame, table_name: str, engine: AsyncEngine
):
    """
    Creates a table and uploads a DataFrame's contents to the database.
    """

    cols_with_types = [
        f'"{col}" {_pandas_to_sql_type(dtype)}' for col, dtype in df.dtypes.items()
    ]

    drop_table_query = f"DROP TABLE IF EXISTS {table_name}"
    create_table_query = f"CREATE TABLE {table_name} ({', '.join(cols_with_types)})"

    async with engine.connect() as conn:
        try:
            await conn.execute(text(drop_table_query))
            await conn.execute(text(create_table_query))

            await conn.run_sync(
                lambda sync_conn: df.to_sql(
                    table_name.strip('"'), sync_conn, if_exists="append", index=False
                )
            )
            await conn.commit()
        except Exception as e:
            await conn.rollback()
            raise e


async def process_and_upload_file(
    file: UploadFile, db: AsyncSession, engine: AsyncEngine
):
    """
    Orchestrates the file upload process.
    """
    if not file.filename:
        raise ValueError("Filename is missing.")

    base_name = (
        "".join(file.filename.rsplit(".", 1)[:-1])
        if "." in file.filename
        else file.filename
    )
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else ""
    table_name = f'"{base_name.lower().replace(" ", "_")}_{ext}"'

    df = await read_file_to_dataframe(file)
    await upload_dataframe_to_db(df, table_name, engine)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "table_name": table_name.strip('"'),
        "columns": list(df.columns),
        "rows": len(df),
    }
