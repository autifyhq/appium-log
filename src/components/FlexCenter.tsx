import { clsx, React } from "./../deps.ts";

type Props = {
  className?: string;
};

export const FlexCenter: React.FC<Props> = ({ className, children }) => {
  return (
    <div className={clsx("is-flex is-justify-content-center", className)}>
      {children}
    </div>
  );
};
