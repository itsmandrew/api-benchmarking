from python:3.10-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false \
  && poetry install --no-root

COPY . .

CMD ["uvicorn", "my_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
