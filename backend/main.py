import chess
import chess.engine
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

STOCKFISH_PATH = os.environ.get(
    "STOCKFISH_PATH",
    r"C:\Users\Raunak\Downloads\stockfish-windows-x86-64-avx2\stockfish\stockfish-windows-x86-64-avx2.exe"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PositionRequest(BaseModel):
    fen: str
    depth: int = 12

@app.get("/")
def home():
    return {
        "message": "Backend running",
        "engine": "Raunak Engine v1"
    }

@app.post("/analyze")
def analyze(data: PositionRequest):
    board = chess.Board(data.fen)

    engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

    limit = chess.engine.Limit(depth=data.depth)
    info = engine.analyse(board, limit)
    best = engine.play(board, limit)

    engine.quit()

    score = info["score"].white()

    if score.is_mate():
        evaluation = f"Mate in {score.mate()}"
        eval_number = 100 if score.mate() and score.mate() > 0 else -100
    else:
        cp = score.score()
        evaluation = f"{cp / 100:+.2f}"
        eval_number = max(min(cp / 100, 10), -10)

    return {
        "best_move": best.move.uci(),
        "evaluation": evaluation,
        "eval_number": eval_number,
        "engine": "Raunak Engine v1"
    }