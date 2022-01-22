import { React } from "../deps.ts";
import { AppiumLog } from "../core/parseAppiumLog.ts";

type Props = {
  appiumLog: AppiumLog;
};

export const LogView: React.VFC<Props> = ({ appiumLog }) => {
  const { entries, httpRequests } = appiumLog;
  return (
    <section className="section">
      {entries.map((entry) => {
        return (
          <div className="block" key={entry.timestamp.seconds}>
            <span>{entry.timestamp.seconds}</span>
            <span className="tag is-primary">{entry.category}</span>
            {entry.body}
          </div>
        );
      })}
    </section>
  );
};
