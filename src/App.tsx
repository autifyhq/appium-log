import { React } from "./deps.ts";
import { LogView } from "./components/LogView.tsx";
import { AppiumLog, parseAppiumLog } from "./core/parseAppiumLog.ts";

export const App: React.VFC<{ logText: string }> = ({ logText }) => {
  const [appiumLog, setAppiumLog] = React.useState<AppiumLog | null>(null);

  React.useEffect(() => {
    if (!logText) {
      return;
    }

    const appiumLog = parseAppiumLog(logText);
    setAppiumLog(appiumLog);
  }, [logText]);

  return (
    <>
      {appiumLog && <LogView appiumLog={appiumLog} />}
    </>
  );
};
