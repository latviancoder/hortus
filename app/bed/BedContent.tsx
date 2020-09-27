import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTypedSelector } from '../reducer';

type Props = {
  width: number;
  height: number;
};

export const BedContent = ({ width, height }: Props) => {
  return (
    <View style={styles.content}>
      <Text>
        {Math.round(width * 100) / 100} {Math.round(height * 100) / 100}
      </Text>
    </View>
  );
};

export const BedContentConnected = () => {
  const current = useTypedSelector(({ current }) => current);

  if (!current || current.width === 0 || current.height === 0) {
    return null;
  }

  return <BedContent {...current} />;
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: 'gold',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'gray',
  },
});
