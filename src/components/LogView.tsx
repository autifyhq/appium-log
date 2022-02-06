import { clsx, copy, React } from "../deps.ts";
import {
  DEFAULT_CATEGORY_FILTER,
  TimestampFormat,
  useAllState,
} from "../core/hooks.ts";
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
const ExpansionButton: React.VFC<
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
        <ExpansionButton expanded={expanded} onClick={toggleExpanded} />
        {expanded
          ? <code className="is-size-6">{path}</code>
          : <code className="is-size-6">{shortPath}</code>}
      </>
    )
    : <code className="is-size-6">{path}</code>;
};

const CopyButton: React.VFC<{ text: string }> = ({ text }) => {
  return (
    <span
      className="icon is-small has-text-grey-light is-clickable"
      title="Copy"
      onClick={() => {
        copy(text);
      }}
    >
      <i className="fas fa-copy"></i>
    </span>
  );
};

const ResetCategoryFilterButton: React.VFC<
  { onClick: () => void }
> = ({ onClick }) => {
  return (
    <span
      className="icon is-small has-text-grey-light is-clickable"
      onClick={onClick}
    >
      <i className="fas fa-expand-alt"></i>
    </span>
  );
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
    <div className="expandable-json-outer">
      <span className="expandable-json-expansion-button">
        <ExpansionButton expanded={expanded} onClick={toggleExpanded} />
      </span>
      <span className="expandable-json-copy-button">
        <CopyButton text={formatted} />
      </span>
      <pre className="expandable-json mt-2 pt-5">
        <code>
          {formatted}
        </code>
      </pre>
    </div>
  );
};

const HttpResponseSummary: React.VFC<{ status: number; millisecond: number }> =
  ({ status, millisecond }) => {
    return (
      <div className="inline-block ml-4">
        <div className="field is-grouped is-grouped-multiline">
          <div className="control">
            <div className="tags has-addons">
              <span className="tag is-info is-light">status</span>
              <span className="tag">{status}</span>
            </div>
          </div>

          <div className="control">
            <div className="tags has-addons">
              <span className="tag is-info is-light">time</span>
              <span className="tag">{millisecond} ms</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

const LogBodyHttpStarting: React.VFC<
  { request: AppiumLogHttpRequest; onResetCategoryFilter?: () => void }
> = (
  { request, onResetCategoryFilter },
) => {
  const { body } = request.request;
  return (
    <>
      <RequestStartingIcon />
      <span className="has-text-weight-bold mr-1">{request.method}</span>
      <ExpandablePath path={request.path} shortPath={request.shortPath} />
      {onResetCategoryFilter && (
        <ResetCategoryFilterButton onClick={onResetCategoryFilter} />
      )}
      {body && body !== "{}" && <ExpandableJson json={request.request.body} />}
    </>
  );
};

const LogBodyHttpFinishing: React.VFC<
  { request: AppiumLogHttpRequest; onResetCategoryFilter?: () => void }
> = (
  { request, onResetCategoryFilter },
) => {
  const { response } = request;
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
      {response && <HttpResponseSummary {...response} />}
      {onResetCategoryFilter && (
        <ResetCategoryFilterButton onClick={onResetCategoryFilter} />
      )}
    </>
  );
};

const LogBody: React.VFC<
  { entry: ResolvedAppiumLogEntry; onResetCategoryFilter?: () => void }
> = ({ entry, onResetCategoryFilter }) => {
  if (entry.http) {
    const { request } = entry.http;
    if (entry.http.starting) {
      return (
        <LogBodyHttpStarting
          request={request}
          onResetCategoryFilter={onResetCategoryFilter}
        />
      );
    }
    if (entry.http.finishing) {
      return (
        <LogBodyHttpFinishing
          request={request}
          onResetCategoryFilter={onResetCategoryFilter}
        />
      );
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

const MarkerCell: React.VFC<
  { marked: boolean; onToggle: () => void; bottomBold: boolean }
> = ({ marked, onToggle, bottomBold }) => {
  const [entering, setEntering] = React.useState(false);
  return (
    <td
      className={clsx("marker-cell", {
        "border-bottom-bold": bottomBold,
      })}
      onMouseEnter={() => setEntering(true)}
      onMouseLeave={() => setEntering(false)}
    >
      <span
        className={clsx("icon is-small has-text-danger is-clickable", {
          "opacity-0": !marked && !entering,
          "opacity-half": !marked && entering,
        })}
        onClick={onToggle}
      >
        <i className="fas fa-circle"></i>
      </span>
    </td>
  );
};

const scrollToEntry = (entry: ResolvedAppiumLogEntry) => {
  const entryElement = document.getElementById(`entry-${entry.index}`);
  if (!entryElement) {
    return;
  }
  entryElement.scrollIntoView({ block: "center" });
};

type Props = {
  appiumLog: AppiumLog;
};

export const LogView: React.VFC<Props> = ({ appiumLog }) => {
  const store = useAllState();
  const {
    search: { commitedText: searchText },
    contextLines: { count: contextLineCount },
    timestampFormat: { format: timestampFormat },
    categoryFilter,
    requestDurationFilter,
  } = store;

  const { entries, httpRequests } = appiumLog;
  const resolvedEntries: ResolvedAppiumLogEntry[] = React.useMemo(
    () => {
      let resolvedEntries = entries
        .map((entry, index) => {
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
        })
        .filter((entry) => {
          if (categoryFilter.value === DEFAULT_CATEGORY_FILTER) {
            return true;
          } else {
            if (categoryFilter.value === "HTTP") {
              return entry.category === categoryFilter.value &&
                (entry.http?.request?.response?.millisecond ?? 1) >
                  requestDurationFilter.value;
            } else {
              return entry.category === categoryFilter.value;
            }
          }
        });

      if (!searchText) {
        return resolvedEntries;
      }

      const searchPattern = searchText.toLowerCase();
      return filterWithContext(
        resolvedEntries,
        (entry) => entry.body.toLowerCase().includes(searchPattern),
        contextLineCount,
      );
    },
    [
      entries,
      httpRequests,
      searchText,
      contextLineCount,
      categoryFilter.value,
      requestDurationFilter.value,
    ],
  );

  const [markers, setMarkers] = React.useState<Record<number, boolean>>({});

  const filteredByCategory = categoryFilter.value !== "all";

  return (
    <>
      <LogViewToolbox store={store} lines={resolvedEntries.length} />
      <section className="table-container">
        <table
          className={clsx("table", "is-fullwidth", {
            "is-hoverable": filteredByCategory,
          })}
        >
          <tbody>
            {resolvedEntries.map((entry, i, all) => {
              const bottomBold = categoryFilter.value === "all" &&
                i < all.length - 1 &&
                all[i + 1].index - entry.index > 1;
              return (
                <tr key={entry.index} id={`entry-${entry.index}`}>
                  <MarkerCell
                    marked={markers[entry.index]}
                    onToggle={() => {
                      setMarkers((markers) => ({
                        ...markers,
                        [entry.index]: !markers[entry.index],
                      }));
                    }}
                    bottomBold={bottomBold}
                  />
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
                    <LogBody
                      entry={entry}
                      onResetCategoryFilter={filteredByCategory
                        ? (() => {
                          categoryFilter.set("all");
                          setTimeout(() => {
                            scrollToEntry(entry);
                          }, 500);
                        })
                        : undefined}
                    />
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
