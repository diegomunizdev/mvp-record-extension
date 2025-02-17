chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "pip") {
    try {
      await chrome.windows.create({
        url: "index.html?popup=true",
        type: "popup",
        focused: true,
        state: "normal",
        width: 650,
        height: 650,
      });
    } catch (error) {
      throw new Error(error);
    }
  }
});
