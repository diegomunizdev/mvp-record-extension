import { useMemo } from "react";

function App() {
  const socket = useMemo(() => new WebSocket("ws://localhost:3002"), []);

  let mediaRecorder: MediaRecorder;
  let streamId: string = "";

  socket.onopen = () => {
    console.log("Conectado ao WebSocket");
  };

  socket.onerror = (e) => {
    console.log("ERROR:", e);
    throw new Error("Websocket error.");
  };

  async function start() {
    await navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        streamId = stream.id;
        mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            const arrayBuffer = await event.data.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            console.log("enviando os dados");
            socket.send(
              JSON.stringify({
                event: "message",
                data: { streamId: stream.id, buffer: uint8Array },
              })
            );
          }
        };

        mediaRecorder.start(1000);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  const stop = async () => {
    mediaRecorder.stop();
    socket.send(JSON.stringify({ event: "end", data: { streamId: streamId } }));
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
