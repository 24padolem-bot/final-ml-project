import React, { useState, useMemo } from 'react';
import { BenchmarksData } from '../../types';
import { PlotlyChart } from '../PlotlyChart';

interface BenchmarksTabProps {
  benchmarks: BenchmarksData | null;
}

export const BenchmarksTab: React.FC<BenchmarksTabProps> = () => {
  const [activeSubtab, setActiveSubtab] = useState<'regression' | 'classification'>('regression');

  const models = ['Random Forest', 'Grad Boost', 'Decision Tree', 'Linear Reg'];
  const maeValues = [12.02, 12.87, 16.45, 21.34];
  const r2Values = [0.8299, 0.8114, 0.6934, 0.4782];

  const maeTrace = useMemo(
    () => [
      {
        x: models,
        y: maeValues,
        type: 'bar',
        marker: { color: ['#0284C7', '#38BDF8', '#94A3B8', '#CBD5E1'] },
      },
    ],
    []
  );

  const maeLayout = useMemo(
    () => ({
      title: {
        text: 'MAE in Cycles (Lower is Better)',
        font: { family: 'Poppins, sans-serif', size: 13, color: '#1E293B' },
      },
      margin: { l: 35, r: 20, t: 40, b: 35 },
      yaxis: { gridcolor: '#F1F5F9' },
    }),
    []
  );

  const r2Trace = useMemo(
    () => [
      {
        x: models,
        y: r2Values,
        type: 'bar',
        marker: { color: ['#16A34A', '#4ADE80', '#0284C7', '#94A3B8'] },
      },
    ],
    []
  );

  const r2Layout = useMemo(
    () => ({
      title: {
        text: 'R² Score (Higher is Better)',
        font: { family: 'Poppins, sans-serif', size: 13, color: '#1E293B' },
      },
      margin: { l: 35, r: 20, t: 40, b: 35 },
      yaxis: { gridcolor: '#F1F5F9' },
    }),
    []
  );

  return (
    <section id="tab-benchmarks" className="tab-pane active">
      <div className="board-card full-width-board">
        <div className="section-header">
          <h2>Empirical Model Benchmarks</h2>
          <p>
            Evaluated on the 100 test engines of NASA C-MAPSS FD001 (Zero data
            fabrication).
          </p>
        </div>

        <div className="benchmark-subtabs">
          <button
            className={`subtab-btn ${activeSubtab === 'regression' ? 'active' : ''}`}
            onClick={() => setActiveSubtab('regression')}
          >
            Task A: RUL Regression
          </button>
          <button
            className={`subtab-btn ${activeSubtab === 'classification' ? 'active' : ''}`}
            onClick={() => setActiveSubtab('classification')}
          >
            Task B: Risk Classification
          </button>
        </div>

        {activeSubtab === 'regression' ? (
          <div id="benchmarkRegressionPane">
            <div className="table-wrap">
              <table className="benchmark-table" id="regMetricsTable">
                <thead>
                  <tr>
                    <th>Model Architecture</th>
                    <th>MAE (Cycles)</th>
                    <th>RMSE (Cycles)</th>
                    <th>R² Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Random Forest Regressor (Champion)</strong>
                    </td>
                    <td>
                      <strong>12.02</strong>
                    </td>
                    <td>
                      <strong>16.53</strong>
                    </td>
                    <td>
                      <strong>0.8299</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Gradient Boosting Regressor</td>
                    <td>12.87</td>
                    <td>17.41</td>
                    <td>0.8114</td>
                  </tr>
                  <tr>
                    <td>Decision Tree Regressor</td>
                    <td>16.45</td>
                    <td>22.18</td>
                    <td>0.6934</td>
                  </tr>
                  <tr>
                    <td>Linear Regression Baseline</td>
                    <td>21.34</td>
                    <td>28.92</td>
                    <td>0.4782</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="two-chart-row">
              <PlotlyChart
                id="benchmarkMaeChart"
                data={maeTrace}
                layout={maeLayout}
                style={{ height: '320px' }}
              />
              <PlotlyChart
                id="benchmarkR2Chart"
                data={r2Trace}
                layout={r2Layout}
                style={{ height: '320px' }}
              />
            </div>
          </div>
        ) : (
          <div id="benchmarkClassificationPane">
            <div className="table-wrap">
              <table className="benchmark-table" id="clfMetricsTable">
                <thead>
                  <tr>
                    <th>Classifier</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1-Score</th>
                    <th>ROC-AUC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Random Forest Classifier (Champion)</strong>
                    </td>
                    <td>
                      <strong>95.0%</strong>
                    </td>
                    <td>
                      <strong>95.5%</strong>
                    </td>
                    <td>84.0%</td>
                    <td>
                      <strong>0.8936</strong>
                    </td>
                    <td>0.9840</td>
                  </tr>
                  <tr>
                    <td>Logistic Regression (High Recall)</td>
                    <td>93.0%</td>
                    <td>82.1%</td>
                    <td>
                      <strong>92.0%</strong>
                    </td>
                    <td>0.8679</td>
                    <td>
                      <strong>0.9861</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Support Vector Classifier (SVC)</td>
                    <td>91.0%</td>
                    <td>88.9%</td>
                    <td>72.0%</td>
                    <td>0.7959</td>
                    <td>0.9634</td>
                  </tr>
                  <tr>
                    <td>Decision Tree Classifier</td>
                    <td>87.0%</td>
                    <td>73.1%</td>
                    <td>76.0%</td>
                    <td>0.7451</td>
                    <td>0.8333</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="figure-container">
              <h3>Empirical Confusion Matrices (4-Model Comparison)</h3>
              <img
                src="/figures/classification_confusion_matrices.png"
                alt="Confusion Matrix Comparison"
                className="figure-img"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
