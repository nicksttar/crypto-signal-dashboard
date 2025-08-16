// src/services/binanceApi.js
import axios from 'axios';

// Базовый URL для API Binance
const API_URL = 'https://api.binance.com/api/v3';

/**
 * Функция для получения исторических данных (свечей)
 * @param {string} symbol - Торговая пара, например 'BTCUSDT'
 * @param {string} interval - Таймфрейм, например '4h'
 * @param {number} limit - Количество свечей для загрузки
 * @returns {Promise<Array>} - Массив обработанных данных для графика
 */
export const getKlines = async (symbol = 'BTCUSDT', interval = '4h', limit = 500) => {
  try {
    const response = await axios.get(`${API_URL}/klines`, {
      params: {
        symbol,
        interval,
        limit,
      },
    });

    // Binance возвращает массив массивов. Преобразуем его в массив объектов,
    // который понятен нашей библиотеке для графиков.
    const processedData = response.data.map((d) => ({
      time: d[0] / 1000, // Время открытия (переводим из мс в секунды)
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    return processedData;
  } catch (error) {
    console.error("Ошибка при загрузке данных с Binance:", error);
    return []; // В случае ошибки возвращаем пустой массив
  }
};