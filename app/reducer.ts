import { TypedUseSelectorHook, useSelector } from 'react-redux';
import shortid, { generate } from 'shortid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BedType, Mode } from './types';

export type LayoutState = {
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
  current?: {
    width: number;
    height: number;
  };
};

export const useTypedSelector: TypedUseSelectorHook<LayoutState> = useSelector;

const initialState: LayoutState = {
  offset: 0,
  plot: {
    width: 6,
    height: 3,
  },
  beds: [
    {
      x: 0.5,
      y: 0.3,
      width: 1,
      height: 1,
      id: '1',
      zIndex: 1,
      isSelected: false,
    },
    {
      x: 3,
      y: 1,
      width: 2,
      height: 1,
      id: '2',
      zIndex: 2,
      isSelected: false,
    },
    // ...[...new Array(50)].map((_, i) => ({
    //   x: 4,
    //   y: 4,
    //   width: 1,
    //   height: 1,
    //   id: generate(),
    //   zIndex: i + 3,
    //   isSelected: false,
    // })),
  ],
  mode: Mode.INITIAL,
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

    createBed(
      state,
      {
        payload,
      }: PayloadAction<{ x: number; y: number; width: number; height: number }>,
    ) {
      state.mode = Mode.INITIAL;

      const largestZIndex = state.beds.sort((a, b) => b.zIndex - a.zIndex)[0]
        .zIndex;

      const newBed: BedType = {
        ...payload,
        id: shortid(),
        zIndex: largestZIndex + 1,
        isSelected: true,
      };

      state.beds.push(newBed);
    },

    updateBed(state, { payload }: PayloadAction<Partial<BedType>>) {
      const bedIndex = state.beds.findIndex((bed) => bed.id === payload.id);

      state.beds[bedIndex] = {
        ...state.beds[bedIndex],
        ...payload,
      };
    },

    selectBed(state, { payload }: PayloadAction<string>) {
      state.beds = state.beds.map((bed) => ({
        ...bed,
        isSelected: bed.id === payload,
      }));

      const selectedBed = state.beds.find((bed) => bed.id === payload)!;

      state.current = {
        width: selectedBed.width,
        height: selectedBed.height,
      };

      state.mode = Mode.INITIAL;
    },

    deselectAllBeds(state) {
      state.beds = state.beds.map((bed) => ({
        ...bed,
        isSelected: false,
      }));

      state.current = undefined;
    },

    setMode(state, { payload }: PayloadAction<Mode>) {
      state.mode = payload;
    },

    setCurrent(
      state,
      { payload }: PayloadAction<{ width: number; height: number } | undefined>,
    ) {
      state.current = payload;
    },
  },
});
