import { React, ReactDOM } from "./deps.ts";
import { ChooseFile } from "./components/ChooseFile.tsx";
import { FlexCenter } from "./components/FlexCenter.tsx";

window.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <FlexCenter className="pt-6">
      <ChooseFile onChoose={(r) => {}} />
    </FlexCenter>,
    document.querySelector("#root"),
  );
});
