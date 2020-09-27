import {useTypedSelector} from './reducer';
import {useCallback} from 'react';
import {Point} from './types';
import {useValue} from 'react-native-redash/lib/module/v1';
import Animated, {and, cond, eq, set, useCode} from 'react-native-reanimated';
import {State} from "react-native-gesture-handler";

export const distanceBetweenPointAndSegment = (
  { x, y }: Point,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSquare = C * C + D * D;
  let param = -1;
  if (lenSquare !== 0) {
    // in case of 0 length line
    param = dot / lenSquare;
  }

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.hypot(dx, dy);
};

export const isPointOnBorder = (
  point: Point,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  offset: number,
) => {
  return (
    distanceBetweenPointAndSegment(point, x1, y1, x2, y1) < offset ||
    distanceBetweenPointAndSegment(point, x2, y1, x2, y2) < offset ||
    distanceBetweenPointAndSegment(point, x2, y2, x1, y2) < offset ||
    distanceBetweenPointAndSegment(point, x1, y2, x1, y1) < offset
  );
};

export const isPointInside = (
  { x, y }: Point,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
) => {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
};

export const distanceBetweenPoints = (point1: Point, point2: Point) => {
  const a = point1.x - point2.x;
  const b = point1.y - point2.y;

  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
};

export const useHelpers = () => {
  const plot = useTypedSelector(({ plot }) => plot);
  const canvas = useTypedSelector(({ canvas }) => canvas!);

  const xToMeters = useCallback((x) => (plot.width * x) / canvas.width, [
    plot.width,
    canvas.width,
  ]);
  const yToMeters = useCallback((y) => (plot.height * y) / canvas.height, [
    plot.height,
    canvas.height,
  ]);

  const metersToX = useCallback((x) => (x / plot.width) * canvas.width, [
    plot.width,
    canvas.width,
  ]);
  const metersToY = useCallback((y) => (y / plot.height) * canvas.height, [
    plot.height,
    canvas.height,
  ]);

  return {
    xToMeters,
    yToMeters,
    metersToX,
    metersToY,
  };
};

export const usePrevState = (state: any) => {
  const prevState = useValue(state);

  useCode(() => set(prevState, state), [state]);

  return prevState;
};

export const useOnPanEnd = (
  state: Animated.Value<import('react-native-gesture-handler').State>,
  cb: Animated.Node<any>,
  dependencies: any[],
) => {
  useCode(
    () => cond(and(eq(state, State.END), eq(prevState, State.ACTIVE)), cb),
    dependencies,
  );

  const prevState = usePrevState(state);
};