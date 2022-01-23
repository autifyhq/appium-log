import { React } from "../deps.ts";
import { AppiumLog } from "../core/parseAppiumLog.ts";
import { LogViewToolbox } from "./LogViewToolbox.tsx";

type Props = {
  appiumLog: AppiumLog;
};

export const LogView: React.VFC<Props> = ({ appiumLog }) => {
  const { entries, httpRequests } = appiumLog;
  return (
    <>
      <LogViewToolbox />
      <section className="section table-container">
        <table className="table is-fullwidth is-hoverable">
          <tbody>
            {entries.map((entry) => {
              return (
                <tr key={entry.timestamp.seconds}>
                  <td className="has-text-grey">{entry.timestamp.seconds}</td>
                  <td className="has-text-right">
                    <span className="tag is-primary">{entry.category}</span>
                  </td>
                  <td className="log-body-cell">{entry.body}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
};
