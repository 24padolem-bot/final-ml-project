import React, { useMemo } from 'react';
import { PrognosticPrediction } from '../../types';
import { PlotlyChart } from '../PlotlyChart';

interface RiskTabProps {
  selectedEngine: number;
  prediction: PrognosticPrediction | null;
}

export const RiskTab: React.FC<RiskTabProps> = ({ selectedEngine, prediction }) => {
  const isCritical = prediction?.risk_classification?.predicted_class === 1;
  const confidencePct = prediction?.risk_classification?.confidence_pct ?? 12.0;
  const predRul = prediction?.predicted_rul?.toFixed(1) ?? '112.5';

  const gaugeData = useMemo(() => {
    return [
      {
        type: 'indicator',
        mode: 'gauge+number',
        value: confidencePct,
        domain: { x: [0, 1], y: [0, 1] },
        title: {
          text: 'Diagnostic Confidence Index (%)',
          font: { size: 13, family: 'Poppins, sans-serif' },
        },
        number: { suffix: '%', font: { size: 28, family: 'Poppins, sans-serif' } },
        gauge: {
          axis: { range: [0, 100], tickwidth: 1, tickcolor: '#CBD5E1' },
          bar: {
            color: confidencePct > 50 ? '#DC2626' : '#0284C7',
            thickness: 0.28,
          },
          bgcolor: '#FFFFFF',
          borderwidth: 1,
          bordercolor: '#E2E8F0',
          steps: [
            { range: [0, 40], color: '#D7F5E3' },
            { range: [40, 70], color: '#FEE8D6' },
            { range: [70, 100], color: '#FCDDE5' },
          ],
          threshold: {
            line: { color: '#DC2626', width: 3 },
            thickness: 0.75,
            value: 50,
          },
        },
      },
    ];
  }, [confidencePct]);

  const gaugeLayout = useMemo(() => {
    return {
      height: 280,
      margin: { l: 25, r: 25, t: 30, b: 20 },
      paper_bgcolor: '#FFFFFF',
    };
  }, []);

  return (
    <section id="tab-risk" className="tab-pane active">
      <div className="board-card full-width-board">
        <div className="section-header">
          <h2>Maintenance Risk Classification & Triage</h2>
          <p>
            Binary risk classifier identifying engines within imminent failure
            threshold (RUL ≤ 30 cycles).
          </p>
        </div>

        <div className="risk-split-container">
          <div className="risk-left-panel">
            <div
              id="riskAlertBanner"
              className={`pastel-card ${isCritical ? 'card-rose' : 'card-mint'}`}
              style={{ padding: '28px' }}
            >
              <div
                className="pill-badge pill-white"
                id="riskBadge"
                style={{
                  background: isCritical ? '#E11D48' : '#16A34A',
                  color: '#FFFFFF',
                }}
              >
                {isCritical ? 'CRITICAL ALERT' : 'STATUS: NOMINAL'}
              </div>
              <h3
                id="riskAlertTitle"
                style={{
                  margin: '14px 0 6px 0',
                  fontFamily: "'Poppins', sans-serif",
                  color: isCritical ? '#9F1239' : '#14532D',
                }}
              >
                {isCritical ? 'Hangar Inspection Required' : 'Nominal Operating State'}
              </h3>
              <p
                id="riskAlertDesc"
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: isCritical ? '#BE123C' : '#166534',
                }}
              >
                {isCritical
                  ? `Engine #${selectedEngine} has entered the critical risk window (Predicted RUL: ${predRul} cyc ≤ 30 cyc). Multi-channel telemetry confirms severe High Pressure Compressor (HPC) stage wear.`
                  : `Engine #${selectedEngine} is operating with healthy aerodynamic and thermodynamic safety margins (RUL: ${predRul} cyc). No immediate overhaul scheduled.`}
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <span className="pill-badge pill-white" id="riskProbPill">
                  Confidence: {confidencePct.toFixed(1)}%
                </span>
                <span className="pill-badge pill-white">Threshold: ≤ 30 Cyc</span>
              </div>
            </div>
          </div>

          <div className="risk-right-panel">
            <PlotlyChart
              id="riskGaugeContainer"
              data={gaugeData}
              layout={gaugeLayout}
              style={{ height: '280px' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
