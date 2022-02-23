import { clsx, React } from "../deps.ts";
import { DEFAULT_CATEGORY_FILTER, useAllState } from "../core/hooks.ts";
import { filterWithContext } from "../core/filterWithContext.ts";
import {
  AppiumLog,
  AppiumLogEntry,
  AppiumLogHttpRequest,
} from "../core/parseAppiumLog.ts";
import { LogViewToolbox } from "./LogViewToolbox.tsx";
import {
  Category,
  ExpandableJson,
  ExpandablePath,
  HttpResponseSummary,
  RequestFinishingIcon,
  RequestStartingIcon,
  ResetCategoryFilterButton,
  Timestamp,
} from "./elements.tsx";

type ResolvedAppiumLogEntry = AppiumLogEntry & {
  index: number;
  http?: {
    requestId: string;
    starting?: true;
    finishing?: true;
    request: AppiumLogHttpRequest;
  };
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
            } else if (categoryFilter.value === "hide debug") {
              return entry.level !== "debug";
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
                    <Category category={entry.category} level={entry.level} />
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
