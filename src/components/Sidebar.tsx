import React from 'react';
import { TabId } from '../types';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { id: TabId; label: string }[] = [
  { id: 'tab-portfolio', label: 'Portfolio Dashboard' },
  { id: 'tab-telemetry', label: 'Sensor Telemetry' },
  { id: 'tab-prognostics', label: 'RUL Estimation' },
  { id: 'tab-risk', label: 'Maintenance Risk' },
  { id: 'tab-benchmarks', label: 'Model Benchmarks' },
  { id: 'tab-clusters', label: 'Operating Clusters' },
  { id: 'tab-docs', label: 'Methodology & Docs' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="appSidebar">
        <div className="sidebar-brand">
          <div className="brand-left">
            <div className="brand-icon">⚡</div>
            <div className="brand-text">
              <h2>Machine Health</h2>
              <span>Prognostics Suite</span>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            id="sidebarCloseBtn"
            title="Close Menu"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
              >
                <span className="radio-circle"></span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="fleet-specs-badge">
            <div className="specs-title">FLEET SPECS</div>
            <div>
              Dataset: <strong>NASA C-MAPSS FD001</strong>
            </div>
            <div>
              Hardware: <strong>Turbofan HPC Core</strong>
            </div>
            <div>
              Holdout: <strong>Engine-Level Group</strong>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`}
        id="sidebarBackdrop"
        onClick={onClose}
      />
    </>
  );
};
