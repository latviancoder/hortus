import { useTypedSelector } from './reducer';
import { useCallback } from 'react';
import { Point } from './types';

export const isPointInside = (
  { x, y }: Point,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
) => {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
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
