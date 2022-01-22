import { React, ReactDOM } from "./deps.ts";
import { App } from "./App.tsx";

globalThis.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <App />,
    document.querySelector("#root"),
  );
});
