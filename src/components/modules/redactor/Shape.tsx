import { Dimension, Position, ShapeType } from "@/machines/redactor";
import { type ComponentPropsWithoutRef, type FC } from "react";
import { twMerge } from "tailwind-merge";

export interface ShapeProps extends ComponentPropsWithoutRef<"div"> {
  dimension: Dimension;
  position: Position;
  isSelected: boolean;
  type: ShapeType;
}

export const Shape: FC<ShapeProps> = (props) => {
  const { type, isSelected, dimension, position, className, ...rest } = props;

  return (
    <div
      {...rest}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${dimension.width}px`,
        height: `${dimension.height}px`,
      }}
      className={twMerge(`absolute bg-red-100`, className)}
    ></div>
  );
};
