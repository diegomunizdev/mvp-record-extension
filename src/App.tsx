import { Fragment, useLayoutEffect, useState } from "react";
import useRecord from "./hooks/useRecord";

function App() {
  const [isPopup, setIsPopup] = useState<boolean>(false);

  const { start, stop, video, pause, resume } = useRecord();

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("popup") && urlParams.get("popup") === "true") {
      setIsPopup(true);
    } else {
      setIsPopup(false);
    }

    localStorage.setItem("teste", "teste");
  }, []);

  async function pipOpen() {
    await chrome.runtime.sendMessage({ action: "pip" });
    localStorage.setItem("teste", "teste");
  }

  console.log({ video });
  return (
    <Fragment>
      {isPopup ? (
        <Fragment>
          <video ref={video} controls={false} width="100%" autoPlay />
          <div
            style={{
              gap: 8,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
            }}
          >
            <button onClick={async () => await start()}>Start</button>
            <button onClick={async () => await stop()}>Stop</button>
            <button onClick={() => pause()}>pause</button>
            <button onClick={() => resume()}>resume</button>
          </div>
        </Fragment>
      ) : (
        <button onClick={pipOpen}>Iniciar gravação</button>
      )}
    </Fragment>
  );
}

export default App;
