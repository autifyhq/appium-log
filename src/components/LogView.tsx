import { clsx, React } from "../deps.ts";
import { TimestampFormat, useAllState } from "../core/hooks.ts";
import { filterWithContext } from "../core/filterWithContext.ts";
import {
  AppiumLog,
  AppiumLogEntry,
  AppiumLogHttpRequest,
  AppiumLogTimestamp,
} from "../core/parseAppiumLog.ts";
import { LogViewToolbox } from "./LogViewToolbox.tsx";

const Timestamp: React.VFC<
  { timestamp: AppiumLogTimestamp; format: TimestampFormat }
> = (
  { timestamp, format },
) => {
  switch (format) {
    case "relative":
      return <>{timestamp.seconds}</>;
    case "absolute":
      return <>{timestamp.date.toISOString()}</>;
    default:
      return null;
  }
};

const Category: React.VFC<{ category: string }> = ({ category }) => (
  <span className="tag is-link">{category}</span>
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

// Global class from mark.js
// @ts-ignore
const mark = new Mark(".log-body-cell");

export const LogView: React.VFC<Props> = ({ appiumLog }) => {
  const store = useAllState();
  const {
    search: { commitedText: searchText },
    contextLines: { count: contextLineCount },
    timestampFormat: { format: timestampFormat },
  } = store;

  const { entries, httpRequests } = appiumLog;
  const resolvedEntities: ResolvedAppiumLogEntry[] = React.useMemo(
    () => {
      const resolvedEntities = entries.map((entry, index) => {
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
      });

      if (!searchText) {
        return resolvedEntities;
      }

      const searchPattern = searchText.toLowerCase();
      return filterWithContext(
        resolvedEntities,
        (entry) => entry.body.toLowerCase().includes(searchPattern),
        contextLineCount,
      );
    },
    [entries, httpRequests, searchText, contextLineCount],
  );

  // Mark search keywords every time the keyword changes
  React.useEffect(() => {
    mark.mark(searchText);
    return () => {
      mark.unmark();
    };
  }, [searchText]);

  return (
    <>
      <LogViewToolbox store={store} />
      <section className="section table-container">
        <table className="table is-fullwidth">
          <tbody>
            {resolvedEntities.map((entry, i, all) => {
              const bottomBold = i < all.length - 1 &&
                all[i + 1].index - entry.index > 1;
              return (
                <tr key={entry.index}>
                  <td
                    className={clsx("timestamp-cell", "has-text-grey", {
                      "border-bottom-bold": bottomBold,
                    })}
                  >
                    <Timestamp
                      timestamp={entry.timestamp}
                      format={timestampFormat}
                    />
                  </td>
                  <td
                    className={clsx("has-text-right", {
                      "border-bottom-bold": bottomBold,
                    })}
                  >
                    <Category category={entry.category} />
                  </td>
                  <td
                    className={clsx("log-body-cell", {
                      "border-bottom-bold": bottomBold,
                    })}
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
