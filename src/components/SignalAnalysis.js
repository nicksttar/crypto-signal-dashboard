// src/components/SignalAnalysis.js
import React, { useState } from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import useStore from '../store/useStore';
import { getAiSignalAnalysis } from '../services/geminiApi';

// Компонент для отображения результата
const AnalysisResult = ({ analysis }) => {
  if (!analysis) return null;

  const getSignalVariant = () => {
    if (analysis.signal === 'LONG') return 'success';
    if (analysis.signal === 'SHORT') return 'danger';
    return 'secondary';
  };

  return (
    <div>
      <h5>Сигнал: <span className={`text-${getSignalVariant()}`}>{analysis.signal}</span></h5>
      <p className="mb-1"><strong>Уверенность:</strong> {analysis.confidence}</p>
      <p><strong>Обоснование:</strong> {analysis.reason}</p>
      <hr />
      <h6>Торговый план:</h6>
      <ul className="list-unstyled">
        <li><strong>Точка входа:</strong> {analysis.entry_point}</li>
        <li><strong>Stop Loss:</strong> {analysis.stop_loss}</li>
        <li><strong>Take Profit:</strong> {analysis.take_profit}</li>
      </ul>
    </div>
  );
};

function SignalAnalysis() {
  const { selectedPair, priceData, rsiData, levels } = useStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleAnalysisClick = async () => {
    setLoading(true);
    setError('');
    setAnalysis(null);

    const result = await getAiSignalAnalysis(selectedPair, priceData, rsiData, levels);
    
    if (result.error) {
      setError(result.error);
    } else {
      setAnalysis(result);
    }
    setLoading(false);
  };

  return (
    <Card className="mt-4">
      <Card.Header>AI Анализ Сигнала</Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Gemini анализирует данные...</p>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}
            {analysis ? <AnalysisResult analysis={analysis} /> : <p>Нажмите кнопку, чтобы получить анализ от AI.</p>}
          </>
        )}
      </Card.Body>
      <Card.Footer className="text-end">
        <Button onClick={handleAnalysisClick} disabled={loading || !priceData}>
          {loading ? 'Анализ...' : 'Получить AI анализ'}
        </Button>
      </Card.Footer>
    </Card>
  );
}

export default SignalAnalysis;
