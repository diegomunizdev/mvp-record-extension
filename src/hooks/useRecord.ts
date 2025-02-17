import { useCallback, useMemo, useRef } from "react";

export default function useRecord() {
  const socket = useMemo(() => new WebSocket("ws://localhost:3002"), []);
  const streamId = useRef<string>("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);

  socket.onopen = () => {
    console.log("Conectado ao WebSocket");
  };

  socket.onerror = (e) => {
    throw new Error(`Websocket error: ${e}`);
  };

  socket.onclose = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    console.log("Desconectado do websocket");
  };

  const start = useCallback(async () => {
    const value = localStorage.getItem("teste");
    console.log({ value });
    await navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        streamId.current = stream.id;
        mediaRecorder.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        if (stream && video.current) {
          video.current.srcObject = stream;
        }

        if (mediaRecorder) {
          mediaRecorder.current.ondataavailable = async (event) => {
            if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              const arrayBuffer = await event.data.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              socket.send(
                JSON.stringify({
                  event: "message",
                  data: { streamId: stream.id, buffer: uint8Array },
                }),
              );
            }
          };

          mediaRecorder.current.start(1000);
        }
      })
      .catch((error) => {
        throw new Error(error);
      });
  }, [socket]);

  const pause = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
    }
  }, []);

  const stop = useCallback(async () => {
    socket.send(
      JSON.stringify({ event: "end", data: { streamId: streamId.current } }),
    );
    socket.close();
  }, [socket, streamId]);

  const value = useMemo(
    () => ({
      start,
      pause,
      stop,
      resume,
      video,
    }),
    [pause, resume, start, stop],
  );

  return value;
}
