import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";

console.log("Raunak Chess Engine v1");

function App() {
  const [game, setGame] = useState(new Chess());
  const [evaluation, setEvaluation] = useState("-");
  const [evalNumber, setEvalNumber] = useState(0);
  const [bestMove, setBestMove] = useState("-");
  const [status, setStatus] = useState("Your move");
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState({});
  const [depth, setDepth] = useState(12);
  const [thinking, setThinking] = useState(false);

  const evalHeight = 50 + Math.max(Math.min(evalNumber, 10), -10) * 5;

  async function engineReply(newGame, userMove) {
    try {
      setThinking(true);
      setStatus("Stockfish thinking...");

      const res = await axios.post("https://raunak-chess-engine.onrender.com/analyze", {
        fen: newGame.fen(),
        depth,
      });

      const engineMove = res.data.best_move;
      setEvaluation(res.data.evaluation);
      setEvalNumber(res.data.eval_number);
      setBestMove(engineMove);

      const engineGame = new Chess(newGame.fen());
      const enginePlayedMove = engineGame.move({
        from: engineMove.slice(0, 2),
        to: engineMove.slice(2, 4),
        promotion: "q",
      });

      setGame(engineGame);
      setLastMove({
        [enginePlayedMove.from]: { backgroundColor: "rgba(124,58,237,0.65)" },
        [enginePlayedMove.to]: { backgroundColor: "rgba(124,58,237,0.65)" },
      });

      setMoveHistory((prev) => [
        ...prev,
        {
          white: `${userMove.from}${userMove.to}`,
          black: `${enginePlayedMove.from}${enginePlayedMove.to}`,
        },
      ]);

      setStatus("Your move");
    } catch (err) {
      console.error(err);
      setStatus("Backend error. Check server.");
    } finally {
      setThinking(false);
    }
  }

  function onDrop(sourceSquare, targetSquare) {
    if (thinking) return false;

    const newGame = new Chess(game.fen());

    let move = null;
    try {
      move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
    } catch {
      return false;
    }

    if (!move) return false;

    setGame(newGame);
    setLastMove({
      [move.from]: { backgroundColor: "rgba(34,197,94,0.65)" },
      [move.to]: { backgroundColor: "rgba(34,197,94,0.65)" },
    });

    setTimeout(() => {
  engineReply(newGame, move);
}, 300);

return true;
  }

  function resetGame() {
    setGame(new Chess());
    setEvaluation("-");
    setEvalNumber(0);
    setBestMove("-");
    setStatus("Your move");
    setMoveHistory([]);
    setLastMove({});
    setThinking(false);
  }

  return (
    <div style={pageStyle}>
      <div style={brandStyle}>Built by Raunak Sharma</div>

      <div style={evalBarOuter}>
        <div style={{ ...evalBarInner, height: `${evalHeight}%` }} />
      </div>

      <div style={boardCard}>
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          customSquareStyles={lastMove}
          boardOrientation="white"
        />
      </div>

      <div style={panelStyle}>
        <h1 style={titleStyle}>Raunak Engine v1</h1>
        <p style={subtitleStyle}>Stockfish-powered chess analysis board</p>

        <div style={statusBox}>
          <b>Status</b>
          <p>{thinking ? "Thinking..." : status}</p>
        </div>

        <div style={gridStyle}>
          <div style={cardStyle}>
            <span style={labelStyle}>Evaluation</span>
            <strong style={valueStyle}>{evaluation}</strong>
          </div>

          <div style={cardStyle}>
            <span style={labelStyle}>Best Move</span>
            <strong style={valueStyle}>{bestMove}</strong>
          </div>
        </div>

        <div style={{ marginTop: "18px" }}>
          <label>
            Engine Depth: <b>{depth}</b>
          </label>
          <input
            type="range"
            min="6"
            max="18"
            value={depth}
            disabled={thinking}
            onChange={(e) => setDepth(Number(e.target.value))}
            style={{ width: "100%", marginTop: "8px" }}
          />
        </div>

        <h3 style={{ marginTop: "24px" }}>Move History</h3>

        <div style={historyBox}>
          {moveHistory.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No moves yet</p>
          ) : (
            moveHistory.map((m, i) => (
              <div key={i} style={historyRow}>
                <span>{i + 1}.</span>
                <span>{m.white}</span>
                <span>{m.black}</span>
              </div>
            ))
          )}
        </div>

        <button onClick={resetGame} disabled={thinking} style={buttonStyle(thinking)}>
          Reset Game
        </button>

        <p style={signatureStyle}>Powered by Raunak Engine</p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0b0f19, #111827)",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "34px",
  fontFamily: "Inter, Arial, sans-serif",
  padding: "40px",
};

const brandStyle = {
  position: "fixed",
  bottom: "12px",
  right: "22px",
  fontSize: "12px",
  color: "#8b949e",
};

const evalBarOuter = {
  width: "64px",
  height: "520px",
  background: "#111827",
  borderRadius: "18px",
  overflow: "hidden",
  border: "1px solid #2d3748",
  display: "flex",
  flexDirection: "column-reverse",
};

const evalBarInner = {
  background: "#f8fafc",
  transition: "height 0.4s ease",
};

const boardCard = {
  width: "520px",
  padding: "18px",
  background: "#151a24",
  borderRadius: "22px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  border: "1px solid #2d3748",
};

const panelStyle = {
  width: "390px",
  background: "rgba(21,26,36,0.96)",
  padding: "26px",
  borderRadius: "22px",
  border: "1px solid #2d3748",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
};

const titleStyle = {
  margin: 0,
  fontSize: "30px",
};

const subtitleStyle = {
  color: "#9ca3af",
  marginTop: "8px",
};

const statusBox = {
  marginTop: "20px",
  padding: "14px",
  background: "#0f172a",
  borderRadius: "14px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "14px",
};

const cardStyle = {
  padding: "14px",
  background: "#0f172a",
  borderRadius: "14px",
};

const labelStyle = {
  display: "block",
  color: "#9ca3af",
  fontSize: "13px",
  marginBottom: "6px",
};

const valueStyle = {
  fontSize: "22px",
};

const historyBox = {
  maxHeight: "180px",
  overflowY: "auto",
  background: "#0f172a",
  padding: "12px",
  borderRadius: "14px",
};

const historyRow = {
  display: "grid",
  gridTemplateColumns: "40px 1fr 1fr",
  padding: "6px 0",
  borderBottom: "1px solid #1f2937",
};

const buttonStyle = (thinking) => ({
  marginTop: "20px",
  padding: "13px",
  width: "100%",
  background: thinking ? "#4b5563" : "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: thinking ? "not-allowed" : "pointer",
  fontWeight: "bold",
});

const signatureStyle = {
  marginTop: "12px",
  fontSize: "13px",
  color: "#9ca3af",
  textAlign: "center",
};

export default App;