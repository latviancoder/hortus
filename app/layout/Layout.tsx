import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useTypedSelector } from '../reducer';
import { Bed } from '../bed/Bed';
import { Canvas } from '../canvas/Canvas';

type Props = {};

export const Layout = (props: Props) => {
  const beds = useTypedSelector(({ beds }) => beds);

  return (
    <View>
      <Canvas>
        {beds.map((bed) => (
          <Bed key={bed.id} {...bed} />
        ))}
      </Canvas>
    </View>
  );
};
