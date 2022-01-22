import { React } from "./deps.ts";
import { ChooseFile } from "./components/ChooseFile.tsx";
import { FlexCenter } from "./components/FlexCenter.tsx";
import { LogView } from "./components/LogView.tsx";
import { AppiumLog, parseAppiumLog } from "./core/parseAppiumLog.ts";

export const App: React.VFC = () => {
  const [appiumLog, setAppiumLog] = React.useState<AppiumLog | null>(null);
  const onChooseFile = React.useCallback((logText: string) => {
    const appiumLog = parseAppiumLog(logText);
    setAppiumLog(appiumLog);
  }, []);

  if (appiumLog) {
    return <LogView appiumLog={appiumLog} />;
  } else {
    return (
      <FlexCenter className="pt-6">
        <ChooseFile onChoose={onChooseFile} />
      </FlexCenter>
    );
  }
};
