import { type ComponentPropsWithoutRef, type FC } from "react";
import { twMerge } from "tailwind-merge";

import { Position } from "@/types";

export interface SelectionProps extends ComponentPropsWithoutRef<"div"> {
  start: Position;
  end: Position;
}

export const Selection: FC<SelectionProps> = (props) => {
  const { start, end, className, ...rest } = props;

  const maxY = Math.max(start.y, end.y);
  const minY = Math.min(start.y, end.y);
  const maxX = Math.max(start.x, end.x);
  const minX = Math.min(start.x, end.x);

  return (
    <div
      {...rest}
      style={{
        top: `${minY}px`,
        left: `${minX}px`,
        width: `${maxX - minX}px`,
        height: `${maxY - minY}px`,
      }}
      className={twMerge(
        "absolute bg-black bg-opacity-5 border-2 border-black",
        className
      )}
    />
  );
};
