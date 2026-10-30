import React, { useState, useMemo } from 'react';
import { EngineData, PrognosticPrediction } from '../../types';
import { PlotlyChart } from '../PlotlyChart';

interface PrognosticsTabProps {
  units: number[];
  selectedEngine: number;
  onSelectEngine: (unitNr: number) => void;
  engineData: EngineData | null;
  cutoffCycle: number;
  onCutoffChange: (cycle: number) => void;
  prediction: PrognosticPrediction | null;
}

type ProgViewMode = 'rul_trajectory' | 'sensor_drift' | 'subplots';

export const PrognosticsTab: React.FC<PrognosticsTabProps> = ({
  units,
  selectedEngine,
  onSelectEngine,
  engineData,
  cutoffCycle,
  onCutoffChange,
  prediction,
}) => {
  const [viewMode, setViewMode] = useState<ProgViewMode>('rul_trajectory');

  const maxCycle = engineData?.max_cycle ?? 31;
  const effectiveCutoff = Math.min(cutoffCycle, maxCycle);

  // Compute or read prediction values
  const predRul = prediction?.predicted_rul?.toFixed(1) ?? '--';
  const truthRul =
    prediction?.ground_truth_rul !== null && prediction?.ground_truth_rul !== undefined
      ? prediction.ground_truth_rul.toFixed(0)
      : '--';
  const errorText =
    prediction?.prediction_error !== null && prediction?.prediction_error !== undefined
      ? `Error: ${prediction.prediction_error >= 0 ? '+' : ''}${prediction.prediction_error.toFixed(1)} cyc`
      : 'In-service flight';
  const healthMargin = prediction?.health_margin_pct ?? 0;

  // Build series up to cutoff cycle
  const { chartData, chartLayout, chartHeight } = useMemo(() => {
    if (!engineData || !engineData.records) {
      return { chartData: [], chartLayout: {}, chartHeight: 380 };
    }

    const subRecords = engineData.records.filter((r) => r.cycle <= effectiveCutoff);
    const subCycles = subRecords.map((r) => r.cycle);

    if (viewMode === 'rul_trajectory') {
      // Historical RUL degradation curve from cycle 1 to effectiveCutoff
      const predsMap = engineData.predictions || {};
      const predCycles: number[] = [];
      const predValues: number[] = [];
      const trueValues: number[] = [];

      subCycles.forEach((c) => {
        const p = predsMap[String(c)];
        if (p) {
          predCycles.push(c);
          predValues.push(p.predicted_rul);
          if (p.ground_truth_rul !== null && p.ground_truth_rul !== undefined) {
            trueValues.push(p.ground_truth_rul);
          }
        }
      });

      const traces: any[] = [];

      // Ground truth RUL line
      if (trueValues.length > 0) {
        traces.push({
          x: predCycles,
          y: trueValues,
          name: 'Ground Truth RUL (Capped at 125)',
          type: 'scatter',
          mode: 'lines',
          line: { color: '#16A34A', width: 2.2, dash: 'dash' },
        });
      }

      // Predicted RUL line
      traces.push({
        x: predCycles,
        y: predValues,
        name: 'Model Predicted RUL (Random Forest)',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#0284C7', width: 2.8 },
      });

      // Current Observation Point Marker at t
      if (predValues.length > 0) {
        const lastCycle = predCycles[predCycles.length - 1];
        const lastPred = predValues[predValues.length - 1];
        traces.push({
          x: [lastCycle],
          y: [lastPred],
          name: `Cutoff Evaluation (Cycle ${lastCycle})`,
          type: 'scatter',
          mode: 'markers',
          marker: {
            size: 11,
            color: '#DC2626',
            symbol: 'diamond',
            line: { color: '#FFFFFF', width: 2 },
          },
        });
      }

      // Critical Danger Threshold Line (30 cycles)
      traces.push({
        x: [1, Math.max(effectiveCutoff, maxCycle)],
        y: [30, 30],
        name: 'Critical Overhaul Threshold (RUL ≤ 30)',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#DC2626', width: 1.8, dash: 'dot' },
      });

      const layout = {
        title: {
          text: `Causal RUL Degradation Trajectory (Cycles 1 to ${effectiveCutoff}) — Engine #${selectedEngine}`,
          font: { family: 'Poppins', size: 14, color: '#1E293B' },
        },
        xaxis: {
          title: 'Flight Cycle Observed (t)',
          gridcolor: '#F1F5F9',
          range: [1, Math.max(effectiveCutoff, maxCycle)],
        },
        yaxis: {
          title: 'Remaining Useful Life (Cycles)',
          gridcolor: '#F1F5F9',
          range: [0, 135],
        },
        shapes: [
          // Soft red danger zone rectangle under 30 cycles
          {
            type: 'rect',
            xref: 'x',
            yref: 'y',
            x0: 1,
            x1: Math.max(effectiveCutoff, maxCycle),
            y0: 0,
            y1: 30,
            fillcolor: 'rgba(239, 68, 68, 0.08)',
            line: { width: 0 },
            layer: 'below',
          },
        ],
        annotations: [
          {
            x: Math.max(effectiveCutoff, maxCycle) * 0.85,
            y: 16,
            xref: 'x',
            yref: 'y',
            text: 'CRITICAL MAINTENANCE ZONE',
            showarrow: false,
            font: { family: 'Poppins', size: 10, color: '#DC2626' },
          },
        ],
        margin: { l: 55, r: 25, t: 55, b: 65 },
        legend: { orientation: 'h', y: -0.25, x: 0.5, xanchor: 'center' },
      };

      return { chartData: traces, chartLayout: layout, chartHeight: 400 };
    }

    if (viewMode === 'sensor_drift') {
      // Normalized sensor drift (%) up to cutoff cycle
      const first = subRecords[0];
      const s2Init = first.s_2 || 1;
      const s3Init = first.s_3 || 1;
      const s4Init = first.s_4 || 1;
      const s11Init = first.s_11 || 1;

      const traces = [
        {
          x: subCycles,
          y: subRecords.map((r) => ((r.s_2 - s2Init) / s2Init) * 100),
          name: 's_2: LPC Outlet Temp (% Δ)',
          type: 'scatter',
          mode: 'lines',
          line: { color: '#0284C7', width: 2.2 },
        },
        {
          x: subCycles,
          y: subRecords.map((r) => ((r.s_3 - s3Init) / s3Init) * 100),
          name: 's_3: HPC Outlet Temp (% Δ)',
          type: 'scatter',
          mode: 'lines',
          line: { color: '#EA580C', width: 2.2 },
        },
        {
          x: subCycles,
          y: subRecords.map((r) => ((r.s_4 - s4Init) / s4Init) * 100),
          name: 's_4: LPT Outlet Temp (% Δ)',
          type: 'scatter',
          mode: 'lines',
          line: { color: '#16A34A', width: 2.2 },
        },
        {
          x: subCycles,
          y: subRecords.map((r) => ((r.s_11 - s11Init) / s11Init) * 100),
          name: 's_11: HPC Static Pres (% Δ)',
          type: 'scatter',
          mode: 'lines',
          line: { color: '#9333EA', width: 2.2 },
        },
        {
          x: [1, effectiveCutoff],
          y: [0, 0],
          name: 'Baseline (0% Drift)',
          type: 'scatter',
          mode: 'lines',
          line: { color: '#94A3B8', width: 1.5, dash: 'dot' },
        },
      ];

      const layout = {
        title: {
          text: `Telemetry Thermal & Pressure Drift up to Cycle ${effectiveCutoff} — Engine #${selectedEngine}`,
          font: { family: 'Poppins', size: 14, color: '#1E293B' },
        },
        xaxis: { title: 'Flight Cycle Observed', gridcolor: '#F1F5F9' },
        yaxis: {
          title: 'Wear Deviation from Baseline (%)',
          gridcolor: '#F1F5F9',
          ticksuffix: '%',
          autorange: true,
        },
        margin: { l: 55, r: 25, t: 55, b: 65 },
        legend: { orientation: 'h', y: -0.25, x: 0.5, xanchor: 'center' },
      };

      return { chartData: traces, chartLayout: layout, chartHeight: 400 };
    }

    // Subplots view
    const traces = [
      {
        x: subCycles,
        y: subRecords.map((r) => r.s_2),
        xaxis: 'x',
        yaxis: 'y',
        name: 's_2',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#0284C7', width: 2 },
      },
      {
        x: subCycles,
        y: subRecords.map((r) => r.s_3),
        xaxis: 'x2',
        yaxis: 'y2',
        name: 's_3',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#EA580C', width: 2 },
      },
      {
        x: subCycles,
        y: subRecords.map((r) => r.s_4),
        xaxis: 'x3',
        yaxis: 'y3',
        name: 's_4',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#16A34A', width: 2 },
      },
      {
        x: subCycles,
        y: subRecords.map((r) => r.s_11),
        xaxis: 'x4',
        yaxis: 'y4',
        name: 's_11',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#9333EA', width: 2 },
      },
    ];

    const layout = {
      grid: { rows: 2, columns: 2, pattern: 'independent' },
      margin: { l: 50, r: 25, t: 50, b: 50 },
      showlegend: false,
      annotations: [
        {
          text: 's_2: LPC Temp (°R)',
          xref: 'paper',
          yref: 'paper',
          x: 0.18,
          y: 1.05,
          showarrow: false,
          font: { family: 'Poppins', size: 11, color: '#0284C7' },
        },
        {
          text: 's_3: HPC Temp (°R)',
          xref: 'paper',
          yref: 'paper',
          x: 0.82,
          y: 1.05,
          showarrow: false,
          font: { family: 'Poppins', size: 11, color: '#EA580C' },
        },
        {
          text: 's_4: LPT Temp (°R)',
          xref: 'paper',
          yref: 'paper',
          x: 0.18,
          y: 0.47,
          showarrow: false,
          font: { family: 'Poppins', size: 11, color: '#16A34A' },
        },
        {
          text: 's_11: HPC Static Pres (psia)',
          xref: 'paper',
          yref: 'paper',
          x: 0.82,
          y: 0.47,
          showarrow: false,
          font: { family: 'Poppins', size: 11, color: '#9333EA' },
        },
      ],
      xaxis: { gridcolor: '#F1F5F9', showticklabels: false },
      yaxis: { gridcolor: '#F1F5F9', autorange: true },
      xaxis2: { gridcolor: '#F1F5F9', showticklabels: false },
      yaxis2: { gridcolor: '#F1F5F9', autorange: true },
      xaxis3: { title: 'Cycle', gridcolor: '#F1F5F9' },
      yaxis3: { gridcolor: '#F1F5F9', autorange: true },
      xaxis4: { title: 'Cycle', gridcolor: '#F1F5F9' },
      yaxis4: { gridcolor: '#F1F5F9', autorange: true },
    };

    return { chartData: traces, chartLayout: layout, chartHeight: 440 };
  }, [engineData, effectiveCutoff, selectedEngine, maxCycle, viewMode]);

  return (
    <section id="tab-prognostics" className="tab-pane active">
      <div className="board-card full-width-board">
        <div className="section-header">
          <h2>Remaining Useful Life (RUL) Prognostics</h2>
          <p>
            Causal point-in-time RUL estimation evaluated on the 100 test engines
            using Random Forest Regressor.
          </p>
        </div>

        <div className="prognostics-control-panel">
          <div className="control-card">
            <label htmlFor="prognosticEngineSelect">
              Target Engine Unit (1 to 100):
            </label>
            <select
              id="prognosticEngineSelect"
              className="styled-select"
              value={selectedEngine}
              onChange={(e) => onSelectEngine(Number(e.target.value))}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  Engine #{u}
                </option>
              ))}
            </select>
            <div className="engine-meta-pill" id="engineLifespanInfo">
              Max Recorded Cycles: {maxCycle}
            </div>
          </div>

          <div className="control-card flex-2">
            <div className="slider-header">
              <label htmlFor="cutoffSlider">Telemetry Cutoff Cycle (t):</label>
              <span className="slider-val-badge" id="sliderValBadge">
                Cycle {effectiveCutoff}
              </span>
            </div>
            <input
              type="range"
              id="cutoffSlider"
              min={Math.min(5, maxCycle)}
              max={maxCycle}
              value={effectiveCutoff}
              className="styled-slider"
              onChange={(e) => onCutoffChange(Number(e.target.value))}
            />
            <span className="helper-text">
              Extracts rolling window features strictly using cycles up to t with zero
              future leakage.
            </span>
          </div>
        </div>

        {/* 4 Live Output Cards */}
        <div className="live-prognostic-grid">
          <div className="pastel-card card-white">
            <span className="stat-label">Observation Point</span>
            <span className="stat-num" id="liveCycleNum">
              {effectiveCutoff}
            </span>
            <span className="stat-meta">Recorded history</span>
          </div>
          <div className="pastel-card card-peach">
            <span className="stat-label">Predicted RUL</span>
            <span className="stat-num text-orange" id="livePredictedRul">
              {predRul}
            </span>
            <span className="stat-meta">Flight cycles left</span>
          </div>
          <div className="pastel-card card-mint">
            <span className="stat-label">Ground Truth RUL</span>
            <span className="stat-num text-green" id="liveTruthRul">
              {truthRul}
            </span>
            <span className="stat-meta" id="liveTruthMeta">
              {errorText}
            </span>
          </div>
          <div className="pastel-card card-rose">
            <span className="stat-label">Health Margin</span>
            <span className="stat-num text-pink" id="liveHealthMargin">
              {healthMargin}%
            </span>
            <span className="stat-meta">Relative to 125 cap</span>
          </div>
        </div>

        {/* Chart View Mode Selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`subtab-btn ${viewMode === 'rul_trajectory' ? 'active' : ''}`}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              onClick={() => setViewMode('rul_trajectory')}
            >
              📉 RUL Degradation Trajectory
            </button>
            <button
              type="button"
              className={`subtab-btn ${viewMode === 'sensor_drift' ? 'active' : ''}`}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              onClick={() => setViewMode('sensor_drift')}
            >
              📈 Wear Drift (% Delta)
            </button>
            <button
              type="button"
              className={`subtab-btn ${viewMode === 'subplots' ? 'active' : ''}`}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              onClick={() => setViewMode('subplots')}
            >
              📊 Telemetry Subplots
            </button>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Interactive evaluation updated in real time via slider cutoff
          </span>
        </div>

        <PlotlyChart
          id="prognosticTrajectoryChart"
          data={chartData}
          layout={chartLayout}
          style={{ height: `${chartHeight}px` }}
        />
      </div>
    </section>
  );
};
