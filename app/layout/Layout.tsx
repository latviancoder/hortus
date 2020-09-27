import React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';

import { layout, useTypedSelector } from '../reducer';
import { Bed } from '../bed/Bed';
import { Canvas } from '../canvas/Canvas';
import { Menu } from '../menu/Menu';
import { useDispatch } from 'react-redux';

export const Layout = () => {
  const plot = useTypedSelector(({ plot }) => plot);
  const beds = useTypedSelector(({ beds }) => beds);
  const canvas = useTypedSelector(({ canvas }) => canvas);

  const {
    actions: { setCanvasSize, setOffset },
  } = layout;
  const dispatch = useDispatch();

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    let canvasWidth;
    let canvasHeight;

    if (width / height >= plot.width / plot.height) {
      canvasWidth = height * (plot.width / plot.height);
      canvasHeight = height;
    } else {
      canvasWidth = width;
      canvasHeight = width * (plot.height / plot.width);
    }

    dispatch(setOffset(Math.max(plot.width, plot.height) / 20));
    dispatch(setCanvasSize({ width: canvasWidth, height: canvasHeight }));
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignContent: 'stretch',
      }}
    >
      <Menu />
      <View style={{ padding: 20, flex: 5 }}>
        <View style={styles.container} onLayout={onLayout}>
          {canvas?.width && canvas?.height && (
            <Canvas>
              {beds.map((bed) => (
                <Bed key={bed.id} {...bed} />
              ))}
            </Canvas>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
