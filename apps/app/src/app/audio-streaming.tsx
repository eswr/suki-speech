import React, { useEffect, useRef, useState } from "react";
import { io, Socket, Manager } from "socket.io-client";
import Quill, { QuillOptionsStatic } from "quill";

// const manager = new Manager("http://localhost:3333/");
const socket = io("http://localhost:3333");
// import styles from "./audio-streaming.module.scss";
import "./audio-streaming.module.css";

export function AudioStreaming() {
  const socketRef = useRef<Socket | null>(null);
  const quillRef = useRef<Quill | null>(null);
  // const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const writableStreamRef = useRef<WritableStreamDefaultWriter | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    if (!socketRef.current) {
      // Connect to the server using WebSocket
      socketRef.current = socket;
      // const socket = io('http://localhost:3333');
      // manager.socket("/");
    }

    if (!quillRef.current) {
      // Initialize the Quill editor
      const editorOptions: QuillOptionsStatic = {
        readOnly: true,
        theme: "snow",
      };
      quillRef.current = new Quill("#editor", editorOptions);
    }
    // Create an instance of AudioContext
    // audioContextRef.current = new (window.AudioContext ||
    //   (window as any).webkitAudioContext)();

    return () => {
      // Disconnect from the server on component unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // if (writableStreamRef.current) {
      //   writableStreamRef.current.close();
      // }
    };
  }, []);

  const handleAudioChunk = async (audioData: Blob) => {
    // Send the audio chunk to the server
    if (socketRef.current) {
      socketRef.current.emit("audioChunk", audioData);
    }
  };

  const processTranscription = (transcription: string) => {
    debugger;
    // Update the Quill editor with the received transcription
    if (quillRef.current) {
      quillRef.current.setText(transcription);
    }
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      // const audioContext = audioContextRef.current;

      // Create a MediaRecorder to capture audio
      mediaRecorderRef.current = new MediaRecorder(mediaStream);

      // Create a WritableStream and writer for audio data
      const stream = new WritableStream({
        write: (chunk) => handleAudioChunk(chunk),
      });
      writableStreamRef.current = stream.getWriter();

      // Connect the MediaRecorder to the WritableStream
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          writableStreamRef.current?.write(event.data);
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      // writableStreamRef.current?.close();
    }
    setIsRecording(false);
  };

  useEffect(() => {
    // Handle transcriptions received from the server
    if (socketRef.current) {
      socketRef.current.on("ping", () => {
        debugger;
        console.log("ping to server");
      });
      socketRef.current.on("connect", () => {
        console.log("Connected to server");
      });
      socketRef.current.on("message", () => {
        console.log("message");
      });
      socketRef.current.on("abc", () => {
        console.log("abc");
      });
      socketRef.current.on("transcription", processTranscription);
    }

    return () => {
      // Clean up the transcription handler on component unmount
      if (socketRef.current) {
        socketRef.current.off("transcription", processTranscription);
      }
    };
  }, []);

  const handleAudioPlayback = () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioElement = new Audio(audioUrl);
    audioElement.play();
  };

  return (
    <div>
      <h2>Audio Streaming</h2>
      {isRecording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {audioChunks.length > 0 && (
        <button onClick={handleAudioPlayback}>Playback</button>
      )}
      <h2>Transcription</h2>
      <div id="editor"></div>
      <h2>end</h2>
    </div>
  );
}

export default AudioStreaming;
