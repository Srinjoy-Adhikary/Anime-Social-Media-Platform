from fastapi import FastAPI
from pydantic import BaseModel

from rag import ask_rag


app = FastAPI(
    title="Otaku Verse AI Service"
)


class AskRequest(BaseModel):
    question: str
    currentEpisode: int
    anime: str = "naruto"


class AskResponse(BaseModel):
    answer: str


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Otaku Verse AI Service is running"
    }


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):

    answer = ask_rag(
        request.question,
        request.currentEpisode,
           request.anime
    )

    return {
        "answer": answer
    }