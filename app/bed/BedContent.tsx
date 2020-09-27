import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTypedSelector } from '../reducer';
import { Colors } from '../colors';

type Props = {
  width: number;
  height: number;
  isSelected?: boolean;
};

export const BedContent = ({ width, height, isSelected }: Props) => {
  return (
    <View
      style={[
        styles.content,
        isSelected && {
          backgroundColor: Colors.green,
        },
      ]}
    >
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

  return <BedContent {...current} isSelected={true} />;
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
