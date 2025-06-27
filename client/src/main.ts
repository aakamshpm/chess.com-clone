import { io, Socket } from "socket.io-client";
import { Chess } from "chess.js";

const socket: Socket = io("http://localhost:8000");
const chess = new Chess();

const boardElement = document.querySelector("#chessboard")!;

let sourceSquare = null;
let draggedPiece = null;
let playerRole: string | null = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowIndex.toString();
      squareElement.dataset.col = squareIndex.toString();

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer?.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece!) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row!),
            col: parseInt(squareElement.dataset.col!),
          };
          handleMove(sourceSquare!, targetSource);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });
};

const handleMove = (sourceSquare: any, targetSource: any) => {
  const move = {
    from: `${String.fromCharCode(97 + sourceSquare.col)}${
      8 - sourceSquare.row
    }`,
    to: `${String.fromCharCode(97 + targetSource.col)}${8 - targetSource.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

const getPieceUnicode = (piece: any) => {
  const unicodePieces = {
    p: "♟", // Pawn
    r: "♜", // Rook
    n: "♞", // Knight
    b: "♝", // Bishop
    q: "♛", // Queen
    k: "♚", // King
    P: "♙", // Pawn
    R: "♖", // Rook
    N: "♘", // Knight
    B: "♗", // Bishop
    Q: "♕", // Queen
    K: "♔", // King
  };

  // @ts-ignore
  return unicodePieces[piece.type] || "";
};

socket.on("playerRole", (role: string) => {
  playerRole = role;
  renderBoard();
});

socket.on("spectator", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

renderBoard();
