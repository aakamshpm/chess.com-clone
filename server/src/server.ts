import express from "express";
import http from "http";
import ejs from "ejs";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import path from "path";

const app = express();

const server = http.createServer(app);
const io = new Server(server);

const chess = new Chess();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
