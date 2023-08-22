import { createActorContext } from "@xstate/react";
import { assign, createMachine } from "xstate";

export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export type ShapeType = "rect" | "circle";

export type CreateShapeDto = Pick<ShapeEntity, "position"> & {
  dimension?: Dimension;
  type?: ShapeType;
};

export interface ShapeEntity {
  id: string;
  type: ShapeType;
  position: Position;
  dimension: Dimension;
}

type Context = {
  shapes: ShapeEntity[];
};

const redactorMachine = createMachine(
  {
    id: "redactor",
    context: {
      shapes: [],
    } as Context,
    on: {
      "box.create": {
        internal: true,
        actions: ["createShape"],
      },
      "box.delete": {
        internal: true,
      },
    },
    schema: {
      events: {} as
        | { type: "box.create"; data: CreateShapeDto }
        | { type: "box.delete"; shapeId: string },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import("./redactor.typegen").Typegen0,
  },
  {
    actions: {
      createShape: assign((context, event) => {
        const {
          data: { position, type, dimension },
        } = event;

        return {
          shapes: context.shapes.concat({
            id: crypto.randomUUID(),
            type: type ?? "rect",
            position,
            dimension: {
              height: dimension?.height ?? 100,
              width: dimension?.width ?? 100,
            },
          }),
        };
      }),
    },
    services: {},
    guards: {},
    delays: {},
  }
);

export const RedactorContext = createActorContext(redactorMachine);
