import { React } from "../deps.ts";
import { useAllState } from "../core/hooks.ts";
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
  index: number;
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
const ExpantionButton: React.VFC<
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
        <ExpantionButton expanded={expanded} onClick={toggleExpanded} />
        {expanded
          ? <code className="is-size-6">{path}</code>
          : <code className="is-size-6">{shortPath}</code>}
      </>
    )
    : <code className="is-size-6">{path}</code>;
};

const ExpandableJson: React.VFC<{ json: string }> = ({ json }) => {
  const [expanded, setExpanded] = React.useState(false);
  const toggleExpanded = () => {
    setExpanded((v) => !v);
  };
  const formatted = React.useMemo(() => {
    try {
      return expanded ? JSON.stringify(JSON.parse(json), null, 2) : json;
    } catch (err) {
      console.error(err);
      return json;
    }
  }, [json, expanded]);
  return (
    <>
      <ExpantionButton expanded={expanded} onClick={toggleExpanded} />
      <pre className="expandable-json mt-2">
        <code>
          {formatted}
        </code>
      </pre>
    </>
  );
};

const LogBodyHttpStarting: React.VFC<{ request: AppiumLogHttpRequest }> = (
  { request },
) => {
  const body = request.request.body;
  return (
    <>
      <RequestStartingIcon />
      <span className="has-text-weight-bold mr-1">{request.method}</span>
      <ExpandablePath path={request.path} shortPath={request.shortPath} />
      {body && body !== "{}" && <ExpandableJson json={request.request.body} />}
    </>
  );
};

const LogBodyHttpFinishing: React.VFC<{ request: AppiumLogHttpRequest }> = (
  { request },
) => {
  return (
    <>
      <RequestFinishingIcon />
      <span className="has-text-weight-bold mr-1">
        {request.method}
      </span>
      <ExpandablePath
        path={request.path}
        shortPath={request.shortPath}
      />
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

const DuplicationTag: React.VFC<{ count?: number }> = ({ count }) => {
  return (
    <span
      className="tag is-light is-rounded mr-1"
      title="duplicated"
    >
      {count ?? "*"}
    </span>
  );
};

type Props = {
  appiumLog: AppiumLog;
};

export const LogView: React.VFC<Props> = ({ appiumLog }) => {
  const store = useAllState();
  const {
    search: { commitedText: searchText },
    contextLines: { count: contextLineCount },
  } = store;

  const { entries, httpRequests } = appiumLog;
  const resolvedEntities: ResolvedAppiumLogEntry[] = React.useMemo(
    () => {
      const searchPattern = searchText.toLowerCase();
      // TODO: searchText, contextLineCount で filter する
      return entries.map((entry, index) => {
        return {
          ...entry,
          index,
          http: entry.http
            ? {
              ...entry.http,
              request: httpRequests.get(entry.http.requestId)!,
            }
            : undefined,
        };
      }).filter((entry) => {
        return searchPattern
          ? entry.body.toLowerCase().includes(searchPattern)
          : true;
      });
    },
    [entries, httpRequests, searchText, contextLineCount],
  );
  return (
    <>
      <LogViewToolbox store={store} />
      <section className="section table-container">
        <table className="table is-fullwidth">
          <tbody>
            {resolvedEntities.map((entry) => {
              return (
                <tr key={entry.index}>
                  <td className="has-text-grey">
                    <Timestamp timestamp={entry.timestamp} />
                  </td>
                  <td className="has-text-right">
                    <Category category={entry.category} />
                  </td>
                  <td
                    className="log-body-cell"
                    data-request-id={entry.http?.requestId}
                  >
                    {entry.inDupGroup && (
                      <DuplicationTag count={entry.duplicateCount} />
                    )}
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
