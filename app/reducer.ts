import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { generate } from 'shortid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BedType, Mode, Point } from './types';

export type LayoutState = {
  points: Point[];
  beds: BedType[];

  plot: {
    width: number;
    height: number;
  };
  canvas?: {
    width: number;
    height: number;
  };
  offset: number;
  mode: Mode;
};

export const useTypedSelector: TypedUseSelectorHook<LayoutState> = useSelector;

const initialState: LayoutState = {
  offset: 0,
  plot: {
    width: 6,
    height: 6,
  },
  beds: [
    {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      id: '1',
      zIndex: 1,
      isSelected: false,
    },
    {
      x: 1,
      y: 1,
      width: 1,
      height: 1,
      id: '2',
      zIndex: 2,
      isSelected: false,
    },
    ...[...new Array(50)].map((_, i) => ({
      x: 4,
      y: 4,
      width: 1,
      height: 1,
      id: generate(),
      zIndex: i + 3,
      isSelected: false,
    })),
  ],
  points: [],
  mode: Mode.NOTHING,
};

export const layout = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setCanvasSize(
      state,
      { payload }: PayloadAction<{ width: number; height: number }>,
    ) {
      state.canvas = payload;
    },

    setOffset(state, { payload }: PayloadAction<number>) {
      state.offset = payload;
    },

    updateBed(state, { payload }: PayloadAction<Partial<BedType>>) {
      const bedIndex = state.beds.findIndex((bed) => bed.id === payload.id);

      state.beds[bedIndex] = {
        ...state.beds[bedIndex],
        ...payload,
      };
    },

    selectBed(state, { payload }: PayloadAction<string>) {
      state.beds = state.beds.map((bed) => {
        const { id } = bed;
        return {
          ...bed,
          isSelected: id === payload,
        };
      });
    },

    deselectAllBeds(state) {
      state.beds = state.beds.map((bed) => ({
        ...bed,
        isSelected: false,
      }));
    },

    setMode(state, { payload }: PayloadAction<Mode>) {
      state.mode = payload;
    },
  },
});
