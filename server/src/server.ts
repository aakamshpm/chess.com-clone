import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import path from "path";
import cors from "cors";
import { ChessInterface } from "./interfaces/ChessInterface";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;
const CLIENT_PORT = 5173;

app.use(cors());
app.use(express.json());

const chess = new Chess();
let players: ChessInterface["players"] = {};
let currentPlayer = "w";

app.use(express.static(path.join(__dirname, "../public")));

// Basic route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running!" });
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectator");
  }

  socket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && socket.id !== players.white) return;
      if (chess.turn() === "b" && socket.id !== players.black) return;

      const result = chess.move(move);

      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move attempted:", move);
        socket.emit("invalidMove", "Invalid move attempted.");
      }
    } catch (err) {}

    socket.on("disconnect", () => {
      if (players.white === socket.id) {
        delete players.white;
      } else if (players.black === socket.id) {
        delete players.black;
      }
    });
  });
});

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  console.log(
    `Please manually open http://localhost:${CLIENT_PORT} to access the client.`
  );
});
