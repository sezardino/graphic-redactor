import { RedactorContext } from "@/machines/redactor";
import { type ComponentPropsWithoutRef, type FC } from "react";
import { twMerge } from "tailwind-merge";
import { Playground } from "../modules/redactor/Playground";
import { send } from "xstate";

export interface PlaygroundTemplateProps
  extends ComponentPropsWithoutRef<"div"> {}

export const PlaygroundTemplate: FC<PlaygroundTemplateProps> = (props) => {
  const { className, ...rest } = props;
  const [value, send] = RedactorContext.useActor();

  console.log({ context: value.context.shapes });

  return (
    <section {...rest} className={twMerge("", className)}>
      <Playground
        shapes={value.context.shapes}
        onAddShape={(dto) => send({ type: "box.create", data: dto })}
      />
    </section>
  );
};
