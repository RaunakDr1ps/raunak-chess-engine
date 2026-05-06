import os
import chess
import chess.engine

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


STOCKFISH_PATH = os.environ.get("STOCKFISH_PATH", "stockfish")

app = FastAPI(title="Raunak Engine v1")

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
        "engine": "Raunak Engine v1",
        "stockfish_path": STOCKFISH_PATH,
    }


@app.post("/analyze")
def analyze(data: PositionRequest):
    try:
        board = chess.Board(data.fen)

        engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

        limit = chess.engine.Limit(depth=data.depth)
        info = engine.analyse(board, limit)
        best = engine.play(board, limit)

        engine.quit()

        score = info["score"].white()

        if score.is_mate():
            mate_value = score.mate()
            evaluation = f"Mate in {mate_value}"
            eval_number = 100 if mate_value and mate_value > 0 else -100
        else:
            cp = score.score()
            if cp is None:
                cp = 0
            evaluation = f"{cp / 100:+.2f}"
            eval_number = max(min(cp / 100, 10), -10)

        return {
            "best_move": best.move.uci(),
            "evaluation": evaluation,
            "eval_number": eval_number,
            "engine": "Raunak Engine v1",
        }

    except Exception as e:
        return {
            "error": str(e),
            "stockfish_path": STOCKFISH_PATH,
            "engine": "Raunak Engine v1",
        }