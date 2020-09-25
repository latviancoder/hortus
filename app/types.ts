export type Point = {
  x: number;
  y: number;
};

export type BedType = {
  id: string;
  isSelected?: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

export enum Mode {
  NOTHING,
  BED_MOVING,
  BED_CREATING,
  RESIZING,
}

export enum Handlers {
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
}
