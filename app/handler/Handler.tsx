import React, { memo } from 'react';
// @ts-ignore
import { useValue } from 'react-native-redash/lib/module/v1';
import Animated, { call, divide, round } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { layout, useTypedSelector } from '../reducer';
import { useHelpers, useOnPanEnd } from '../helpers';
import { BedType, Handlers } from '../types';

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
      cursor: 'nwse-resize',
    },
    [Handlers.topRight]: {
      top: 0,
      right: 0,
      cursor: 'nesw-resize',
    },
    [Handlers.bottomLeft]: {
      bottom: 0,
      left: 0,
      cursor: 'nesw-resize',
    },
    [Handlers.bottomRight]: {
      bottom: 0,
      right: 0,
      cursor: 'nwse-resize',
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
          styles.handlerContainer,
          {
            width: round(divide(offsetValue, 2)),
            height: round(divide(offsetValue, 2)),
            ...handlerStyles[type],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.handler,
            {
              width: round(divide(offsetValue, 3)),
              height: round(divide(offsetValue, 3)),
            },
          ]}
        />
      </Animated.View>
    </PanGestureHandler>
  );
});

const styles = StyleSheet.create({
  handlerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handler: {
    borderColor: '#aaa',
    borderWidth: 2,
  },
});
