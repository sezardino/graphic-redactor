import {
  CreateShapeDto,
  Position,
  SelectShapesDto,
  SelectionDto,
  ShapeEntity,
  ShapeMoveMoveDto,
  ShapeMoveStartDto,
  Shift,
} from "@/types";
import { createActorContext } from "@xstate/react";
import { assign, createMachine } from "xstate";

type Context = {
  selectedShapes: string[];
  shapes: ShapeEntity[];
  shapeMove: {
    shapeId: string;
    shift: Shift;
  } | null;
  selection: {
    start: Position;
    end: Position | null;
  } | null;
};

const redactorMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCdIEMDGAXA9sgxAEY4AeAdBqmlmANoAMAuoqAA46wCWWnOAdixAlEAJgDMANjJiR9GQFYALAHY5ADjEBONQBoQAT1H1FZTfQkj5yxccVr6ARjEBfZ3tQRMuAsXKwwADZg2AzMSCDsXDz8gsII4spkDsqaEpraig5qVhLyeoYIDvRqZIryYg4OmoppWpoOru7o2HhEpGT+QdhkEIFgNKGCkdy8AuFxIlVk9OKKKmKZDjZO+YgOIo0gHl54ZJx8I2gB+GhUALSdwdF8HVinWIPhw9exa7lJjvISYsWaYvKWZSrBASd6TNTWeiqBbyBpuLbNbx7A48I74WAACzQrDAZwAtjgAG5gW73R5sDgjGLjN7yD4OL4-NR-AFWYEqETSdZ2SyTZRifmbbYtZBkU5gNAXPrYUYnc6XGX8MgE4nkiKUl40hCSRIiVIQ+jFeSGsRiYHyZlkayTCRlFKSeSaIWI3biyUK65yiVSrrXMhgPgQNXPUavQrKTkiXLfDSVewOc0SErKaPrQ3rIpO+HCpGY7G4lVgdFYnH4okkgNBphDDWhrVZKSOgViDS2lPJXQGRACunZP7fVLWKzWZ2eEUdEsF8vF-Nl4nK8vB2vU0BxHVkPVJtTZY1J1nArRSDSO3mwzTGrPwvg4XrwcI5vA1qJ11eIM4JrvxbfSJsSFOZdQXGzF1RX2Q4AifKkxlfBAVGBP86SWAFNAjFDxAkUcdlFN0fSuF91WfFchG7eoN0UdJtGUDtHWyeDSKqZCZDUBwJHoR1MPHPNS0LSDNRgrQHDIiiIWo7Q8k-ciShEZk2K0JQqjhVwgA */
    id: "redactor",
    initial: "initial",
    schema: {
      events: {} as
        | { type: "box.create"; data: CreateShapeDto }
        | { type: "box.select"; data?: SelectShapesDto }
        | { type: "box.select.delete" }
        | { type: "area-selection.start"; data: SelectionDto }
        | { type: "area-selection.move"; data: SelectionDto }
        | { type: "area-selection.end" }
        | { type: "shape-move.start"; data: ShapeMoveStartDto }
        | { type: "shape-move.move"; data: ShapeMoveMoveDto }
        | { type: "shape-move.end" },
    },
    context: {
      selectedShapes: [],
      shapes: [],
      selection: null,
      shapeMove: null,
    } as Context,
    states: {
      initial: {
        on: {
          "area-selection.start": {
            target: "area-selection",
            actions: ["areaSelectionStart"],
          },

          "shape-move.start": {
            target: "shape-move",
            actions: "shapeMoveStart",
          },
        },
      },

      "area-selection": {
        on: {
          "area-selection.move": {
            actions: ["areaSelectionMove"],
            internal: true,
          },
          "area-selection.end": {
            target: "initial",
            actions: ["areaSelectionEnd"],
          },
        },
      },

      "shape-move": {
        on: {
          "shape-move.end": {
            target: "initial",
            actions: "shapeMoveEnd",
          },

          "shape-move.move": {
            target: "shape-move",
            internal: true,
            actions: "shapeMoveMove",
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
          selectedShapes: [],
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

        if (!Array.isArray(shape) && context.selectedShapes.includes(shape)) {
          return {
            selectedShapes: context.selectedShapes.filter((s) => s !== shape),
          };
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
            end: null,
          },
        };
      }),
      areaSelectionMove: assign((context, event) => {
        if (context.selection === null) return {};

        const shapesInSelection = context.shapes.filter((shape) => {
          if (!context.selection) return false;
          if (!context.selection.end) return false;

          const { start, end } = context.selection;

          const [xSStart, xSEnd] = [
            Math.min(start.x, end.x),
            Math.max(start.x, end.x),
          ];
          const [ySStart, ySEnd] = [
            Math.min(start.y, end.y),
            Math.max(start.y, end.y),
          ];

          const [xStart, xEnd] = [
            shape.position.x,
            shape.position.x + shape.dimension.width,
          ];
          const [yStart, yEnd] = [
            shape.position.y,
            shape.position.y + shape.dimension.height,
          ];

          return (
            yEnd >= ySStart &&
            yStart <= ySEnd &&
            xEnd >= xSStart &&
            xStart <= xSEnd
          );
        });

        return {
          selection: {
            ...context.selection,
            end: event.data.position,
          },
          selectedShapes: shapesInSelection.map((shape) => shape.id),
        };
      }),
      areaSelectionEnd: assign((context) => {
        if (context.selection === null) return {};

        return { selection: null };
      }),
      shapeMoveStart: assign((_, event) => ({
        shapeMove: {
          shapeId: event.data.shape,
          shift: event.data.shift,
        },
      })),
      shapeMoveMove: assign((context, event) => {
        if (!context.shapeMove) return {};
        const newShapes = context.shapes.map((s) => {
          if (s.id !== context.shapeMove?.shapeId) return s;

          const newPosition = {
            x: event.data.position.x - context.shapeMove.shift.x,
            y: event.data.position.y - context.shapeMove.shift.y,
          };

          return { ...s, position: newPosition };
        });

        return {
          shapes: newShapes,
        };
      }),
      shapeMoveEnd: assign(() => ({ shapeMove: null })),
    },
    services: {},
    guards: {},
    delays: {},
  }
);

export const RedactorContext = createActorContext(redactorMachine);
