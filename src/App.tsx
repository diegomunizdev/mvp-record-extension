import React from "react";

function App() {
  const socket = new WebSocket("ws://localhost:3002");
  let mediaRecorder: MediaRecorder;

  // content.js
  // Função para iniciar a captura da tela e áudio
  async function startRecording() {
    // 1. Captura a tela
    console.log("INICIANDO GRAVAÇÃO");
    await navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        // 2. Cria o MediaRecorder para gravar a tela em tempo real
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        socket.onopen = () => {
          console.log("Conectado ao WebSocket");
        };

        socket.onerror = (e) => {
          console.log("ERROR:", e);
        };

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            const arrayBuffer = await event.data.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            console.log("enviando os dados");
            socket.send(JSON.stringify({ event: "message", data: uint8Array }));
          }
        };

        // 5. Inicia a gravação (a cada 100ms)
        mediaRecorder.start(100);
      })
      .catch((error) => {
        console.error("Erro ao capturar a tela:", error);
        throw new Error(error);
      });
  }

  const start = async () => {
    startRecording();
  };

  const stop = async () => {
    mediaRecorder.stop();
    socket.send(JSON.stringify({ event: "end" }));
    socket.onclose = () => {
      console.log("Desconectado do websocket");
    };
    socket.close();
  };

  return (
    <div style={{ width: 800, height: 1000 }}>
      <button onClick={start}>start</button>
      <button onClick={stop}>stop</button>
    </div>
  );
}

export default App;
