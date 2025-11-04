import "@testing-library/jest-dom";

// scrollIntoView полифилл для jsdom
if (!("scrollIntoView" in HTMLElement.prototype)) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

// crypto.randomUUID полифилл с корректным UUID-форматом
function uuidv4() {
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// если нет crypto или нет randomUUID — добавим
if (typeof globalThis.crypto !== "object") {
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.randomUUID !== "function") {
  globalThis.crypto.randomUUID = uuidv4;
}
