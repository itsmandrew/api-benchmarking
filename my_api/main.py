from fastapi import FastAPI
from my_api.database import engine, Base
from my_api import models

app = FastAPI()

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Hello, world!"}


@app.get("/health")
def health():
    return {"status": "ok"}
