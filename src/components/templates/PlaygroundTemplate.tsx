import {
  MouseEvent,
  PointerEvent,
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
} from "react";
import { twMerge } from "tailwind-merge";

import { RedactorContext } from "@/machines/redactor";

import { Position, ShapeEntity } from "@/types";
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
  const playgroundRef = useRef<HTMLDivElement | null>(null);

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
    if (evt.shiftKey) return;

    const { x, y } = getMousePosition(evt);

    send({ type: "box.create", data: { position: { x, y } } });
  };

  const playgroundPointerDownHandler = (evt: PointerEvent<HTMLDivElement>) => {
    const { x, y } = getMousePosition(evt);

    send({ type: "box.select" });

    send({ type: "area-selection.start", data: { position: { x, y } } });
  };
  const playgroundPointerMoveHandler = (evt: PointerEvent<HTMLDivElement>) => {
    if (value.matches("area-selection")) {
      const { x, y } = getMousePosition(evt);

      send({ type: "area-selection.move", data: { position: { x, y } } });
    }

    if (value.matches("shape-move")) {
      if (!playgroundRef.current) return;

      const box = playgroundRef.current.getBoundingClientRect();

      const x = evt.clientX - box.left;
      const y = evt.clientY - box.top;

      requestAnimationFrame(() => moveShapeHandler({ x, y }));
    }
  };
  const playgroundPointerUpHandler = () => {
    if (value.matches("area-selection")) {
      send({ type: "area-selection.end" });
    }

    if (value.matches("shape-move")) {
      send("shape-move.end");
    }
  };

  const shapePointerDownHandler = (
    evt: PointerEvent<HTMLDivElement>,
    shape: ShapeEntity
  ) => {
    evt.stopPropagation();

    send({
      type: "box.select",
      data: { shape: shape.id, more: evt.shiftKey },
    });

    if (!playgroundRef.current) return;

    const box = playgroundRef.current.getBoundingClientRect();

    const x = evt.clientX - box.left;
    const y = evt.clientY - box.top;

    send({
      type: "shape-move.start",
      data: { position: { x, y } },
    });
  };

  const moveShapeHandler = (data: Position) =>
    send({ type: "shape-move.move", data });

  return (
    <section
      {...rest}
      ref={playgroundRef}
      className={twMerge(
        "w-screen h-screen bg-slate-400 bg-opacity-25 relative select-none overflow-hidden",
        className
      )}
      onDoubleClick={dabbleClickHandler}
      onPointerDown={playgroundPointerDownHandler}
      onPointerMove={playgroundPointerMoveHandler}
      onPointerUp={playgroundPointerUpHandler}
    >
      <div
        className={twMerge(
          "empty:hidden p-5 h-10 absolute top-5 left-1/2 -translate-x-1/2 bg-slate-500 rounded-sm flex items-center justify-center"
        )}
      >
        {JSON.stringify(value.context.shapeMove?.prevPosition)}
      </div>

      {value.context.shapes.map((shape) => (
        <Shape
          key={shape.id}
          dimension={shape.dimension}
          position={shape.position}
          type={shape.type}
          isSelected={value.context.selectedShapes.includes(shape.id)}
          onPointerDown={(evt) => shapePointerDownHandler(evt, shape)}
        />
      ))}
      {value.matches("area-selection") && value.context.selection?.end && (
        <Selection
          start={value.context.selection.start}
          end={value.context.selection.end}
        />
      )}
    </section>
  );
};
