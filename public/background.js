let activeTab = null;
let navigator = null;

function startRecording(tab) {
  activeTab = tab;
  chrome.scripting.executeScript({
    target: { tabId: tab.id ?? activeTab.id },
    func: async () => {
      try {
        const socket = new WebSocket("ws://localhost:3002");
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            mediaSource: "browser",
          },
          audio: true,
        });

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            const arrayBuffer = await event.data.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            console.log("enviando buffer...");
            socket.send(
              JSON.stringify({
                event: "message",
                data: { streamId: stream.id, buffer: uint8Array },
              })
            );
          }
        };

        mediaRecorder.start(1000);

        window.addEventListener("message", (event) => {
          if (event.source !== window) return;
          if (event.data.type === "WINDOW_VARIABLE") {
            console.log("Valor do window:", event.data.value);
            mediaRecorder.stop();
            socket.send(
              JSON.stringify({
                event: "end",
                data: { streamId: stream.id },
              })
            );
            socket.close();
          }
        });
      } catch (error) {
        console.log("error", error);
        throw new Error(error);
      }
    },
  });
}

function stopRecording(tab) {
  try {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        window.postMessage({ type: "WINDOW_VARIABLE", value: "stop" });
      },
    });
  } catch (error) {
    throw new Error("CAPTURE:", error);
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "start") {
    startRecording(message.tab);
    activeTab = message.tab;
    navigator = message.navigator;
    console.log("INICIAR GRAVAÇÃO");
  } else if (message.action === "stop") {
    console.log("PARAR GRAVAÇÃO");
    stopRecording(message.tab);
  }
});
