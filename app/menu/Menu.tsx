import React from 'react';
import { useDispatch } from 'react-redux';
import { TouchableWithoutFeedback, View, Platform } from 'react-native';

import { CabbageIcon } from '../icons/CabbageIcons';
import { layout, useTypedSelector } from '../reducer';
import { Mode } from '../types';
import { Colors } from '../colors';

export const Menu = () => {
  const mode = useTypedSelector(({ mode }) => mode);
  const dispatch = useDispatch();
  const { actions } = layout;

  return (
    <View
      style={{
        width: 50,
        borderColor: Colors.light,
        borderRightWidth: 1,
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          dispatch(actions.setMode(Mode.CREATING));
          dispatch(actions.deselectAllBeds());
        }}
      >
        <View
          style={{
            padding: 10,
            backgroundColor:
              mode === Mode.CREATING ? Colors.light : 'transparent',
          }}
        >
          <View style={{ width: 30, height: 30 }}>
            <CabbageIcon color={mode === Mode.CREATING ? '#000' : '#333'} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
