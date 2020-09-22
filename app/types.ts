export type Point = {
  x: number;
  y: number;
};

export type BedType = {
  id: string;
  isSelected?: boolean;
  // isCreating: boolean;
  // isMoving?: boolean;
  // isResizing?: boolean;
  // resizeHandler?:
  //   | 'top'
  //   | 'right'
  //   | 'bottom'
  //   | 'left'
  //   | 'topLeft'
  //   | 'topRight'
  //   | 'bottomRight'
  //   | 'bottomLeft';
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
  BED_RESIZING,
}
