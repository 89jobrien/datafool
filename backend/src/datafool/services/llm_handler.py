from abc import ABC, abstractmethod

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings


# --- Abstract Base Class for LLMs ---
class LLM_Base(ABC):
    @abstractmethod
    def generate_sql(self, prompt: str) -> str:
        """Generates SQL from a prompt."""
        pass


# --- Hugging Face Implementation ---
class HuggingFace_LLM(LLM_Base):
    def __init__(self, model_name: str):
        from transformers import pipeline

        print(f"Initializing Hugging Face pipeline with model: {model_name}")
        self._sql_generator = pipeline("text2text-generation", model=model_name)

    def generate_sql(self, prompt: str) -> str:
        result = self._sql_generator(prompt, max_length=512)
        if isinstance(result, list) and len(result) > 0 and isinstance(result[0], dict):
            return result[0].get("generated_text", "")
        else:
            raise ValueError("Unexpected result format from the model.")


# --- Ollama Implementation ---
class Ollama_LLM(LLM_Base):
    def __init__(self, host: str, model_name: str):
        import ollama

        print(f"Initializing Ollama client for model: {model_name} at {host}")
        self._client = ollama.Client(host=host)
        self._model = model_name

    def generate_sql(self, prompt: str) -> str:
        response = self._client.chat(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response["message"]["content"]


# --- Azure OpenAI Implementation ---
class Azure_OpenAI_LLM(LLM_Base):
    def __init__(self, api_key: str, endpoint: str, version: str, deployment: str):
        from openai import AzureOpenAI

        print(f"Initializing Azure OpenAI client for deployment: {deployment}")
        self._client = AzureOpenAI(
            api_key=api_key, api_version=version, azure_endpoint=endpoint
        )
        self._deployment = deployment

    def generate_sql(self, prompt: str) -> str:
        response = self._client.chat.completions.create(
            model=self._deployment,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        return response.choices[0].message.content or ""


def get_llm() -> LLM_Base:
    """Initializes the LLM based on settings from core.config."""
    provider = settings.llm_provider.lower()

    if provider == "huggingface":
        return HuggingFace_LLM(model_name=settings.hf_model)

    elif provider == "ollama":
        return Ollama_LLM(host=settings.ollama_host, model_name=settings.ollama_model)

    elif provider == "azure":
        return Azure_OpenAI_LLM(
            api_key=str(settings.azure_openai_key),
            endpoint=str(settings.azure_openai_endpoint),
            version=str(settings.azure_openai_version),
            deployment=str(settings.azure_openai_deployment),
        )

    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")


# Initialize the LLM on startup
llm_instance = get_llm()


# --- Prompt and DDL Functions (remain mostly the same) ---
def construct_prompt(question: str, ddl_list: list) -> str:
    """Constructs a detailed prompt for the LLM to generate SQL."""
    prompt = "### Instructions:\n"
    prompt += "Your task is to convert a question into a single, executable SQL query for a PostgreSQL database.\n"
    prompt += "Adhere to these rules:\n"

    # --- THIS IS THE NEW RULE ---
    prompt += '- **CRITICAL RULE: You MUST wrap all table and column names in double quotes** (e.g., `SELECT "my_column" FROM "my_table"`). This is essential for case-sensitivity.\n'

    prompt += "- **Only respond with the SQL query.** Do not add any explanation, commentary, or markdown.\n\n"
    prompt += "### Input:\n"
    prompt += f'The user\'s question is: "{question}"\n\n'
    prompt += "### Database Schema:\n"
    prompt += "This is the schema of the tables you must use:\n"
    prompt += "\n".join(ddl_list) + "\n\n"
    prompt += "### SQL Query:\n"
    return prompt


async def get_table_ddl(table_name: str, db: AsyncSession) -> str:
    """Retrieves the CREATE TABLE statement for a given table."""
    # This simplified query works for PostgreSQL.
    query = f"""
    SELECT 'CREATE TABLE \"' || table_name || '\" (' ||
           string_agg(column_name || ' ' || data_type, ', ') ||
           ');'
    FROM information_schema.columns
    WHERE table_name = '{table_name.strip('"')}'
    GROUP BY table_name;
    """
    result = await db.execute(text(query))
    ddl = result.scalar_one_or_none()
    if not ddl:
        raise ValueError(f"Could not retrieve DDL for table: {table_name}")
    return ddl
