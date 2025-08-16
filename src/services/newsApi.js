// src/services/newsApi.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2/everything';

// Расширенный словарь для более точного поиска
const coinSearchTerms = {
    'BTCUSDT': 'Bitcoin OR BTC',
    'ETHUSDT': 'Ethereum OR ETH',
    'SOLUSDT': 'Solana OR SOL',
    'BNBUSDT': '"Binance Coin" OR BNB', // Кавычки для поиска точной фразы
    'XRPUSDT': 'XRP OR Ripple'
};

export const getCoinNews = async (pair) => {
    // Формируем более умный поисковый запрос
    const coinQuery = coinSearchTerms[pair] || pair;
    const query = `(${coinQuery}) AND (crypto OR cryptocurrency OR blockchain)`;

    if (!API_KEY) {
        console.error("Ключ NewsAPI не найден в .env файле.");
        return { error: "Ключ NewsAPI не настроен." };
    }
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                q: query,
                apiKey: API_KEY,
                language: 'en', // Искать на английском для лучшего качества
                sortBy: 'publishedAt',
                pageSize: 5,
                searchIn: 'title,description' // Искать в заголовках и описаниях
            }
        });
        
        if (response.data.articles.length === 0) {
            console.warn(`Не найдено новостей по запросу: ${query}`);
        }

        return response.data.articles;
    } catch (error) {
        console.error("Ошибка при загрузке новостей:", error.response?.data?.message || error.message);
        return { error: "Не удалось загрузить новости. Проверьте API ключ и лимиты." };
    }
};
