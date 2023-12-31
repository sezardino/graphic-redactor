// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    areaSelectionEnd: "area-selection.end";
    areaSelectionMove: "area-selection.move";
    areaSelectionStart: "area-selection.start";
    createShape: "box.create";
    deleteSelected: "box.select.delete";
    selectShape: "box.select";
    shapeMoveEnd: "shape-move.end";
    shapeMoveMove: "shape-move.move";
    shapeMoveStart: "shape-move.start";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates: "area-selection" | "initial" | "shape-move";
  tags: never;
}
