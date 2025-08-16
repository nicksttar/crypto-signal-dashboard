// src/components/SignalAnalysis.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import useStore from '../store/useStore';
import { getAiSignalAnalysis } from '../services/geminiApi';
import { getCoinNews } from '../services/newsApi';

const TechnicalSummary = ({ summary }) => {
  if (!summary || summary.length === 0) return null;
  const getSentimentVariant = (sentiment) => {
    if (sentiment === 'Positive') return 'success';
    if (sentiment === 'Negative') return 'danger';
    return 'secondary';
  };
  return (
    <>
      <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}/>
      <h6>Техническая сводка:</h6>
      <ul className="list-unstyled small">
        {summary.map((item, index) => (
          <li key={index} className="d-flex justify-content-between align-items-center mb-1">
            <span>{item.indicator}: <strong>{item.value}</strong></span>
            <span className={`badge bg-${getSentimentVariant(item.sentiment)}`}>{item.sentiment}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

const AnalysisResult = ({ analysis, news }) => {
  if (!analysis) return null;
  const getSignalVariant = (signal) => {
    if (signal === 'LONG' || signal === 'Positive') return 'success';
    if (signal === 'SHORT' || signal === 'Negative') return 'danger';
    return 'secondary';
  };
  return (
    <div>
      <h5>Сигнал: <span className={`text-${getSignalVariant(analysis.signal)}`}>{analysis.signal}</span></h5>
      <p className="mb-1"><strong>Уверенность:</strong> {analysis.confidence}</p>
      <p><strong>Обоснование:</strong> {analysis.reason}</p>
      <TechnicalSummary summary={analysis.technical_summary} />
      <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}/>
      <h6>Торговый план:</h6>
      <ul className="list-unstyled">
        <li><strong>Точка входа:</strong> {analysis.entry_point}</li>
        <li><strong>Stop Loss:</strong> {analysis.stop_loss}</li>
        <li><strong>Take Profit:</strong> {analysis.take_profit}</li>
      </ul>
      {analysis.news_sentiment && (
        <>
         <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}/>
         <h6>Анализ новостного фона:</h6>
         <p className="mb-1">
            <strong>Тональность: </strong> 
            <span className={`text-${getSignalVariant(analysis.news_sentiment.sentiment)}`}>
                {analysis.news_sentiment.sentiment}
            </span>
         </p>
         <p><small>{analysis.news_sentiment.summary}</small></p>
        </>
      )}
      {news && news.length > 0 && (
        <>
          <h6>Учтенные новости:</h6>
          <ul className="list-unstyled">
            {news.map((article, index) => (
              <li key={index} className="mb-1 small">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

function SignalAnalysis() {
  const { selectedPair, priceData, maData, levels } = useStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [news, setNews] = useState(null);
  const [error, setError] = useState('');
  
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const isDataReadyForRender = 
    priceData && priceData.length > 0 &&
    maData && maData.length > 0 &&
    levels && levels.length > 0;

  const handleAnalysisClick = async () => {
    const currentState = useStore.getState();
    const isDataTrulyReady = 
        currentState.priceData && currentState.priceData.length > 0 &&
        currentState.maData && currentState.maData.length > 0 &&
        currentState.levels && currentState.levels.length > 0;

    if (!isDataTrulyReady) {
        setError("Технические данные еще не рассчитаны или неполны. Пожалуйста, подождите или выберите другую пару.");
        return;
    }
    setLoading(true);
    setError('');
    setAnalysis(null);
    setNews(null);

    const fetchedNews = await getCoinNews(currentState.selectedPair);
    if (fetchedNews.error) {
      setError(fetchedNews.error);
      setLoading(false);
      setCooldown(10);
      return;
    }
    setNews(fetchedNews);

    const result = await getAiSignalAnalysis(
      currentState.selectedPair, 
      currentState.priceData, 
      currentState.maData, 
      currentState.levels, 
      fetchedNews
    );
      
    if (result.error) {
      setError(result.error);
      if (result.isRateLimitError) {
        setCooldown(60);
      }
    } else {
      setAnalysis(result);
      setCooldown(30);
    }
    setLoading(false);
  };

  return (
    <Card>
      <Card.Header>AI Анализ Сигнала</Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="light" />
            <p className="mt-2">Загружаю новости и анализирую...</p>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}
            {analysis ? 
              <AnalysisResult 
                analysis={analysis} 
                news={news}
              /> : 
              <p>Нажмите кнопку, чтобы получить анализ от AI.</p>
            }
          </>
        )}
      </Card.Body>
      <Card.Footer className="animated-button-container">
        {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Оборачиваем кнопку --- */}
        <div className="gradient-button-wrapper">
            <Button 
            onClick={handleAnalysisClick} 
            disabled={loading || !isDataReadyForRender || cooldown > 0}
            >
            {cooldown > 0 ? `Подождите ${cooldown}с` : (loading ? 'Анализ...' : 'Получить AI анализ')}
            </Button>
        </div>
      </Card.Footer>
    </Card>
  );
}

export default SignalAnalysis;
