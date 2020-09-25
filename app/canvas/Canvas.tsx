import React, { FC, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  usePanGestureHandler,
  useTapGestureHandler,
  useValue,
  useDiff,
  // @ts-ignore
} from 'react-native-redash/lib/module/v1';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
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
} from 'react-native-reanimated';

import { layout, useTypedSelector } from '../reducer';
import { useDispatch } from 'react-redux';
import { isPointInside, useHelpers } from '../helpers';
import { BedType } from '../types';

export const usePrevState = (
  state: Animated.Value<import('react-native-gesture-handler').State>,
) => {
  const prevState = useValue(state);

  useCode(() => set(prevState, state), [state]);

  return prevState;
};

const useOnTap = (
  state: Animated.Value<import('react-native-gesture-handler').State>,
  cb: Animated.Node<any>,
  dependencies: any[],
) => {
  useCode(
    () => cond(and(eq(state, State.END), eq(prevState, State.BEGAN)), cb),
    dependencies,
  );

  const prevState = usePrevState(state);
};

export const Canvas: FC = (props) => {
  const dispatch = useDispatch();
  const {
    actions: { setMode, updateBed, selectBed, deselectAllBeds },
  } = layout;

  const canvas = useTypedSelector(({ canvas }) => canvas);
  const beds = useTypedSelector(({ beds }) => beds);

  const { metersToY, metersToX } = useHelpers();

  const {
    gestureHandler: tapGestureHandler,
    state: tapState,
    position,
  } = useTapGestureHandler();

  const prevState = useValue(tapState);

  useCode(() => set(tapState, State.UNDETERMINED), [beds]);

  useCode(
    () =>
      cond(
        eq(tapState, State.END),
        call([position.x, position.y], ([x, y]) => {
          const clickedBeds = beds
            .reduce<BedType[]>((acc, bed) => {
              if (
                isPointInside(
                  { x, y },
                  metersToX(bed.x),
                  metersToX(bed.x + bed.width),
                  metersToY(bed.y),
                  metersToY(bed.y + bed.height),
                )
              ) {
                return [...acc, bed];
              }

              return acc;
            }, [])
            .sort((a, b) => b.zIndex - a.zIndex);

          if (!!clickedBeds.length) {
            dispatch(selectBed(clickedBeds[0].id));
          } else {
            dispatch(deselectAllBeds());
          }
        }),
      ),
    [tapState, position, beds],
  );

  useCode(() => set(prevState, tapState), [tapState]);

  return (
    <TapGestureHandler {...tapGestureHandler}>
      <View {...props} style={[styles.canvas, canvas]} />
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: 'white',
  },
});
