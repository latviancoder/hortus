import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  add,
  and,
  call,
  cond,
  divide,
  eq,
  or,
  sub,
  useCode,
  Value,
} from 'react-native-reanimated';
import {
  usePanGestureHandler,
  useValue,
} from 'react-native-redash/lib/module/v1';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { BedType, Handlers } from '../types';
import { useHelpers, useOnPanEnd } from '../helpers';
import { layout, useTypedSelector } from '../reducer';
import { Handler } from '../handler/Handler';
import { throttle } from 'throttle-debounce';
import { BedContent, BedContentConnected } from './BedContent';

export const Bed = memo((bed: BedType) => {
  const { id, isSelected, zIndex } = bed;

  const { metersToY, metersToX, xToMeters, yToMeters } = useHelpers();

  const offset = useTypedSelector(({ offset }) => offset);

  const {
    actions: { updateBed, setCurrent },
  } = layout;
  const dispatch = useDispatch();

  const setCurrentThrottled = throttle(100, (num) => dispatch(setCurrent(num)));

  const isSelectedValue = new Value(isSelected ? 1 : 0);
  const widthValue = new Value(metersToX(bed.width));
  const heightValue = new Value(metersToY(bed.height));
  const leftValue = new Value(metersToX(bed.x));
  const topValue = new Value(metersToY(bed.y));

  const offsetValue = useValue(metersToX(offset));

  const {
    gestureHandler,
    translation,
    state: panState,
  } = usePanGestureHandler();

  const handlers: { [key in Handlers]: any } = {
    [Handlers.topLeft]: usePanGestureHandler(),
    [Handlers.bottomLeft]: usePanGestureHandler(),
    [Handlers.topRight]: usePanGestureHandler(),
    [Handlers.bottomRight]: usePanGestureHandler(),
  };

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

  const translateX = cond(
    and(eq(isSelectedValue, 1), eq(panState, State.ACTIVE)),
    translation.x,
    0,
  );

  const translateY = cond(
    and(eq(isSelectedValue, 1), eq(panState, State.ACTIVE)),
    translation.y,
    0,
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

  // While resizing update bed height and width through redux
  // to avoid local state messing with dragging performance.
  useCode(
    () =>
      call(
        [finalWidth, finalHeight, handlerTranslateX],
        ([width, height, hTX]) => {
          if (isSelected && hTX !== 0) {
            setCurrentThrottled({
              width: xToMeters(width),
              height: yToMeters(height),
            });
          }
        },
      ),
    [finalHeight, finalWidth, isSelected, handlerTranslateX],
  );

  useOnPanEnd(
    panState,
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
    [panState, translation, bed, isSelected],
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
            .map((handlerType: Handlers) => (
              <Handler
                key={handlerType}
                handler={handlers[handlerType]}
                type={handlerType}
                bed={bed}
              />
            ))}
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
          {isSelected ? (
            <BedContentConnected />
          ) : (
            <BedContent width={bed.width} height={bed.height} />
          )}
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
    position: 'absolute',
    overflow: 'hidden',
  },
  bedSelected: {
    borderColor: 'black',
    backgroundColor: 'orange',
  },
});
