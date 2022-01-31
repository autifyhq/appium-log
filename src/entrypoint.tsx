import { React, ReactDOM } from "./deps.ts";
import { App } from "./App.tsx";

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntilPreElement(): Promise<Element | null> {
  // wait 2 sec
  for (let i = 0; i < 200; i++) {
    const pre = document.body.firstElementChild;
    const ok = pre && pre.tagName === "PRE" &&
      pre === document.body.lastElementChild;
    if (ok) {
      return pre;
    }
    await wait(10);
  }
  return null;
}

async function main() {
  const pre = await waitUntilPreElement();
  if (!pre) {
    console.debug("This page seems not to be appium log. Rendering skipped.");
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

main().catch((e) => console.error(e));
