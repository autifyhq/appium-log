import { React } from "../deps.ts";
import type { Store } from "../core/hooks.ts";

const SearchInput: React.VFC<
  { value: string; onChange: (value: string) => void }
> = ({
  value,
  onChange,
}) => {
  return (
    <p className="control has-icons-left">
      <input
        className="input"
        type="text"
        placeholder="Search"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
      />
      <span className="icon is-small is-left">
        <i className="fas fa-search"></i>
      </span>
    </p>
  );
};

const SearchContextLineInput: React.VFC<
  { value: number; onChange: (value: number) => void }
> = ({
  value,
  onChange,
}) => {
  return (
    <p className="control">
      <input
        className="input"
        type="number"
        value={value}
        onChange={(ev) => onChange(Number(ev.target.value))}
      />
    </p>
  );
};

export const LogViewToolbox: React.VFC<{ store: Store }> = ({ store }) => {
  const {
    search,
    contextLines,
  } = store;
  return (
    <section className="section">
      <SearchInput value={search.text} onChange={search.setText} />
      <SearchContextLineInput
        value={contextLines.count}
        onChange={contextLines.setCount}
      />
    </section>
  );
};
