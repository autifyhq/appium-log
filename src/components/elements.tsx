import { copy, React } from "../deps.ts";
import { TimestampFormat } from "../core/hooks.ts";
import { AppiumLogTimestamp } from "../core/parseAppiumLog.ts";

export const Timestamp: React.VFC<
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

export const Category: React.VFC<{ category: string }> = ({ category }) => (
  <span className="tag is-link">{category}</span>
);

export const RequestStartingIcon = () => (
  <span className="icon has-text-info mr-1">
    <i className="fas fa-arrow-right"></i>
  </span>
);

export const RequestFinishingIcon = () => (
  <span className="icon has-text-info mr-1">
    <i className="fas fa-arrow-left"></i>
  </span>
);

export const ExpansionButton: React.VFC<
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

export const ExpandablePath: React.VFC<{ path: string; shortPath?: string }> = (
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

export const CopyButton: React.VFC<{ text: string }> = ({ text }) => {
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

export const ResetCategoryFilterButton: React.VFC<
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

export const ExpandableJson: React.VFC<{ json: string }> = ({ json }) => {
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

export const HttpResponseSummary: React.VFC<
  { status: number; millisecond: number }
> = ({ status, millisecond }) => {
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
