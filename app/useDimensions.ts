import { useLayoutEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export enum Orientation {
  Portrait = 'Portrait',
  Landscape = 'Landscape'
}

export type DimensionsType = {
  width: number;
  height: number;
  orientation: Orientation;
};

export const useDimensions = () => {
  const [dimensions, setDimensions] = useState<DimensionsType>();

  const onDimensionsChanged = () => {
    setDimensions({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      orientation:
        Dimensions.get('window').width < Dimensions.get('window').height
          ? Orientation.Portrait
          : Orientation.Landscape
    });
  };

  useLayoutEffect(() => {
    onDimensionsChanged();
    Dimensions.addEventListener('change', onDimensionsChanged);
    return () => Dimensions.removeEventListener('change', onDimensionsChanged);
  }, []);

  return dimensions;
};
