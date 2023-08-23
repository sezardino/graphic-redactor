import {
  CreateShapeDto,
  SelectShapesDto,
  ShapeEntity,
} from "@/machines/redactor";
import { MouseEvent, type ComponentPropsWithoutRef, type FC } from "react";
import { twMerge } from "tailwind-merge";
import { Shape } from "./Shape";

export interface PlaygroundProps extends ComponentPropsWithoutRef<"div"> {
  shapes: ShapeEntity[];
  onAddShape: (data: CreateShapeDto) => void;
  selectedShapes: string[];
  onSelectShape: (data: SelectShapesDto) => void;
}

export const Playground: FC<PlaygroundProps> = (props) => {
  const {
    onSelectShape,
    selectedShapes,
    onAddShape,
    shapes,
    className,
    ...rest
  } = props;

  const dabbleClickHandler = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;

    const box = event.currentTarget.getBoundingClientRect();

    const x = clientX - box.left;
    const y = clientY - box.top;

    onAddShape({ position: { x, y } });
  };

  return (
    <div
      {...rest}
      className={twMerge(
        "w-[75vw] h-[75vh] bg-slate-400 bg-opacity-25 relative",
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
          isSelected={selectedShapes.includes(shape.id)}
          onClick={(evt) =>
            onSelectShape({ shape: shape.id, more: evt.shiftKey })
          }
        />
      ))}
    </div>
  );
};
