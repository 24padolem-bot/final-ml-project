# Machine Health Intelligence: Turbofan Engine Degradation & RUL Prognostics (React Suite)

An interactive, responsive React application built with TypeScript and Vite for turbofan engine predictive maintenance, condition monitoring, and Remaining Useful Life (RUL) estimation on the NASA C-MAPSS FD001 dataset.

---

## Overview

This application delivers a high-fidelity monitoring and prognostics suite for gas-turbine aircraft engines:

1. **Portfolio Dashboard**: Fleet-wide view across 100 test units with key metrics (MAE 12.02 cycles, 95.0% Risk Classification Accuracy, 78 leak-free features) and quick-access operational cards.
2. **Sensor Telemetry**: Interactive multi-channel thermodynamic telemetry inspection across engine flight cycles (`s_2` LPC outlet temp, `s_3` HPC outlet temp, `s_4` LPT outlet temp, `s_11` HPC static pressure).
3. **RUL Estimation (Prognostics)**: Point-in-time causal estimation with an interactive historical cutoff slider ($t$), zero future data leakage, live predicted RUL vs ground truth comparison, and error tracking.
4. **Maintenance Risk Triage**: Real-time diagnostic alert banner and confidence meter identifying units within the critical failure threshold ($RUL \le 30$ cycles).
5. **Model Benchmarks**: Empirical performance tables and bar charts for RUL Regression (Random Forest Champion: MAE 12.02, $R^2$ 0.8299) and Risk Classification (Random Forest: 95.0% Accuracy, 0.8936 F1).
6. **Operating Clusters & PCA**: Unsupervised K-Means ($k=3$) wear state analysis with 2D Principal Component Analysis explaining 74.2% of variance.
7. **Methodology & Docs**: Academic background on GroupKFold validation, causal feature engineering, piecewise linear RUL capping ($RUL = 125$), and reference literature.
8. **Interactive Utilities**: Live engine search, dynamic flight diagnostic alert drawer, simulated telemetry ingestion modal, and dismissible toasts.

---

## Tech Stack & Architecture

- **Framework**: React 18 + TypeScript + Vite
- **UI Architecture**: Component-based modular architecture, custom design system matching pastel cards, responsive sidebar drawer, and interactive top navigation.
- **Visualizations**: Plotly.js charts for thermodynamic sensor time series, confidence gauge, and benchmark metrics.
- **Dataset**: NASA Commercial Modular Aero-Propulsion System Simulation (C-MAPSS) FD001.

---

## Quickstart & Local Development

### Prerequisites

- Node.js 20+
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build production bundle
npm run build
```
