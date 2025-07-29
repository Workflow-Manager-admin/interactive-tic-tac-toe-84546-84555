import React, { useState, useEffect } from 'react';
import './App.css';

// THEME COLORS
const COLOR_PRIMARY = "#1976D2";
const COLOR_SECONDARY = "#FFC107";
const COLOR_ACCENT = "#FF5252";

// TIC TAC TOE LOGIC
const initialBoard = Array(9).fill(null);
const LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

// PUBLIC_INTERFACE
function calculateWinner(board) {
  /** Returns 'X', 'O', or null, and the winning line if present */
  for (const [a,b,c] of LINES) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  return board.every(cell => cell) ? { winner: 'draw', line: null } : { winner: null, line: null };
}

// PUBLIC_INTERFACE
function getComputerMove(board) {
  /** Simple (slightly smart) AI: block win, or random move */
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const testBoard = board.slice();
      testBoard[i] = 'O';
      if (calculateWinner(testBoard).winner === 'O') {
        return i;
      }
    }
  }
  // Try to block X's win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const testBoard = board.slice();
      testBoard[i] = 'X';
      if (calculateWinner(testBoard).winner === 'X') {
        return i;
      }
    }
  }
  // Else, pick center if open
  if (!board[4]) return 4;
  // Else, pick a random empty
  const empty = board.map((val, idx) => val ? null : idx).filter(x=>x!==null);
  return empty[Math.floor(Math.random() * empty.length)];
}

// PUBLIC_INTERFACE
function Square({ value, onClick, highlight }) {
  /** Renders one board square */
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      aria-label={value || "empty square"}
      style={{
        color: value === 'X' ? COLOR_PRIMARY : COLOR_ACCENT,
        backgroundColor: highlight ? COLOR_SECONDARY : "transparent",
        fontWeight: highlight ? "bold" : "normal"
      }}
      disabled={value !== null}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function Board({ board, onSquareClick, winningLine }) {
  /** Renders the entire tic tac toe grid */
  return (
    <div className="ttt-board">
      {board.map((sq, idx) => (
        <Square
          key={idx}
          value={sq}
          onClick={() => onSquareClick(idx)}
          highlight={winningLine && winningLine.includes(idx)}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function GameControls({ mode, setMode, onRestart }) {
  /** Renders mode toggle and reset button */
  return (
    <div className="ttt-controls">
      <div className="ttt-mode-toggle">
        <button
          className={mode === "pvp" ? "ttt-btn ttt-btn-active" : "ttt-btn"}
          onClick={() => setMode("pvp")}
        >
          {"👥 Player vs Player"}
        </button>
        <button
          className={mode === "pvc" ? "ttt-btn ttt-btn-active" : "ttt-btn"}
          onClick={() => setMode("pvc")}
        >
          {"🤖 Player vs Computer"}
        </button>
      </div>
      <button className="ttt-btn ttt-btn-reset" onClick={onRestart}>
        {"⟲ Reset"}
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameStatus({ gameState, mode, current, winner }) {
  /** Displays status: current player, win, draw, etc. */
  let status;
  if (winner === 'draw') {
    status = "It's a draw!";
  } else if (winner) {
    status = `${winner === 'X' ? 'X' : 'O'} wins! 🎉`;
  } else {
    if (mode === "pvp")
      status = `Turn: ${current === 'X' ? 'X' : 'O'}`;
    else
      status = `Turn: ${current === 'X' ? 'You (X)' : 'Computer (O)'}`;
  }
  return <div className="ttt-status">{status}</div>;
}

// PUBLIC_INTERFACE
function App() {
  /** Main Tic Tac Toe App */
  const [theme, setTheme] = useState('light');

  // Game State
  const [board, setBoard] = useState(initialBoard);
  const [current, setCurrent] = useState('X');
  const [mode, setMode] = useState("pvp"); // "pvp" or "pvc"
  const [{ winner, line }, setWinnerState] = useState({ winner: null, line: null });

  // (Visually) Highlight winning squares, update status
  useEffect(() => {
    const { winner, line } = calculateWinner(board);
    setWinnerState({ winner, line });
  }, [board]);

  // Computer move generation
  useEffect(() => {
    if (
      mode === "pvc" &&
      current === "O" &&
      !winner
    ) {
      const timer = setTimeout(() => {
        const move = getComputerMove(board);
        if (move !== undefined) handlePlay(move);
      }, 600); // delay for realism
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [current, mode, winner, board]);

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  function handlePlay(idx) {
    if (board[idx] || winner) return;
    const nextBoard = board.slice();
    nextBoard[idx] = current;
    setBoard(nextBoard);
    setCurrent(cur => cur === 'X' ? 'O' : 'X');
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(initialBoard);
    setCurrent('X');
    setWinnerState({ winner: null, line: null });
  }

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    setMode(newMode);
    handleRestart();
  }

  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }

  // Compute accessibility/gameover disables
  const boardDisabled =
    !!winner || (mode === "pvc" && current === "O" && !winner);
  
  return (
    <div className="App" style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: 'Inter, Roboto, "Segoe UI", Arial, sans-serif'
    }}>
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <button
          className="ttt-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <main className="ttt-main">
        <Board
          board={board}
          onSquareClick={boardDisabled ? () => {} : handlePlay}
          winningLine={line}
        />
        <GameStatus
          gameState={board}
          mode={mode}
          current={current}
          winner={winner}
        />
        <GameControls
          mode={mode}
          setMode={handleModeChange}
          onRestart={handleRestart}
        />
        <footer className="ttt-footer">
          <span>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ttt-link"
            >Built with React</a>
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
