import React from "https://esm.sh/react@17.0.2";
import ReactDOM from "https://esm.sh/react-dom@17.0.2";

const App: React.VFC = () => {
  return <div>Hello</div>;
};

window.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <App />,
    document.querySelector("#root"),
  );
});
