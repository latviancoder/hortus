import React from 'react';
import { Text } from 'react-native';
import { useTypedSelector } from '../reducer';

type Props = {
  width: number;
  height: number;
};

export const BedContent = ({ width, height }: Props) => {
  return (
    <Text>
      {Math.round(width * 100) / 100} {Math.round(height * 100) / 100}
    </Text>
  );
};

export const BedContentConnected = () => {
  const current = useTypedSelector(({ current }) => current);

  return <BedContent {...current} />;
};
