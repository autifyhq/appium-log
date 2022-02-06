import { React } from "../deps.ts";

const useTitle = () => {
  const [value, set] = React.useState("appium.log");
  React.useEffect(() => {
    document.title = value || "appium.log";
  }, [value]);
  return {
    value,
    set,
  };
};

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

export const DEFAULT_CATEGORY_FILTER = "all";

const useCategoryFilter = () => {
  const [value, set] = React.useState<"all" | "HTTP">(DEFAULT_CATEGORY_FILTER);
  return {
    value,
    set,
  };
};

const useRequestDurationFilter = () => {
  const [value, set] = React.useState(0);
  return {
    value,
    set,
  };
};

export const useAllState = () => {
  const title = useTitle();
  const search = useSearchText();
  const contextLines = useContextLines();
  const timestampFormat = useTimestampFormat();
  const categoryFilter = useCategoryFilter();
  const requestDurationFilter = useRequestDurationFilter();

  return {
    title,
    search,
    contextLines,
    timestampFormat,
    categoryFilter,
    requestDurationFilter,
  };
};

export type TimestampFormat = "relative" | "absolute";
export type Store = ReturnType<typeof useAllState>;
