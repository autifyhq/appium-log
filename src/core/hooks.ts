import { React } from "../deps.ts";

const useDelayedEffect = (
  callback: () => void,
  delay: number,
  deps: React.DependencyList,
) => {
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      callback();
    }, delay);
    return () => {
      clearTimeout(timeout);
    };
  }, deps);
};

const useSearchText = () => {
  const [text, setText] = React.useState("");
  const [commitedText, setCommitedText] = React.useState("");
  useDelayedEffect(
    () => {
      setCommitedText(text);
    },
    300,
    [text],
  );
  return {
    text,
    commitedText,
    setText,
  };
};

const useContextLines = () => {
  const [count, setCount] = React.useState(0);
  return {
    count,
    setCount,
  };
};

export const useAllState = () => {
  const search = useSearchText();
  const contextLines = useContextLines();

  return {
    search,
    contextLines,
  };
};

export type Store = ReturnType<typeof useAllState>;
