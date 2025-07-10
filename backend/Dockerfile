FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install uv, the fast Python package installer
RUN pip install --no-cache-dir uv

# Copy only the dependency configuration file first to leverage Docker's layer caching
COPY pyproject.toml ./

# Install the project dependencies defined in pyproject.toml
# This installs dependencies from the [project] section, not dev tools
RUN uv pip install . --system

# Copy the application's source code into the container
COPY src/ ./src/

# Let Docker know that the container listens on port 8000
EXPOSE 8000

# The command to run the application when the container starts
CMD ["uvicorn", "datafool.main:app", "--host", "0.0.0.0", "--port", "8000"]