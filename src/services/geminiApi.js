// src/services/geminiApi.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Убираем macdData и bbData из параметров
export const getAiSignalAnalysis = async (pair, priceData, maData, levels, news) => {
  if (!priceData || !maData || !levels || maData.length === 0) {
    return { error: "Недостаточно технических данных для анализа." };
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.2, 
    }
  });

  const lastPrice = priceData[priceData.length - 1].close;
  const lastMa = maData[maData.length - 1]?.value.toFixed(2);
  const supportLevels = levels.filter(l => l.type === 'support').map(l => l.price).join(', ');
  const resistanceLevels = levels.filter(l => l.type === 'resistance').map(l => l.price).join(', ');
  
  const newsHeadlines = news && news.length > 0 
    ? news.map(article => `- ${article.title}`).join('\n')
    : "Нет свежих новостей.";

  const prompt = `
    Ты — профессиональный и детальный крипто-аналитик. Твоя задача — объединить технический и фундаментальный анализ для пары ${pair} и предоставить исчерпывающий торговый сигнал в формате JSON.

    1. Технические данные:
    - Текущая цена: ${lastPrice}
    - SMA(50): ${lastMa}
    - Поддержка: ${supportLevels}
    - Сопротивление: ${resistanceLevels}

    2. Фундаментальные данные (последние новости):
    ${newsHeadlines}

    Твоя задача — вернуть только JSON-объект следующей структуры:
    {
      "signal": "LONG, SHORT или FLAT на основе твоего анализа",
      "confidence": "High, Medium или Low на основе твоего анализа",
      "reason": "Твое детальное обоснование на 2-3 предложения, ОБЪЕДИНЯЯ все факторы.",
      "entry_point": "Твоя предложенная цена для входа в сделку.",
      "stop_loss": "Твой предложенный уровень для стоп-лосса.",
      "take_profit": "Твой предложенный уровень для тейк-профита.",
      "technical_summary": [
        { "indicator": "Цена vs SMA(50)", "value": "Твой вывод о положении цены", "sentiment": "Positive, Negative или Neutral" },
        { "indicator": "Уровни", "value": "Твой вывод о взаимодействии с уровнями", "sentiment": "Positive, Negative или Neutral" }
      ],
      "news_sentiment": {
        "sentiment": "Positive, Negative или Neutral на основе новостей",
        "summary": "Твое краткое описание, почему новостной фон такой."
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    if (text.includes('```json')) {
      text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    }
    
    const jsonResponse = JSON.parse(text);
    return jsonResponse;
  } catch (error) {
    console.error("Ошибка при получении или парсинге анализа от Gemini AI:", error);
    return { error: "Не удалось обработать ответ от AI." };
  }
};
