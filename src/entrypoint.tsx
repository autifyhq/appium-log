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

  // attach meta elements
  // font awesome
  const link = document.createElement("link") as any;
  link.rel = "stylesheet";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css";
  document.head.appendChild(link);

  ReactDOM.render(
    <App logText={logText} />,
    document.getElementById("root"),
  );
}

main();
