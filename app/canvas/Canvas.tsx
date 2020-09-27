import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  useDebug,
  usePanGestureHandler,
  useTapGestureHandler,
  useValue,
} from 'react-native-redash/lib/module/v1';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  abs,
  add,
  and,
  block,
  call,
  cond,
  eq,
  lessThan,
  or,
  set,
  useCode,
  Value,
} from 'react-native-reanimated';
import { layout, useTypedSelector } from '../reducer';
import { useDispatch } from 'react-redux';
import {
  isPointInside,
  useHelpers,
  useOnPanEnd,
  usePrevState,
} from '../helpers';
import { BedType, Mode } from '../types';
import { throttle } from 'throttle-debounce';
import { BedContentConnected } from '../bed/BedContent';
import {Colors} from "../colors";

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

export const Canvas: FC = (props) => {
  const dispatch = useDispatch();
  const {
    actions: { selectBed, deselectAllBeds, setCurrent, createBed },
  } = layout;

  const setCurrentThrottled = throttle(100, (num) => dispatch(setCurrent(num)));

  const canvas = useTypedSelector(({ canvas }) => canvas);
  const beds = useTypedSelector(({ beds }) => beds);
  const mode = useTypedSelector(({ mode }) => mode);

  const modeValue = new Value(mode);
  const initialPanPositionX = useValue(0);
  const initialPanPositionY = useValue(0);

  const { metersToY, metersToX, yToMeters, xToMeters } = useHelpers();

  const {
    gestureHandler: panGestureHandler,
    state: panState,
    position: panPosition,
    translation,
  } = usePanGestureHandler();

  const {
    gestureHandler: tapGestureHandler,
    state: tapState,
    position,
  } = useTapGestureHandler();

  useCode(() => set(tapState, State.UNDETERMINED), [beds]);

  const onTap = ([x, y]: readonly number[]) => {
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
  };

  const onCreateActive = ([width, height]: readonly number[]) => {
    if (mode == Mode.CREATING) {
      setCurrentThrottled({
        width: xToMeters(width),
        height: yToMeters(height),
      });
    }
  };

  const onCreateEnd = ([
    translationX,
    translationY,
    initialX,
    initialY,
  ]: readonly number[]) => {
    if (mode == Mode.CREATING && translationX !== 0 && translationY !== 0) {
      const left = translationX < 0 ? initialX + translationX : initialX;
      const top = translationY < 0 ? initialY + translationY : initialY;
      const width = translationX < 0 ? Math.abs(translationX) : translationX;
      const height = translationY < 0 ? Math.abs(translationY) : translationY;

      dispatch(
        createBed({
          x: xToMeters(left),
          y: yToMeters(top),
          width: xToMeters(width),
          height: yToMeters(height),
        }),
      );
    }
  };

  useCode(
    () => cond(eq(tapState, State.END), call([position.x, position.y], onTap)),
    [tapState, position, beds],
  );

  useOnPanStart(
    panState,
    block([
      set(initialPanPositionX, panPosition.x),
      set(initialPanPositionY, panPosition.y),
    ]),
    [panState, panPosition],
  );

  const finalWidth = cond(
    and(eq(panState, State.ACTIVE), eq(modeValue, Mode.CREATING)),
    cond(lessThan(translation.x, 0), abs(translation.x), translation.x),
    0,
  );

  const finalHeight = cond(
    and(eq(panState, State.ACTIVE), eq(modeValue, Mode.CREATING)),
    cond(lessThan(translation.y, 0), abs(translation.y), translation.y),
    0,
  );

  const finalLeft = cond(
    and(eq(panState, State.ACTIVE), eq(modeValue, Mode.CREATING)),
    cond(
      lessThan(translation.x, 0),
      add(initialPanPositionX, translation.x),
      initialPanPositionX,
    ),
    0,
  );

  const finalTop = cond(
    and(eq(panState, State.ACTIVE), eq(modeValue, Mode.CREATING)),
    cond(
      lessThan(translation.y, 0),
      add(initialPanPositionY, translation.y),
      initialPanPositionY,
    ),
    0,
  );

  useCode(
    () =>
      cond(
        eq(panState, State.ACTIVE),
        call([finalWidth, finalHeight], onCreateActive),
      ),
    [finalHeight, finalWidth, mode, panState],
  );

  useOnPanEnd(
    panState,
    call(
      [translation.x, translation.y, initialPanPositionX, initialPanPositionY],
      onCreateEnd,
    ),
    [translation, panState, mode, initialPanPositionX, initialPanPositionY],
  );

  return (
    <PanGestureHandler {...panGestureHandler}>
      <View>
        <TapGestureHandler {...tapGestureHandler}>
          <View style={[styles.canvas, canvas]}>
            {props.children}
            {mode === Mode.CREATING && (
              <Animated.View
                style={{
                  backgroundColor: 'lightgray',
                  left: finalLeft,
                  top: finalTop,
                  width: finalWidth,
                  height: finalHeight,
                }}
              >
                <BedContentConnected />
              </Animated.View>
            )}
          </View>
        </TapGestureHandler>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.light,
  },
});
