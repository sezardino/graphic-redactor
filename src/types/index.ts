export type ShapeType = "rect" | "circle";

export type CreateShapeDto = Pick<ShapeEntity, "position"> & {
  dimension?: Dimension;
  type?: ShapeType;
};

export type SelectShapesDto = {
  shape: string | string[];
  more?: boolean;
};

export type SelectionDto = {
  position: Position;
};

export interface ShapeEntity {
  id: string;
  type: ShapeType;
  position: Position;
  dimension: Dimension;
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}
