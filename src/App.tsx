import { Helmet, React } from "./deps.ts";
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
      <Helmet>
        <meta charSet="UTF-8" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </Helmet>
      {appiumLog && <LogView appiumLog={appiumLog} />}
    </>
  );
};
