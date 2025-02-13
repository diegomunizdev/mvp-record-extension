import React from "react";

function App() {
  const start = async () => {
    await chrome.runtime.sendMessage({ action: "start" });
  };

  const stop = async () => {
    await chrome.runtime.sendMessage({ action: "stop" });
  };

  return (
    <div style={{ width: 400, height: 300 }}>
      <button onClick={start}>start</button>
      <button onClick={stop}>stop</button>
    </div>
  );
}

export default App;
