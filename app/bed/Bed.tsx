import React, { memo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  add,
  and,
  call,
  cond,
  divide,
  eq,
  or,
  set,
  sub,
  useCode,
  Value,
} from 'react-native-reanimated';
import {
  usePanGestureHandler,
  useValue,
  useDebug,
  // @ts-ignore
} from 'react-native-redash/lib/module/v1';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';

import { BedType, Handlers, Mode } from '../types';
import { useHelpers } from '../helpers';
import { layout, useTypedSelector } from '../reducer';
import { Handler } from '../handler/Handler';

const usePrevState = (
  state: Animated.Value<import('react-native-gesture-handler').State>,
) => {
  const prevState = useValue(0);

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

export const Bed = memo((bed: BedType) => {
  const { id, isSelected, zIndex } = bed;

  const offset = useTypedSelector(({ offset }) => offset);

  const {
    actions: { updateBed },
  } = layout;
  const dispatch = useDispatch();

  const { metersToY, metersToX, xToMeters, yToMeters } = useHelpers();

  const isSelectedValue = new Value(isSelected ? 1 : 0);
  const widthValue = new Value(metersToX(bed.width));
  const heightValue = new Value(metersToY(bed.height));
  const leftValue = new Value(metersToX(bed.x));
  const topValue = new Value(metersToY(bed.y));

  const offsetValue = useValue(metersToX(offset));

  const { gestureHandler, translation, state } = usePanGestureHandler();

  const handlers: { [key in Handlers]: any } = {
    [Handlers.topLeft]: usePanGestureHandler(),
    [Handlers.bottomLeft]: usePanGestureHandler(),
    [Handlers.topRight]: usePanGestureHandler(),
    [Handlers.bottomRight]: usePanGestureHandler(),
  };

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

  const activeHandler = cond(
    eq(handlers[Handlers.topLeft].state, State.ACTIVE),
    Handlers.topLeft,
    cond(
      eq(handlers[Handlers.bottomLeft].state, State.ACTIVE),
      Handlers.bottomLeft,
      cond(
        eq(handlers[Handlers.topRight].state, State.ACTIVE),
        Handlers.topRight,
        cond(
          eq(handlers[Handlers.bottomRight].state, State.ACTIVE),
          Handlers.bottomRight,
        ),
      ),
    ),
  );

  const handlerTranslateX = cond(
    eq(activeHandler, Handlers.topLeft),
    handlers[Handlers.topLeft].translation.x,
    cond(
      eq(activeHandler, Handlers.bottomLeft),
      handlers[Handlers.bottomLeft].translation.x,
      cond(
        eq(activeHandler, Handlers.topRight),
        handlers[Handlers.topRight].translation.x,
        cond(
          eq(activeHandler, Handlers.bottomRight),
          handlers[Handlers.bottomRight].translation.x,
          0,
        ),
      ),
    ),
  );

  const handlerTranslateY = cond(
    eq(activeHandler, Handlers.topLeft),
    handlers[Handlers.topLeft].translation.y,
    cond(
      eq(activeHandler, Handlers.bottomLeft),
      handlers[Handlers.bottomLeft].translation.y,
      cond(
        eq(activeHandler, Handlers.topRight),
        handlers[Handlers.topRight].translation.y,
        cond(
          eq(activeHandler, Handlers.bottomRight),
          handlers[Handlers.bottomRight].translation.y,
          0,
        ),
      ),
    ),
  );

  const finalLeft = cond(
    or(
      eq(activeHandler, Handlers.topLeft),
      eq(activeHandler, Handlers.bottomLeft),
    ),
    add(handlerTranslateX, leftValue),
    leftValue,
  );

  const finalTop = cond(
    or(
      eq(activeHandler, Handlers.topLeft),
      eq(activeHandler, Handlers.topRight),
    ),
    add(handlerTranslateY, topValue),
    topValue,
  );

  const finalWidth = cond(
    or(
      eq(activeHandler, Handlers.topLeft),
      eq(activeHandler, Handlers.bottomLeft),
    ),
    sub(widthValue, handlerTranslateX),
    cond(
      or(
        eq(activeHandler, Handlers.topRight),
        eq(activeHandler, Handlers.bottomRight),
      ),
      add(widthValue, handlerTranslateX),
      widthValue,
    ),
  );

  const finalHeight = cond(
    or(
      eq(activeHandler, Handlers.topLeft),
      eq(activeHandler, Handlers.topRight),
    ),
    sub(heightValue, handlerTranslateY),
    cond(
      or(
        eq(activeHandler, Handlers.bottomLeft),
        eq(activeHandler, Handlers.bottomRight),
      ),
      add(heightValue, handlerTranslateY),
      heightValue,
    ),
  );

  useOnPanEnd(
    state,
    call([translation.x, translation.y], ([tX, tY]) => {
      if (isSelected) {
        dispatch(
          updateBed({
            id,
            x: bed.x + xToMeters(tX),
            y: bed.y + yToMeters(tY),
          }),
        );
      }
    }),
    [state, translation, bed, isSelected],
  );

  return (
    <Animated.View
      style={[
        styles.bedCotainer,
        {
          left: sub(finalLeft, divide(offsetValue, 2)),
          top: sub(finalTop, divide(offsetValue, 2)),
          width: add(finalWidth, offsetValue),
          height: add(finalHeight, offsetValue),
          transform: [{ translateX }, { translateY }],
          zIndex: isSelected ? 9999 : 0,
        },
      ]}
    >
      {isSelected && (
        <>
          {Object.values(Handlers)
            .filter((h): h is Handlers => typeof h === 'number')
            .map(
              (handlerType: Handlers) =>
                handlers[handlerType] && (
                  <Handler
                    bed={bed}
                    key={handlerType}
                    handler={handlers[handlerType]}
                    type={handlerType}
                  />
                ),
            )}
        </>
      )}
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          style={[
            styles.bed,
            { width: finalWidth, height: finalHeight, zIndex },
            isSelected && styles.bedSelected,
          ]}
        >
          <Text>{bed.id}</Text>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  bedCotainer: {
    position: 'absolute',
    backgroundColor: 'rgba(52, 52, 52, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bed: {
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
