setInterval(() => {
  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(JSON.stringify({ type: "ping" }));
  }
}, 5000);

let mediaRecorder;
let webSocket;
let stream;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "startRecording") {
    const streamId = chrome.desktopCapture.chooseDesktopMedia([
      "screen",
      "audio",
    ]);
    if (!streamId) return;

    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: streamId,
        },
      },
    });

    webSocket = new WebSocket("ws://localhost:3002/upload");

    webSocket.onopen = () => {
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
      });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(event.data);
        }
      };
      mediaRecorder.start(1000);
    };
  }

  if (message.action === "stopRecording") {
    mediaRecorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    webSocket.close();
  }
});
