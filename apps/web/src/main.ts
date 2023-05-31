/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
// import * as path from "path";
import cors from "cors";
import { Server as SocketServer, Socket } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);

// Define the allowed origins for Socket.IO connections
const allowedOrigins = ["http://localhost:4200"];

// Create the Socket.IO server instance with allowed origins
const io = new SocketServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Enable CORS middleware
app.use(cors({}));

// app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/api", (req, res) => {
  res.send({ message: "Welcome to web!" });
});

io.on("connection", (socket: Socket) => {
  console.log("A client connected");

  socket.on("audioChunk", (data: ArrayBuffer) => {
    // Process the audio data received from the client
    // You can perform transcription or any other operations here

    // Assuming you have the transcription result
    transcribeSpeech(data);
    const transcription = "This is the transcription result";

    // Send the transcription back to the client
    socket.emit("transcription", transcription);
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
