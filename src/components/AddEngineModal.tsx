import React, { useState } from 'react';

interface AddEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: number[];
  onSubmit: (unit: number, cycle: number, mode: string) => void;
}

export const AddEngineModal: React.FC<AddEngineModalProps> = ({
  isOpen,
  onClose,
  units,
  onSubmit,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [cycle, setCycle] = useState<number>(35);
  const [operatingMode, setOperatingMode] = useState<string>('nominal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedUnit, cycle, operatingMode);
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-card">
        <div className="modal-header">
          <h3>Ingest Telemetry &amp; Run Diagnostics</h3>
          <button className="modal-close-btn" id="closeModalBtn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-desc">
              Simulate sensor ingestion for a propulsion engine unit and run
              causal point-in-time prognostic models.
            </p>
            <div className="modal-form-group">
              <label htmlFor="modalEngineSelect">Target Engine Unit:</label>
              <select
                id="modalEngineSelect"
                className="styled-select"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(Number(e.target.value))}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    Turbofan Unit #{u}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form-group">
              <label htmlFor="modalCycleInput">Flight Cycle to Ingest:</label>
              <input
                type="number"
                id="modalCycleInput"
                className="styled-input"
                value={cycle}
                min={1}
                max={300}
                onChange={(e) => setCycle(Number(e.target.value))}
              />
            </div>
            <div className="modal-form-group">
              <label htmlFor="modalOperatingMode">Operating Condition:</label>
              <select
                id="modalOperatingMode"
                className="styled-select"
                value={operatingMode}
                onChange={(e) => setOperatingMode(e.target.value)}
              >
                <option value="nominal">
                  Sea Level Nominal (Standard Sea Level Atmosphere)
                </option>
                <option value="high_altitude">
                  Climb / Cruise (High Mach Number)
                </option>
                <option value="takeoff">Takeoff Peak Thermal Load</option>
              </select>
            </div>
            <div className="modal-meta-box">
              <div>
                Prognostic Core:{' '}
                <strong>Random Forest Regressor (MAE: 12.02 cyc)</strong>
              </div>
              <div>
                Risk Classifier:{' '}
                <strong>Random Forest (95.0% Accuracy, Recall 84.0%)</strong>
              </div>
              <div>
                Validation Mode: <strong>Zero Data Leakage GroupKFold</strong>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Run Prognostic Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
