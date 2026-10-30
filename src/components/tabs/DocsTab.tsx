import React from 'react';

export const DocsTab: React.FC = () => {
  return (
    <section id="tab-docs" className="tab-pane active">
      <div className="board-card full-width-board">
        <div className="section-header">
          <h2>Methodology, Validation Protocols & Governance</h2>
          <p>
            Academic rigor, zero data leakage protocols, and Viva examination
            preparation guide.
          </p>
        </div>

        <div className="doc-block">
          <h3>1. Engine-Level Group Validation (GroupKFold)</h3>
          <p>
            Turbofan engine data consists of multi-cycle operational time series for
            each unique unit. Splitting cycles at random between train and test sets
            introduces catastrophic target leakage. In this system, all validation
            splits are strictly performed by <code>unit_nr</code>, ensuring that
            validation engines are entirely unseen during training.
          </p>
        </div>

        <div className="doc-block">
          <h3>2. Causal Feature Engineering (Strictly Historical)</h3>
          <p>
            All 78 engineered features (rolling means over 5 and 15 cycles, rolling
            standard deviations, and lag differences) are grouped strictly by{' '}
            <code>unit_nr</code>. Feature windows never bridge across different
            engines, and zero future telemetry cycles are referenced.
          </p>
        </div>

        <div className="doc-block">
          <h3>3. RUL Piecewise Linear Capping (RUL = 125)</h3>
          <p>
            Turbofan engines do not exhibit measurable physical degradation during
            early flight cycles. Following the foundational methodology of Saxena et
            al. (IEEE PHM 2008), the target RUL is capped at 125 cycles to prevent
            regressor bias during nominal initial operation.
          </p>
        </div>

        <div className="doc-block">
          <h3>4. Key Academic References</h3>
          <ul className="citation-list">
            <li>
              <strong>Saxena, A., et al. (2008).</strong> Damage propagation modeling
              for aircraft engine run-to-failure simulation.{' '}
              <em>IEEE PHM 2008</em>. DOI: 10.1109/PHM.2008.4578638
            </li>
            <li>
              <strong>Ramasso, E., &amp; Saxena, A. (2014).</strong> Performance
              benchmarking of prognostic methods for turbofan engines.{' '}
              <em>IJPHM</em>, 5(2), 1-15.
            </li>
            <li>
              <strong>Heimes, F. O. (2008).</strong> Recurrent neural networks for
              remaining useful life estimation. <em>IEEE PHM 2008</em>.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
