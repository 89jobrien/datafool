import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    database_url: str = str(os.getenv("DATABASE_URL"))

    # LLM Provider: "huggingface", "ollama", or "azure"
    llm_provider: str = "azure"

    # Hugging Face
    hf_model: str = "t5-base-finetuned-wiki-sql"

    # Ollama
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "codellama"

    # Azure OpenAI
    azure_openai_key: str = str(os.getenv("AZURE_OPENAI_KEY"))
    azure_openai_endpoint: str = str(os.getenv("AZURE_OPENAI_ENDPOINT"))
    azure_openai_version: str = str(os.getenv("AZURE_OPENAI_VERSION"))
    azure_openai_deployment: str = str(os.getenv("AZURE_LLM_DEPLOYMENT"))


@lru_cache()
def get_settings():
    return Settings()


# Make a single instance available for easy import
settings = get_settings()
