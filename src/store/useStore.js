// src/store/useStore.js
import { create } from 'zustand';

const useStore = create((set) => ({
  selectedPair: 'BTCUSDT',
  priceData: null,
  rsiData: null,
  levels: null,

  setSelectedPair: (pair) => set({ selectedPair: pair }),
  // Новые функции для сохранения данных графика
  setChartData: (data) => set({ 
    priceData: data.priceData,
    rsiData: data.rsiData,
    levels: data.levels 
  }),
}));

export default useStore;