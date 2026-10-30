import React from 'react';
import { FleetSummary } from '../../types';

interface PortfolioTabProps {
  fleetSummary: FleetSummary | null;
  onSelectEngine: (unitNr: number, cycle?: number) => void;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({
  fleetSummary,
  onSelectEngine,
}) => {
  const unitsCount = fleetSummary?.fleet_size ?? 100;
  const maeVal = fleetSummary?.models?.best_regression?.test_mae?.toFixed(2) ?? '12.02';
  const accVal = fleetSummary?.models?.best_classification?.accuracy
    ? (fleetSummary.models.best_classification.accuracy * 100).toFixed(1) + '%'
    : '95.0%';
  const featuresCount = fleetSummary?.feature_count ?? 78;

  return (
    <section id="tab-portfolio" className="tab-pane active">
      <div className="portfolio-grid">
        {/* Left: Main Turbofan Units Board */}
        <div className="board-card main-board">
          <div className="board-header">
            <div>
              <h2 className="board-title">Turbofan Fleet Units</h2>
              <span className="board-subtitle">
                Real-time condition monitoring across 100 test propulsion units
              </span>
            </div>
            <div className="board-date">October, 2026</div>
          </div>

          {/* Statistics Counter Row */}
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-num" id="statUnits">
                {unitsCount}
              </span>
              <span className="stat-label">In Fleet</span>
            </div>
            <span className="dot-separator">•</span>
            <div className="stat-item">
              <span className="stat-num" id="statMae">
                {maeVal}
              </span>
              <span className="stat-label">MAE Cycles</span>
            </div>
            <span className="dot-separator">•</span>
            <div className="stat-item">
              <span className="stat-num" id="statAccuracy">
                {accVal}
              </span>
              <span className="stat-label">Accuracy</span>
            </div>
            <span className="dot-separator">•</span>
            <div className="stat-item">
              <span className="stat-num" id="statFeatures">
                {featuresCount}
              </span>
              <span className="stat-label">Features</span>
            </div>
          </div>

          {/* 4 Iconic Pastel Project Cards Grid */}
          <div className="pastel-cards-grid">
            {/* Card 1: Crisp White + Blue */}
            <div
              className="pastel-card card-white"
              onClick={() => onSelectEngine(1)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top-meta">
                <span>Unit #01 • HPC Stage</span>
                <span className="more-dots">••</span>
              </div>
              <h3 className="card-main-title">Turbofan Core</h3>
              <p className="card-sub-title">Compressor Wear Trace</p>
              <div className="progress-meta">
                <span>Progress</span>
                <span>90%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-blue" style={{ width: '90%' }}></div>
              </div>
              <div className="card-footer">
                <div className="status-indicator">
                  <span>⚙️</span>
                  <span className="status-text blue">ACTIVE</span>
                </div>
                <span className="pill-badge pill-blue">112 Cyc Left</span>
              </div>
            </div>

            {/* Card 2: Warm Peach + Alert */}
            <div
              className="pastel-card card-peach"
              onClick={() => onSelectEngine(34)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top-meta">
                <span>Unit #34 • High Alert</span>
                <span className="more-dots">••</span>
              </div>
              <h3 className="card-main-title">Thermal Surge</h3>
              <p className="card-sub-title">Exhaust Gas Temp Rising</p>
              <div className="progress-meta">
                <span>Progress</span>
                <span>30%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-orange" style={{ width: '30%' }}></div>
              </div>
              <div className="card-footer">
                <div className="status-indicator">
                  <span>⚠️</span>
                  <span className="status-text orange">CRITICAL</span>
                </div>
                <span className="pill-badge pill-white">18 Cyc Left</span>
              </div>
            </div>

            {/* Card 3: Mint Green + Nominal */}
            <div
              className="pastel-card card-mint"
              onClick={() => onSelectEngine(12)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top-meta">
                <span>Unit #12 • Baseline</span>
                <span className="more-dots">••</span>
              </div>
              <h3 className="card-main-title">Rotor Speeds</h3>
              <p className="card-sub-title">Core & Fan Spool Sync</p>
              <div className="progress-meta">
                <span>Progress</span>
                <span>92%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-green" style={{ width: '92%' }}></div>
              </div>
              <div className="card-footer">
                <div className="status-indicator">
                  <span>✅</span>
                  <span className="status-text green">NOMINAL</span>
                </div>
                <span className="pill-badge pill-white">135 Cyc Left</span>
              </div>
            </div>

            {/* Card 4: Soft Rose Pink + Inspection */}
            <div
              className="pastel-card card-rose"
              onClick={() => onSelectEngine(69)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top-meta">
                <span>Unit #69 • Lifespan Max</span>
                <span className="more-dots">••</span>
              </div>
              <h3 className="card-main-title">Pressure Ratio</h3>
              <p className="card-sub-title">Bypass Duct Stability</p>
              <div className="progress-meta">
                <span>Progress</span>
                <span>65%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-pink" style={{ width: '65%' }}></div>
              </div>
              <div className="card-footer">
                <div className="status-indicator">
                  <span>🩺</span>
                  <span className="status-text pink">INSPECTION</span>
                </div>
                <span className="pill-badge pill-white">74 Cyc Left</span>
              </div>
            </div>
          </div>

          {/* 3D Turbofan Core Engine Graphic Card */}
          <div className="engine-graphic-banner">
            <div className="banner-text">
              <h3>NASA C-MAPSS FD001 Propulsion Hardware</h3>
              <p>
                High-Pressure Compressor (HPC) degradation model with 21
                thermodynamic sensors and group-validated temporal feature
                engineering.
              </p>
              <div className="banner-tags">
                <span className="pill-badge pill-blue">Causal Rolling Windows</span>
                <span className="pill-badge pill-mint">Zero Leakage</span>
                <span className="pill-badge pill-white">GroupKFold (k=5)</span>
              </div>
            </div>
            <div className="banner-img-wrap">
              <img
                src="/assets/turbofan_core.jpg"
                alt="Turbofan Engine Core 3D Graphic"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Fleet Diagnostic Feed & Elevated Floating Card */}
        <div className="board-card feed-board">
          <div className="feed-header">
            <h2 className="board-title">Fleet Diagnostic Feed</h2>
            <span className="feed-action-dots">🔍 •</span>
          </div>

          <div className="feed-list">
            {/* Feed Item: Unit #05 */}
            <div
              className="feed-item"
              onClick={() => onSelectEngine(5)}
              style={{ cursor: 'pointer' }}
            >
              <div className="feed-avatar avatar-blue">#05</div>
              <div className="feed-content">
                <div className="feed-unit-title">Engine #05</div>
                <div className="feed-desc">
                  All 15 informative sensors nominal at cycle 120. RUL est: 95 cyc.
                </div>
              </div>
              <div className="feed-date">21 July</div>
            </div>

            {/* Elevated Signature Floating Alert Card */}
            <div
              className="feed-item highlight-card"
              onClick={() => onSelectEngine(34)}
              style={{ cursor: 'pointer' }}
            >
              <div className="feed-avatar avatar-critical">#34</div>
              <div className="feed-content">
                <div className="highlight-top-row">
                  <span className="highlight-unit-name">Engine #34</span>
                  <span className="gold-star">★</span>
                </div>
                <div className="highlight-alert-msg">
                  Critical Alert: HPC static pressure surged by +1.8%. Maintenance
                  window reached (18 cyc).
                </div>
              </div>
            </div>

            {/* Feed Item: Unit #18 */}
            <div
              className="feed-item"
              onClick={() => onSelectEngine(18)}
              style={{ cursor: 'pointer' }}
            >
              <div className="feed-avatar avatar-peach">#18</div>
              <div className="feed-content">
                <div className="feed-unit-title">Engine #18</div>
                <div className="feed-desc">
                  LPC outlet temperature stabilized at 642.5 °R.
                </div>
              </div>
              <div className="feed-date">19 July</div>
            </div>

            {/* Feed Item: Unit #82 */}
            <div
              className="feed-item"
              onClick={() => onSelectEngine(82)}
              style={{ cursor: 'pointer' }}
            >
              <div className="feed-avatar avatar-pink-bg">#82</div>
              <div className="feed-content">
                <div className="feed-unit-title">Engine #82</div>
                <div className="feed-desc">
                  Shaft vibration within tolerance. Core speed nominal.
                </div>
              </div>
              <div className="feed-date">17 July</div>
            </div>

            {/* Feed Item: Unit #47 */}
            <div
              className="feed-item"
              onClick={() => onSelectEngine(47)}
              style={{ cursor: 'pointer' }}
            >
              <div className="feed-avatar avatar-mint">#47</div>
              <div className="feed-content">
                <div className="feed-unit-title">Engine #47</div>
                <div className="feed-desc">
                  Fuel flow ratio constant. Combustor thermal gradient steady.
                </div>
              </div>
              <div className="feed-date">15 July</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
