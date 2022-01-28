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
  const [count, setCount] = React.useState(5);
  return {
    count,
    setCount,
  };
};

const useTimestampFormat = () => {
  const [format, setFormat] = React.useState<TimestampFormat>("relative");
  return {
    format,
    setFormat,
  };
};

export const useAllState = () => {
  const search = useSearchText();
  const contextLines = useContextLines();
  const timestampFormat = useTimestampFormat();

  return {
    search,
    contextLines,
    timestampFormat,
  };
};

export type TimestampFormat = "relative" | "absolute";
export type Store = ReturnType<typeof useAllState>;
