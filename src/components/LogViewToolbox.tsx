import { React } from "../deps.ts";
import type { Store, TimestampFormat } from "../core/hooks.ts";

const TitleInput: React.VFC<
  { value: string; onChange: (value: string) => void }
> = ({
  value,
  onChange,
}) => {
  return (
    <div className="mr-2">
      <label className="is-size-7">title</label>
      <div className="control has-icons-left">
        <input
          className="input is-small"
          type="text"
          placeholder="Title"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
        <span className="icon is-small is-left">
          <i className="fas fa-globe"></i>
        </span>
      </div>
    </div>
  );
};

const TotalLines: React.VFC<{ lines: number }> = ({ lines }) => {
  return (
    <div className="mr-2">
      <label className="is-size-7">lines</label>
      <div className="control">
        {/* @ts-ignore */}
        <span className="input is-small border-none" readOnly>{lines}</span>
      </div>
    </div>
  );
};

const SearchInput: React.VFC<
  { value: string; onChange: (value: string) => void }
> = ({
  value,
  onChange,
}) => {
  return (
    <div className="mr-2">
      <label className="is-size-7">search</label>
      <div className="control has-icons-left">
        <input
          className="input is-small"
          type="text"
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
        />
        <span className="icon is-small is-left">
          <i className="fas fa-search"></i>
        </span>
      </div>
    </div>
  );
};

const SearchContextLineInput: React.VFC<
  { value: number; onChange: (value: number) => void }
> = ({
  value,
  onChange,
}) => {
  return (
    <div className="mr-2 max-width-3em">
      <label className="is-size-7">+</label>
      <div className="control">
        <input
          className="input is-small"
          type="number"
          value={value}
          onChange={(ev) => onChange(Number(ev.target.value))}
          min={0}
        />
      </div>
    </div>
  );
};

const TimestampSelect: React.VFC<
  { value: string; onChange: (value: TimestampFormat) => void }
> = ({
  value,
  onChange,
}) => {
  return (
    <div className="mr-2">
      <label className="is-size-7">timestamp</label>
      <div className="control select is-small is-block">
        <select
          value={value}
          onChange={(ev) => onChange(ev.target.value as TimestampFormat)}
        >
          <option value="relative">relative</option>
          <option value="absolute">absolute</option>
        </select>
      </div>
    </div>
  );
};

export const LogViewToolbox: React.VFC<{ store: Store; lines: number }> = (
  { store, lines },
) => {
  const {
    title,
    search,
    contextLines,
    timestampFormat,
  } = store;
  return (
    <section className="log-view-toolbox px-4 py-2">
      <div className="level">
        <div className="level-left">
          <TitleInput value={title.value} onChange={title.set} />
        </div>
        <div className="level-right">
          <TotalLines lines={lines} />
          <SearchInput value={search.text} onChange={search.setText} />
          <SearchContextLineInput
            value={contextLines.count}
            onChange={contextLines.setCount}
          />
          <TimestampSelect
            value={timestampFormat.format}
            onChange={timestampFormat.setFormat}
          />
        </div>
      </div>
    </section>
  );
};
