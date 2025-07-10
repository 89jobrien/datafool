# backend/tests/test_main.py

from unittest.mock import AsyncMock, MagicMock  # Import MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from datafool.database import get_db
from datafool.main import app


# --- Health Check and Upload Tests (Unchanged) ---
@pytest.mark.asyncio
async def test_health_check():
    """Tests that the /api/health endpoint returns a 200 OK status."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_upload_file_route(mocker):
    """Tests the /api/upload endpoint."""
    mock_process_and_upload = mocker.patch(
        "datafool.api.routes.process_and_upload_file",
        new_callable=AsyncMock,
        return_value={
            "message": "File uploaded successfully",
            "filename": "test.csv",
            "table_name": "test_csv",
            "columns": ["col1", "col2"],
            "rows": 1,
        },
    )
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        files = {"file": ("test.csv", b"col1,col2\n1,2", "text/csv")}
        response = await client.post("/api/upload", files=files)
    assert response.status_code == 200
    assert response.json()["filename"] == "test.csv"
    mock_process_and_upload.assert_called_once()


# --- CORRECTED Query Route Test ---
@pytest.mark.asyncio
async def test_query_route(mocker):
    """Tests the /api/query endpoint by overriding the database dependency."""
    # 1. Arrange: Mock non-database dependencies
    mocker.patch(
        "datafool.api.routes.get_table_ddl",
        new_callable=AsyncMock,
        return_value='CREATE TABLE "my_table" (id BIGINT, name TEXT);',
    )
    mocker.patch(
        "datafool.api.routes.llm_instance.generate_sql",
        return_value='SELECT "name" FROM "my_table";',
    )

    # Use a standard MagicMock for the result object
    mock_result = MagicMock()
    mock_result.fetchall.return_value = [("test_user",)]
    mock_result.keys.return_value = ["name"]

    # Use an AsyncMock for the session, as its methods are awaitable
    mock_session = AsyncMock()
    mock_session.execute.return_value = mock_result

    # Override the get_db dependency
    async def override_get_db():
        yield mock_session

    app.dependency_overrides[get_db] = override_get_db

    # 2. Act
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {"table_name": "my_table", "question": "show me the names"}
        response = await client.post("/api/query", json=payload)

    app.dependency_overrides.clear()

    # 3. Assert
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["query_generated"] == 'SELECT "name" FROM "my_table";'
    assert response_data["data"] == [{"name": "test_user"}]
    mock_session.execute.assert_called_once()
