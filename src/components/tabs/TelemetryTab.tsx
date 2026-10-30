import React, { useState, useMemo, useEffect } from 'react';
import { EngineData } from '../../types';
import { PlotlyChart } from '../PlotlyChart';
import { fetchEngineData } from '../../services/dataService';

interface TelemetryTabProps {
  units: number[];
  selectedEngine: number;
  onSelectEngine: (unitNr: number) => void;
  engineData: EngineData | null;
}

type ViewMode = 'subplots' | 'normalized' | 'single';
type SensorKey = 's_2' | 's_3' | 's_4' | 's_11';

const SENSOR_META: Record<
  SensorKey,
  { name: string; desc: string; unit: string; color: string }
> = {
  s_2: {
    name: 's_2',
    desc: 'LPC Outlet Temperature',
    unit: '°R',
    color: '#0284C7',
  },
  s_3: {
    name: 's_3',
    desc: 'HPC Outlet Temperature',
    unit: '°R',
    color: '#EA580C',
  },
  s_4: {
    name: 's_4',
    desc: 'LPT Outlet Temperature',
    unit: '°R',
    color: '#16A34A',
  },
  s_11: {
    name: 's_11',
    desc: 'HPC Static Pressure',
    unit: 'psia',
    color: '#9333EA',
  },
};

export const TelemetryTab: React.FC<TelemetryTabProps> = ({
  units,
  selectedEngine,
  onSelectEngine,
  engineData: initialEngineData,
}) => {
  const [split, setSplit] = useState<'test' | 'train'>('test');
  const [viewMode, setViewMode] = useState<ViewMode>('subplots');
  const [selectedSensor, setSelectedSensor] = useState<SensorKey>('s_3');
  const [activeEngineData, setActiveEngineData] = useState<EngineData | null>(
    initialEngineData
  );
  const [loading, setLoading] = useState(false);

  // Sync or fetch when engine or split changes
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    fetchEngineData(selectedEngine, split)
      .then((data) => {
        if (isCurrent) {
          setActiveEngineData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [selectedEngine, split]);

  const records = activeEngineData?.records || [];
  const cycles = useMemo(() => records.map((r) => r.cycle), [records]);

  // Current and baseline values for quick KPI chips
  const sensorStats = useMemo(() => {
    if (records.length === 0) return null;
    const first = records[0];
    const last = records[records.length - 1];

    return (['s_2', 's_3', 's_4', 's_11'] as SensorKey[]).map((key) => {
      const initVal = first[key];
      const curVal = last[key];
      const delta = curVal - initVal;
      const pct = (delta / initVal) * 100;
      return {
        key,
        ...SENSOR_META[key],
        current: curVal,
        initial: initVal,
        delta,
        pct,
      };
    });
  }, [records]);

  // Build Plotly data and layout depending on ViewMode
  const { chartData, chartLayout, chartHeight } = useMemo(() => {
    if (records.length === 0) {
      return { chartData: [], chartLayout: {}, chartHeight: 480 };
    }

    if (viewMode === 'subplots') {
      // 2x2 Independent Subplots Grid with individual auto-scaling Y axes
      const s2Vals = records.map((r) => r.s_2);
      const s3Vals = records.map((r) => r.s_3);
      const s4Vals = records.map((r) => r.s_4);
      const s11Vals = records.map((r) => r.s_11);

      const traces = [
        {
          x: cycles,
          y: s2Vals,
          xaxis: 'x',
          yaxis: 'y',
          name: 's_2 (LPC Outlet Temp)',
          type: 'scatter',
          mode: 'lines',
          line: { color: SENSOR_META.s_2.color, width: 2.2 },
        },
        {
          x: cycles,
          y: s3Vals,
          xaxis: 'x2',
          yaxis: 'y2',
          name: 's_3 (HPC Outlet Temp)',
          type: 'scatter',
          mode: 'lines',
          line: { color: SENSOR_META.s_3.color, width: 2.2 },
        },
        {
          x: cycles,
          y: s4Vals,
          xaxis: 'x3',
          yaxis: 'y3',
          name: 's_4 (LPT Outlet Temp)',
          type: 'scatter',
          mode: 'lines',
          line: { color: SENSOR_META.s_4.color, width: 2.2 },
        },
        {
          x: cycles,
          y: s11Vals,
          xaxis: 'x4',
          yaxis: 'y4',
          name: 's_11 (HPC Static Pres)',
          type: 'scatter',
          mode: 'lines',
          line: { color: SENSOR_META.s_11.color, width: 2.2 },
        },
      ];

      const layout = {
        grid: { rows: 2, columns: 2, pattern: 'independent' },
        margin: { l: 50, r: 25, t: 50, b: 50 },
        showlegend: false,
        annotations: [
          {
            text: 's_2: LPC Outlet Temperature (°R)',
            xref: 'paper',
            yref: 'paper',
            x: 0.18,
            y: 1.05,
            showarrow: false,
            font: { family: 'Poppins', size: 12, color: SENSOR_META.s_2.color },
          },
          {
            text: 's_3: HPC Outlet Temperature (°R)',
            xref: 'paper',
            yref: 'paper',
            x: 0.82,
            y: 1.05,
            showarrow: false,
            font: { family: 'Poppins', size: 12, color: SENSOR_META.s_3.color },
          },
          {
            text: 's_4: LPT Outlet Temperature (°R)',
            xref: 'paper',
            yref: 'paper',
            x: 0.18,
            y: 0.47,
            showarrow: false,
            font: { family: 'Poppins', size: 12, color: SENSOR_META.s_4.color },
          },
          {
            text: 's_11: HPC Static Pressure (psia)',
            xref: 'paper',
            yref: 'paper',
            x: 0.82,
            y: 0.47,
            showarrow: false,
            font: { family: 'Poppins', size: 12, color: SENSOR_META.s_11.color },
          },
        ],
        xaxis: {
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
          showticklabels: false,
        },
        yaxis: {
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
          autorange: true,
          tickformat: '.1f',
        },
        xaxis2: {
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
          showticklabels: false,
        },
        yaxis2: {
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
          autorange: true,
          tickformat: '.0f',
        },
        xaxis3: {
          title: 'Flight Cycles',
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
        },
        yaxis3: {
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
          autorange: true,
          tickformat: '.0f',
        },
        xaxis4: {
          title: 'Flight Cycles',
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
        },
        yaxis4: {
          gridcolor: '#F1F5F9',
          linecolor: '#CBD5E1',
          autorange: true,
          tickformat: '.2f',
        },
      };

      return { chartData: traces, chartLayout: layout, chartHeight: 520 };
    }

    if (viewMode === 'normalized') {
      // Normalized % drift from Cycle 1: (s_t - s_1) / s_1 * 100
      const first = records[0];
      const traces = (['s_2', 's_3', 's_4', 's_11'] as SensorKey[]).map((key) => {
        const initVal = first[key] || 1;
        const pctVals = records.map((r) => ((r[key] - initVal) / initVal) * 100);
        return {
          x: cycles,
          y: pctVals,
          name: `${SENSOR_META[key].desc} (${key})`,
          type: 'scatter',
          mode: 'lines',
          line: { color: SENSOR_META[key].color, width: 2.4 },
        };
      });

      // Zero baseline reference line
      traces.push({
        x: [cycles[0], cycles[cycles.length - 1]],
        y: [0, 0],
        name: 'Baseline (Cycle 1 Nominal)',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#94A3B8', width: 1.5, dash: 'dot' },
      } as any);

      const layout = {
        title: {
          text: `Normalized Thermodynamic Sensor Drift (% Change from Cycle 1) — Unit #${selectedEngine}`,
          font: { family: 'Poppins', size: 14, color: '#1E293B' },
        },
        xaxis: { title: 'Flight Cycles Elapsed', gridcolor: '#F1F5F9' },
        yaxis: {
          title: 'Sensor Deviation (%)',
          gridcolor: '#F1F5F9',
          ticksuffix: '%',
          autorange: true,
        },
        margin: { l: 60, r: 25, t: 60, b: 70 },
        legend: { orientation: 'h', y: -0.22, x: 0.5, xanchor: 'center' },
      };

      return { chartData: traces, chartLayout: layout, chartHeight: 480 };
    }

    // Single Channel Deep Dive
    const meta = SENSOR_META[selectedSensor];
    const vals = records.map((r) => r[selectedSensor]);

    // Compute rolling mean window=5
    const rollingMean: number[] = [];
    for (let i = 0; i < vals.length; i++) {
      const start = Math.max(0, i - 4);
      const sub = vals.slice(start, i + 1);
      const avg = sub.reduce((a, b) => a + b, 0) / sub.length;
      rollingMean.push(avg);
    }

    const traces = [
      {
        x: cycles,
        y: vals,
        name: `Raw Telemetry (${meta.unit})`,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { size: 4, color: meta.color, opacity: 0.6 },
        line: { color: meta.color, width: 1.5 },
      },
      {
        x: cycles,
        y: rollingMean,
        name: '5-Cycle Moving Average Trendline',
        type: 'scatter',
        mode: 'lines',
        line: { color: '#0F172A', width: 2.8 },
      },
    ];

    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const pad = (maxVal - minVal) * 0.12 || 1;

    const layout = {
      title: {
        text: `${meta.desc} (${selectedSensor}) — Deep Inspection — Unit #${selectedEngine}`,
        font: { family: 'Poppins', size: 15, color: '#1E293B' },
      },
      xaxis: { title: 'Flight Cycles Elapsed', gridcolor: '#F1F5F9' },
      yaxis: {
        title: `${meta.desc} (${meta.unit})`,
        gridcolor: '#F1F5F9',
        range: [minVal - pad, maxVal + pad],
      },
      margin: { l: 65, r: 25, t: 60, b: 70 },
      legend: { orientation: 'h', y: -0.22, x: 0.5, xanchor: 'center' },
    };

    return { chartData: traces, chartLayout: layout, chartHeight: 480 };
  }, [records, cycles, viewMode, selectedSensor, selectedEngine]);

  return (
    <section id="tab-telemetry" className="tab-pane active">
      <div className="board-card full-width-board">
        <div className="section-header">
          <h2>Sensor Telemetry &amp; Degradation Trajectories</h2>
          <p>
            High-resolution physical sensor telemetry with independent channel
            scaling, drift analysis, and run-to-failure comparison.
          </p>
        </div>

        {/* Primary Controls */}
        <div className="control-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="control-group">
            <label htmlFor="telemetryEngineSelect">Select Engine Unit:</label>
            <select
              id="telemetryEngineSelect"
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
          </div>

          <div className="control-group">
            <label htmlFor="telemetrySplitSelect">Telemetry Split:</label>
            <select
              id="telemetrySplitSelect"
              className="styled-select"
              value={split}
              onChange={(e) => setSplit(e.target.value as 'test' | 'train')}
            >
              <option value="test">Test Split (In-Service Holdout)</option>
              <option value="train">
                Training Split (Full Run-to-Failure Lifespan)
              </option>
            </select>
          </div>

          <div className="control-group">
            <label>Visualization Mode:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`subtab-btn ${viewMode === 'subplots' ? 'active' : ''}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => setViewMode('subplots')}
              >
                📊 4-Channel Subplots
              </button>
              <button
                type="button"
                className={`subtab-btn ${viewMode === 'normalized' ? 'active' : ''}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => setViewMode('normalized')}
              >
                📈 Normalized Drift (%)
              </button>
              <button
                type="button"
                className={`subtab-btn ${viewMode === 'single' ? 'active' : ''}`}
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => setViewMode('single')}
              >
                🔍 Single Channel
              </button>
            </div>
          </div>

          {viewMode === 'single' && (
            <div className="control-group">
              <label>Channel to Inspect:</label>
              <select
                className="styled-select"
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(e.target.value as SensorKey)}
              >
                <option value="s_2">s_2: LPC Outlet Temperature (°R)</option>
                <option value="s_3">s_3: HPC Outlet Temperature (°R)</option>
                <option value="s_4">s_4: LPT Outlet Temperature (°R)</option>
                <option value="s_11">s_11: HPC Static Pressure (psia)</option>
              </select>
            </div>
          )}
        </div>

        {/* Sensor Live Physical Values & Baseline Drift Chips */}
        {sensorStats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '12px',
              margin: '18px 0 20px 0',
            }}
          >
            {sensorStats.map((st) => (
              <div
                key={st.key}
                className="pastel-card"
                style={{
                  padding: '14px 18px',
                  borderLeft: `4px solid ${st.color}`,
                  cursor: viewMode === 'single' ? 'pointer' : 'default',
                  opacity:
                    viewMode === 'single' && selectedSensor !== st.key ? 0.65 : 1,
                }}
                onClick={() => {
                  if (viewMode === 'single') setSelectedSensor(st.key);
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: st.color,
                      textTransform: 'uppercase',
                    }}
                  >
                    {st.key} • {st.desc}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    margin: '6px 0 2px 0',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#1E293B',
                    }}
                  >
                    {st.current.toFixed(st.key === 's_11' ? 2 : 1)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {st.unit}
                  </span>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      marginLeft: 'auto',
                      color: st.delta >= 0 ? '#DC2626' : '#16A34A',
                    }}
                  >
                    {st.delta >= 0 ? '+' : ''}
                    {st.pct.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                  Baseline (cycle 1): {st.initial.toFixed(st.key === 's_11' ? 2 : 1)}{' '}
                  {st.unit}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Plotly Chart */}
        {loading ? (
          <div
            style={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
            }}
          >
            Loading engine telemetry stream...
          </div>
        ) : (
          <PlotlyChart
            id="telemetryChartContainer"
            data={chartData}
            layout={chartLayout}
            style={{ height: `${chartHeight}px` }}
          />
        )}
      </div>
    </section>
  );
};
