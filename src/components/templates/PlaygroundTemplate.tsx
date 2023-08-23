import { RedactorContext } from "@/machines/redactor";
import { useEffect, type ComponentPropsWithoutRef, type FC } from "react";
import { twMerge } from "tailwind-merge";
import { Playground } from "../modules/redactor/Playground";

export interface PlaygroundTemplateProps
  extends ComponentPropsWithoutRef<"div"> {}

export const PlaygroundTemplate: FC<PlaygroundTemplateProps> = (props) => {
  const { className, ...rest } = props;
  const [value, send] = RedactorContext.useActor();

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        send({ type: "box.select.delete" });
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => document.removeEventListener("keydown", keyDownHandler);
  }, [send]);

  return (
    <section {...rest} className={twMerge("", className)}>
      <Playground
        shapes={value.context.shapes}
        onAddShape={(dto) => send({ type: "box.create", data: dto })}
        selectedShapes={value.context.selectedShapes}
        onSelectShape={(data) => send({ type: "box.select", data })}
        onClick={() => send({ type: "box.select" })}
      />
    </section>
  );
};
