import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDimensions } from '../useDimensions';
import { Layout } from './Layout';
import { layout, LayoutState, useTypedSelector } from '../reducer';

export const LayoutContainer = () => {
  const plot = useTypedSelector(({ plot }) => plot);
  const canvas = useTypedSelector(({ canvas }) => canvas);

  const { actions } = layout;
  const dispatch = useDispatch();

  const dimensions = useDimensions();

  // Set canvas size
  useEffect(() => {
    let width;
    let height;

    if (dimensions) {
      if (dimensions.width / dimensions.height >= plot.width / plot.height) {
        width = dimensions.height * (plot.width / plot.height);
        height = dimensions.height;
      } else {
        width = dimensions.width;
        height = dimensions.width * (plot.height / plot.width);
      }
    }

    if (width && height) {
      dispatch(actions.setCanvasSize({ width, height }));
    }

    // todo better
    dispatch(actions.setOffset(plot.width / 30));
  }, [plot, dimensions]);

  if (!dimensions || !canvas) {
    return null;
  }

  return <Layout />;
};
