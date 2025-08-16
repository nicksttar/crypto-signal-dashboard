// src/hooks/useChart.js
import { useEffect } from 'react';
import { createChart, CandlestickSeries, LineStyle, LineSeries } from 'lightweight-charts';

// Обновлен для приема bollingerBandsData в качестве отдельного параметра
function useChart(chartContainerRef, priceData, maData, levels, bollingerBandsData, showMa, showLevels, showBollinger) {
  useEffect(() => {
    if (!chartContainerRef.current || !priceData || priceData.length === 0) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { 
        background: { color: 'transparent' }, 
        textColor: '#d1d4dc' 
      },
      grid: { 
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, 
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' } 
      },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: 'rgba(255, 255, 255, 0.2)' },
      priceScale: {
        autoscale: true,
        borderColor: 'rgba(255, 255, 255, 0.2)'
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
      borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
    });
    candleSeries.setData(priceData);

    if (showMa && maData && maData.length > 0) {
      const maSeries = chart.addSeries(LineSeries, {
        color: '#3d5af1',
        lineWidth: 2,
      });
      maSeries.setData(maData);
    }
    
    if (showLevels && levels && levels.length > 0) {
        levels.forEach(level => {
            candleSeries.createPriceLine({
                price: level.price,
                color: level.type === 'support' ? '#26a69a' : '#ef5350',
                lineWidth: 2, lineStyle: LineStyle.Dashed, axisLabelVisible: true,
                title: level.type.toUpperCase(),
            });
        });
    }

    // Исправлено: используем bollingerBandsData напрямую
    if (showBollinger && bollingerBandsData && bollingerBandsData.length > 0) {
        const upperBandData = bollingerBandsData.map(d => ({ time: d.time, value: d.upper }));
        const middleBandData = bollingerBandsData.map(d => ({ time: d.time, value: d.middle }));
        const lowerBandData = bollingerBandsData.map(d => ({ time: d.time, value: d.lower }));

        const upperSeries = chart.addSeries(LineSeries, {
            color: '#FF6347',
            lineWidth: 1,
            lineStyle: LineStyle.Solid,
        });
        upperSeries.setData(upperBandData);

        const middleSeries = chart.addSeries(LineSeries, {
            color: '#FFD700',
            lineWidth: 1,
            lineStyle: LineStyle.Solid,
        });
        middleSeries.setData(middleBandData);

        const lowerSeries = chart.addSeries(LineSeries, {
            color: '#6A5ACD',
            lineWidth: 1,
            lineStyle: LineStyle.Solid,
        });
        lowerSeries.setData(lowerBandData);
    }
    
    chart.timeScale().fitContent(); 

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.resize(width, height);
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [priceData, maData, levels, bollingerBandsData, chartContainerRef, showMa, showLevels, showBollinger]);
}

export default useChart;
