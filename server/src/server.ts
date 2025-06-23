import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import path from "path";
import cors from "cors";

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

app.use(express.static(path.join(__dirname, "../public")));

// Basic route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running!" });
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
});

server.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
  console.log(
    `Please manually open http://localhost:${CLIENT_PORT} to access the client.`
  );
});
