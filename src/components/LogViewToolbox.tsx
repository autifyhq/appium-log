import { React } from "../deps.ts";

const useSearchText = () => {
  const [text, setText] = React.useState("");
  return {
    text,
    setText,
  };
};

const SearchInput = () => {
  return (
    <p className="control has-icons-left">
      <input
        className="input"
        type="text"
        placeholder="Search"
      />
      <span className="icon is-small is-left">
        <i className="fas fa-search"></i>
      </span>
    </p>
  );
};

export const LogViewToolbox: React.VFC = () => {
  return (
    <section className="section">
      <SearchInput />
    </section>
  );
};
