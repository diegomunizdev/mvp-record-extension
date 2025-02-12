import React from "react";

function App() {
  const start = () => {
    chrome.runtime.sendMessage({ action: "startRecording" });
  };

  const stop = () => {
    chrome.runtime.sendMessage({ action: "stopRecording" });
  };

  return (
    <div style={{ width: 400, height: 300 }}>
      <button onClick={start}>start</button>
      <button onClick={stop}>stop</button>
    </div>
  );
}

export default App;
