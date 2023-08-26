import {
  MouseEvent,
  PointerEvent,
  useEffect,
  type ComponentPropsWithoutRef,
  type FC,
} from "react";
import { twMerge } from "tailwind-merge";

import { RedactorContext } from "@/machines/redactor";

import { Playground } from "../modules/redactor/Playground";
import { Selection } from "../modules/redactor/Selection";
import { Shape } from "../modules/redactor/Shape";

const getMousePosition = (evt: MouseEvent<HTMLElement>) => {
  const { clientX, clientY } = evt;

  const box = evt.currentTarget.getBoundingClientRect();

  const x = clientX - box.left;
  const y = clientY - box.top;

  return { x, y };
};

export interface PlaygroundTemplateProps
  extends ComponentPropsWithoutRef<"div"> {}

export const PlaygroundTemplate: FC<PlaygroundTemplateProps> = (props) => {
  const { className, ...rest } = props;
  const [value, send] = RedactorContext.useActor();

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace")
        send({ type: "box.select.delete" });

      if (event.key === "Escape") send({ type: "box.select" });
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [send]);

  const dabbleClickHandler = (evt: MouseEvent<HTMLDivElement>) => {
    const { x, y } = getMousePosition(evt);

    send({ type: "box.create", data: { position: { x, y } } });
  };

  const pointerDownHandler = (evt: PointerEvent<HTMLDivElement>) => {
    const { x, y } = getMousePosition(evt);

    send({ type: "area-selection.start", data: { position: { x, y } } });
  };
  const pointerMoveHandler = (evt: PointerEvent<HTMLDivElement>) => {
    const { x, y } = getMousePosition(evt);

    send({ type: "area-selection.move", data: { position: { x, y } } });
  };
  const pointerUpHandler = () => {
    send({ type: "area-selection.end" });
  };

  return (
    <section {...rest} className={twMerge("", className)}>
      <Playground
        onClick={() => send({ type: "box.select" })}
        onDoubleClick={dabbleClickHandler}
        onPointerDown={pointerDownHandler}
        onPointerMove={pointerMoveHandler}
        onPointerUp={pointerUpHandler}
      >
        {value.context.shapes.map((shape) => (
          <Shape
            key={shape.id}
            dimension={shape.dimension}
            position={shape.position}
            type={shape.type}
            isSelected={value.context.selectedShapes.includes(shape.id)}
            onClick={(evt) => {
              evt.stopPropagation();
              send({
                type: "box.select",
                data: { shape: shape.id, more: evt.shiftKey },
              });
            }}
          />
        ))}
        {value.matches("area-selection") && value.context.selection && (
          <Selection
            start={value.context.selection.start}
            end={value.context.selection.end}
          />
        )}
      </Playground>
    </section>
  );
};
