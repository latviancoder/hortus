import React, { memo } from 'react';
// @ts-ignore
import { useValue } from 'react-native-redash/lib/module/v1';
import Animated, { call, divide } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';

import { layout, useTypedSelector } from '../reducer';
import { useHelpers } from '../helpers';
import { BedType, Handlers } from '../types';
import { useOnPanEnd } from '../bed/Bed';

type Props = {
  type: Handlers;
  handler: any;
  bed: BedType;
};

export const Handler = memo(({ type, handler, bed }: Props) => {
  const { state, translation, gestureHandler } = handler;
  const offset = useTypedSelector(({ offset }) => offset);

  const {
    actions: { updateBed },
  } = layout;
  const dispatch = useDispatch();

  const { metersToX, xToMeters, yToMeters } = useHelpers();

  const offsetValue = useValue(metersToX(offset));

  const handlerStyles: any = {
    [Handlers.topLeft]: {
      top: 0,
      left: 0,
    },
    [Handlers.topRight]: {
      top: 0,
      right: 0,
    },
    [Handlers.bottomLeft]: {
      bottom: 0,
      left: 0,
    },
    [Handlers.bottomRight]: {
      bottom: 0,
      right: 0,
    },
  };

  useOnPanEnd(
    state,
    call([translation.x, translation.y], ([tX, tY]) => {
      let width = bed.width;
      let height = bed.height;
      let x = bed.x;
      let y = bed.y;

      if ([Handlers.topLeft, Handlers.topRight].includes(type)) {
        height -= yToMeters(tY);
        y += yToMeters(tY);
      }

      if ([Handlers.bottomLeft, Handlers.bottomRight].includes(type)) {
        height += yToMeters(tY);
      }

      if ([Handlers.topLeft, Handlers.bottomLeft].includes(type)) {
        width -= xToMeters(tX);
        x += xToMeters(tX);
      }

      if ([Handlers.topRight, Handlers.bottomRight].includes(type)) {
        width += xToMeters(tX);
      }

      dispatch(
        updateBed({
          id: bed.id,
          width,
          height,
          x,
          y,
        }),
      );
    }),
    [state, translation, bed, type],
  );

  return (
    <PanGestureHandler {...gestureHandler}>
      <Animated.View
        style={[
          styles.handler,
          {
            width: divide(offsetValue, 2),
            height: divide(offsetValue, 2),
            ...handlerStyles[type],
          },
        ]}
      />
    </PanGestureHandler>
  );
});

const styles = StyleSheet.create({
  handler: {
    backgroundColor: 'red',
    position: 'absolute',
  },
});
