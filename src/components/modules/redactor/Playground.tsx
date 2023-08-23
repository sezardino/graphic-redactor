import { type ComponentPropsWithoutRef, type FC } from "react";
import { twMerge } from "tailwind-merge";

export interface PlaygroundProps extends ComponentPropsWithoutRef<"div"> {}

export const Playground: FC<PlaygroundProps> = (props) => {
  const { className, children, ...rest } = props;

  return (
    <div
      {...rest}
      className={twMerge(
        "w-[75vw] h-[75vh] bg-slate-400 bg-opacity-25 relative",
        className
      )}
    >
      {children}
    </div>
  );
};
