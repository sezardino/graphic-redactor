import { CreateShapeDto, ShapeEntity } from "@/machines/redactor";
import { MouseEvent, type ComponentPropsWithoutRef, type FC } from "react";
import { twMerge } from "tailwind-merge";
import { Shape } from "./Shape";

export interface PlaygroundProps extends ComponentPropsWithoutRef<"div"> {
  shapes: ShapeEntity[];
  onAddShape: (data: CreateShapeDto) => void;
}

export const Playground: FC<PlaygroundProps> = (props) => {
  const { onAddShape, shapes, className, ...rest } = props;

  const dabbleClickHandler = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;

    console.log({ clientX, clientY });
    onAddShape({ position: { x: clientX, y: clientY } });
  };

  return (
    <div
      {...rest}
      className={twMerge(
        "w-[100vw] h-[100vh] bg-slate-400 bg-opacity-25 relative",
        className
      )}
      onDoubleClick={dabbleClickHandler}
    >
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          dimension={shape.dimension}
          position={shape.position}
          type={shape.type}
          isSelected={false}
        />
      ))}
    </div>
  );
};
