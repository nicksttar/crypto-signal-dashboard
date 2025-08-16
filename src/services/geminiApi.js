// src/services/geminiApi.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export const getAiSignalAnalysis = async (pair, priceData, rsiData, levels) => {
  if (!priceData || priceData.length === 0 || !rsiData || !levels) {
    return { error: "Недостаточно данных для анализа." };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const lastPrice = priceData[priceData.length - 1].close;
  const lastRsi = rsiData[rsiData.length - 1]?.value.toFixed(2);
  const supportLevels = levels.filter(l => l.type === 'support').map(l => l.price).join(', ');
  const resistanceLevels = levels.filter(l => l.type === 'resistance').map(l => l.price).join(', ');
  const pivotLevel = levels.find(l => l.type === 'pivot')?.price;

  const prompt = `
    Ты — профессиональный и детальный крипто-аналитик. Твоя задача — проанализировать рыночные данные для пары ${pair} и предоставить исчерпывающий торговый сигнал в формате JSON.

    Входные данные:
    - Текущая цена: ${lastPrice}
    - Последнее значение RSI(14): ${lastRsi}
    - Уровни поддержки (S1, S2): ${supportLevels}
    - Уровни сопротивления (R1, R2): ${resistanceLevels}
    - Основной уровень Pivot: ${pivotLevel}

    Проанализируй эти данные, учитывая взаимодействие цены с уровнями Pivot и значение RSI.

    Твоя задача — вернуть только JSON-объект следующей структуры, без лишнего текста и форматирования markdown:
    {
      "signal": "LONG",
      "confidence": "High",
      "reason": "Дай детальное обоснование на 2-3 предложения. Упомяни, как цена взаимодействует с уровнями поддержки/сопротивления и что показывает RSI (например, 'цена отскочила от поддержки S1, в то время как RSI выходит из зоны перепроданности').",
      "entry_point": "Предложи конкретную, идеальную цену для входа в сделку.",
      "stop_loss": "Предложи конкретный уровень для стоп-лосса, обычно ниже ключевого уровня поддержки для LONG или выше сопротивления для SHORT.",
      "take_profit": "Предложи конкретный уровень для тейк-профита, обычно у следующего значимого уровня сопротивления для LONG или поддержки для SHORT."
    }

    Возможные значения для "signal": "LONG" (покупка), "SHORT" (продажа), "FLAT" (нейтрально).
    Возможные значения для "confidence": "High" (высокая), "Medium" (средняя), "Low" (низкая).
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
    return { error: "Не удалось обработать ответ от AI. Возможно, неверный формат." };
  }
};
