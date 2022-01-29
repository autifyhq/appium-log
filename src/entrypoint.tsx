import { React, ReactDOM } from "./deps.ts";
import { App } from "./App.tsx";

function main() {
  const pre = document.body.firstElementChild!;
  if (
    !pre || pre.tagName !== "PRE" ||
    pre !== document.body.lastElementChild
  ) {
    // not appium.log text file
    return;
  }

  // @ts-ignore
  pre.style["display"] = "none";
  const logText = pre.textContent!;

  // attach the root element for react
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  ReactDOM.render(
    <App logText={logText} />,
    document.getElementById("root"),
  );
}

main();
