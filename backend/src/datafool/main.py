from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import routes as api_routes

app = FastAPI(
    title="DataFool API",
    description="API for uploading files and running natural language queries against data.",
    version="0.1.0",
)


origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_routes.router, prefix="/api")
