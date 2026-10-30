import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface PlotlyChartProps {
  id: string;
  data: any[];
  layout: Record<string, any>;
  config?: Record<string, any>;
  style?: React.CSSProperties;
  className?: string;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  id,
  data,
  layout,
  config = { responsive: true, displayModeBar: false },
  style,
  className = 'chart-box',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!containerRef.current) return;

      const mergedLayout = {
        font: { family: 'Plus Jakarta Sans, sans-serif', size: 11, color: '#64748B' },
        paper_bgcolor: '#FFFFFF',
        plot_bgcolor: '#FFFFFF',
        ...layout,
      };

      try {
        await Plotly.react(containerRef.current, data, mergedLayout, config);
      } catch (err) {
        console.warn('Plotly render error:', err);
      }
    };

    if (isMounted) {
      renderChart();
    }

    const handleResize = () => {
      if (containerRef.current) {
        try {
          Plotly.Plots.resize(containerRef.current);
        } catch {
          // silent
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        try {
          Plotly.purge(containerRef.current);
        } catch {
          // silent
        }
      }
    };
  }, [data, layout, config]);

  return <div id={id} ref={containerRef} className={className} style={style} />;
};
