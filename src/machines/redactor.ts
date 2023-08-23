import {
  CreateShapeDto,
  Position,
  SelectShapesDto,
  SelectionDto,
  ShapeEntity,
} from "@/types";
import { createActorContext } from "@xstate/react";
import { assign, createMachine } from "xstate";

type Context = {
  selectedShapes: string[];
  shapes: ShapeEntity[];
  selection: {
    start: Position;
    end: Position;
  } | null;
};

const redactorMachine = createMachine(
  {
    id: "redactor",
    initial: "initial",
    schema: {
      events: {} as
        | { type: "box.create"; data: CreateShapeDto }
        | { type: "box.select"; data?: SelectShapesDto }
        | { type: "box.select.delete" }
        | { type: "area-selection.start"; data: SelectionDto }
        | { type: "area-selection.move"; data: SelectionDto }
        | { type: "area-selection.end" },
    },
    context: {
      selectedShapes: [],
      shapes: [],
      selection: null,
    } as Context,
    states: {
      initial: {
        on: {
          "area-selection.start": {
            target: "area-selection",
            actions: ["areaSelectionStart"],
          },
        },
      },
      "area-selection": {
        on: {
          "area-selection.end": {
            target: "initial",
            actions: ["areaSelectionEnd"],
          },
          "area-selection.move": {
            actions: ["areaSelectionMove"],
            internal: true,
          },
        },
      },
    },
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
      areaSelectionStart: assign((_, event) => {
        return {
          selection: {
            start: event.data.position,
            end: event.data.position,
          },
        };
      }),
      areaSelectionMove: assign((context, event) => {
        if (context.selection === null) return {};

        return {
          selection: {
            ...context.selection,
            end: event.data.position,
          },
        };
      }),
      areaSelectionEnd: assign((context) => {
        if (context.selection === null) return {};

        return {
          selection: null,
        };
      }),
    },
    services: {},
    guards: {},
    delays: {},
  }
);

export const RedactorContext = createActorContext(redactorMachine);
