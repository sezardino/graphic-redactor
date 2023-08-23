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

export type SelectShapesDto = {
  shape: string | string[];
  more?: boolean;
};

export interface ShapeEntity {
  id: string;
  type: ShapeType;
  position: Position;
  dimension: Dimension;
}

type Context = {
  selectedShapes: string[];
  shapes: ShapeEntity[];
};

const redactorMachine = createMachine(
  {
    id: "redactor",
    context: {
      selectedShapes: [],
      shapes: [],
    } as Context,
    on: {
      "box.create": {
        internal: true,
        actions: ["createShape"],
      },
      "box.select": {
        internal: true,
        actions: ["selectShape"],
      },
      "box.select.delete": {
        internal: true,
        actions: ["deleteSelected"],
      },
    },
    schema: {
      events: {} as
        | { type: "box.create"; data: CreateShapeDto }
        | { type: "box.select"; data?: SelectShapesDto }
        | { type: "box.select.delete" },
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
      selectShape: assign((context, event) => {
        if (event.data === undefined) {
          return { selectedShapes: [] };
        }

        const { more = false, shape } = event.data;

        if (more) {
          return { selectedShapes: context.selectedShapes.concat(shape) };
        }

        return {
          selectedShapes: Array.isArray(shape) ? shape : [shape],
        };
      }),
      deleteSelected: assign((context) => {
        return {
          shapes: context.shapes.filter(
            (shape) => !context.selectedShapes.includes(shape.id)
          ),
          selectedShapes: [],
        };
      }),
    },
    services: {},
    guards: {},
    delays: {},
  }
);

export const RedactorContext = createActorContext(redactorMachine);
