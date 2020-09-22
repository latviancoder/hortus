import React, { memo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  and,
  block,
  call,
  cond,
  debug,
  eq,
  or,
  set,
  useCode,
  Value,
} from 'react-native-reanimated';
import {
  usePanGestureHandler,
  useValue, // @ts-ignore
} from 'react-native-redash/lib/module/v1';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';

import { BedType, Mode } from '../types';
import { useHelpers } from '../helpers';
import { layout, useTypedSelector } from '../reducer';

const usePrevState = (
  state: Animated.Value<import('react-native-gesture-handler').State>,
) => {
  const prevState = useValue(0);

  useCode(() => set(prevState, state), [state]);

  return prevState;
};

const useOnPanEnd = (
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

const useOnPanStart = (
  state: Animated.Value<import('react-native-gesture-handler').State>,
  cb: Animated.Node<any>,
  dependencies: any[],
) => {
  useCode(
    () =>
      cond(
        and(
          eq(state, State.ACTIVE),
          or(
            eq(prevState, State.UNDETERMINED),
            eq(prevState, State.END),
            eq(prevState, State.BEGAN),
          ),
        ),
        cb,
      ),
    dependencies,
  );

  const prevState = usePrevState(state);
};

export const Bed = memo(
  ({ id, height, width, x, y, isSelected, zIndex }: BedType) => {
    const {
      actions: { updateBed },
    } = layout;
    const dispatch = useDispatch();

    const isSelectedValue = new Value(isSelected ? 1 : 0);

    const { gestureHandler, translation, state } = usePanGestureHandler();

    const { metersToY, metersToX, xToMeters, yToMeters } = useHelpers();

    const translateX = cond(
      and(eq(isSelectedValue, 1), eq(state, State.ACTIVE)),
      translation.x,
      0,
    );

    const translateY = cond(
      and(eq(isSelectedValue, 1), eq(state, State.ACTIVE)),
      translation.y,
      0,
    );

    useOnPanEnd(
      state,
      call([translation.x, translation.y], ([tX, tY]) => {
        if (isSelected) {
          dispatch(
            updateBed({
              id,
              x: x + xToMeters(tX),
              y: y + yToMeters(tY),
            }),
          );
        }
      }),
      [state, translation, x, isSelected],
    );

    return (
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          style={[
            styles.bed,
            {
              left: metersToX(x),
              top: metersToY(y),
              width: metersToX(width),
              height: metersToY(height),
              transform: [{ translateX }, { translateY }],
              zIndex,
            },
            isSelected && styles.bedSelected,
          ]}
        />
      </PanGestureHandler>
    );
  },
);

const styles = StyleSheet.create({
  bed: {
    width: 100,
    height: 100,
    backgroundColor: 'gold',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'gray',
  },
  bedSelected: {
    borderColor: 'black',
    backgroundColor: 'orange',
  },
});
