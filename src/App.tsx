import { Fragment } from "react";

function App() {
  async function start() {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        if (tabs.length > 0) {
          const activeTab = tabs[0]; // A primeira aba na lista de resultados
          await chrome.runtime.sendMessage({
            action: "start",
            tab: activeTab,
            navigator: navigator,
          });
        }
      }
    );
  }

  async function stop() {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        if (tabs.length > 0) {
          const activeTab = tabs[0]; // A primeira aba na lista de resultados
          await chrome.runtime.sendMessage({
            action: "stop",
            tab: activeTab,
          });
        }
      }
    );
  }

  return (
    <div style={{ padding: 20, gap: 20 }}>
      <button onClick={start}>INICIAR GRAVAÇÃO</button>
      <button onClick={stop}>PARAR GRAVAÇÃO</button>
    </div>
  );
}

export default App;
