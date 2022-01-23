import { React } from "../deps.ts";
import {
  AppiumLog,
  AppiumLogEntry,
  AppiumLogHttpRequest,
  AppiumLogTimestamp,
} from "../core/parseAppiumLog.ts";
import { LogViewToolbox } from "./LogViewToolbox.tsx";

const Timestamp: React.VFC<{ timestamp: AppiumLogTimestamp }> = (
  { timestamp },
) => <>{timestamp.seconds}</>;

const Category: React.VFC<{ category: string }> = ({ category }) => (
  <span className="tag is-primary">{category}</span>
);

type ResolvedAppiumLogEntry = AppiumLogEntry & {
  http?: {
    requestId: string;
    starting?: true;
    finishing?: true;
    request: AppiumLogHttpRequest;
  };
};

const RequestStartingIcon = () => (
  <span className="icon has-text-info mr-1">
    <i className="fas fa-arrow-right"></i>
  </span>
);
const RequestFinishingIcon = () => (
  <span className="icon has-text-info mr-1">
    <i className="fas fa-arrow-left"></i>
  </span>
);
const PathExpantionButton: React.VFC<
  { expanded: boolean; onClick: () => void }
> = ({ expanded, onClick }) => {
  return (
    <span
      className="icon is-small has-text-grey-light is-clickable"
      onClick={onClick}
    >
      {expanded
        ? <i className="fas fa-minus"></i>
        : <i className="fas fa-plus"></i>}
    </span>
  );
};
const ExpandablePath: React.VFC<{ path: string; shortPath?: string }> = (
  { path, shortPath },
) => {
  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded((v) => !v);
  };
  return shortPath
    ? (
      <>
        <PathExpantionButton expanded={expanded} onClick={toggleExpanded} />
        {expanded
          ? <code className="is-size-6">{path}</code>
          : <code className="is-size-6">{shortPath}</code>}
      </>
    )
    : <code className="is-size-6">{path}</code>;
};

const LogBodyHttpStarting: React.VFC<{ request: AppiumLogHttpRequest }> = (
  { request },
) => {
  return (
    <>
      <RequestStartingIcon />
      <span className="has-text-weight-bold mr-1">{request.method}</span>
      <ExpandablePath path={request.path} shortPath={request.shortPath} />
    </>
  );
};

const LogBodyHttpFinishing: React.VFC<{ request: AppiumLogHttpRequest }> = (
  { request },
) => {
  return (
    <>
      <RequestFinishingIcon />
      <span className="has-text-weight-bold mr-1">{request.method}</span>
      <ExpandablePath path={request.path} shortPath={request.shortPath} />
    </>
  );
};

const LogBody: React.VFC<{ entry: ResolvedAppiumLogEntry }> = ({ entry }) => {
  if (entry.http) {
    const { request } = entry.http;
    if (entry.http.starting) {
      return <LogBodyHttpStarting request={request} />;
    }
    if (entry.http.finishing) {
      return <LogBodyHttpFinishing request={request} />;
    }
  }
  return <>{entry.body}</>;
};

type Props = {
  appiumLog: AppiumLog;
};

export const LogView: React.VFC<Props> = ({ appiumLog }) => {
  const { entries, httpRequests } = appiumLog;
  const resolvedEntities: ResolvedAppiumLogEntry[] = React.useMemo(
    () =>
      entries.map((entry) => {
        return {
          ...entry,
          http: entry.http
            ? {
              ...entry.http,
              request: httpRequests.get(entry.http.requestId)!,
            }
            : undefined,
        };
      }),
    [entries, httpRequests],
  );
  return (
    <>
      <LogViewToolbox />
      <section className="section table-container">
        <table className="table is-fullwidth is-hoverable">
          <tbody>
            {resolvedEntities.map((entry) => {
              return (
                <tr key={entry.timestamp.seconds}>
                  <td className="has-text-grey">
                    <Timestamp timestamp={entry.timestamp} />
                  </td>
                  <td className="has-text-right">
                    <Category category={entry.category} />
                  </td>
                  <td className="log-body-cell">
                    <LogBody entry={entry} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
};
