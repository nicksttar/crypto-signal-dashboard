// src/store/useStore.js
import { create } from 'zustand';

const useStore = create((set) => ({
  selectedPair: 'BTCUSDT',
  priceData: null,
  maData: null,
  levels: null,
  
  setSelectedPair: (pair) => set({ selectedPair: pair }),
  
  setChartData: (data) => set({ 
    priceData: data.priceData,
    maData: data.maData,
    levels: data.levels 
  }),
}));

export default useStore;
