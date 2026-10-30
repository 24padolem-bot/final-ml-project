import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TabId,
  FleetSummary,
  EngineData,
  PrognosticPrediction,
  BenchmarksData,
  NotificationItem,
  ToastMessage,
} from './types';
import {
  fetchFleetSummary,
  fetchEngineList,
  fetchEngineData,
  fetchBenchmarks,
} from './services/dataService';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PortfolioTab } from './components/tabs/PortfolioTab';
import { TelemetryTab } from './components/tabs/TelemetryTab';
import { PrognosticsTab } from './components/tabs/PrognosticsTab';
import { RiskTab } from './components/tabs/RiskTab';
import { BenchmarksTab } from './components/tabs/BenchmarksTab';
import { ClustersTab } from './components/tabs/ClustersTab';
import { DocsTab } from './components/tabs/DocsTab';
import { AddEngineModal } from './components/AddEngineModal';
import { ToastContainer } from './components/Toast';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'critical',
    unit: 34,
    title: 'Engine #34 • Critical Alert',
    text: 'HPC static pressure surge (+1.8%). Imminent maintenance limit (18 cyc).',
    time: 'Just now',
  },
  {
    id: 'notif-2',
    type: 'warning',
    unit: 18,
    title: 'Engine #18 • Thermal Advisory',
    text: 'LPC outlet temperature stabilized at 642.5 °R. Spool balance steady.',
    time: '12 min ago',
  },
  {
    id: 'notif-3',
    type: 'info',
    unit: 69,
    title: 'Engine #69 • Scheduled Inspection',
    text: 'Bypass duct ratio verification recommended within 74 cycles.',
    time: '1 hr ago',
  },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('tab-portfolio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [units, setUnits] = useState<number[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarksData | null>(null);

  const [selectedEngine, setSelectedEngine] = useState<number>(1);
  const [engineData, setEngineData] = useState<EngineData | null>(null);
  const [cutoffCycle, setCutoffCycle] = useState<number>(31);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load
  useEffect(() => {
    fetchFleetSummary().then(setFleetSummary);
    fetchEngineList().then(setUnits);
    fetchBenchmarks().then(setBenchmarks);
  }, []);

  // Load selected engine data
  useEffect(() => {
    let isCurrent = true;
    fetchEngineData(selectedEngine).then((data) => {
      if (!isCurrent) return;
      if (data) {
        setEngineData(data);
        setCutoffCycle(data.max_cycle);
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [selectedEngine]);

  // Handle engine and custom cycle navigation
  const selectQuickEngine = useCallback(
    async (unitNr: number, customCycle?: number) => {
      setSelectedEngine(unitNr);
      const data = await fetchEngineData(unitNr);
      if (data) {
        setEngineData(data);
        if (customCycle !== undefined) {
          setCutoffCycle(Math.min(customCycle, data.max_cycle));
        } else {
          setCutoffCycle(data.max_cycle);
        }
      }
      setActiveTab('tab-prognostics');
    },
    []
  );

  // Compute current prognostic prediction
  const currentPrediction = useMemo<PrognosticPrediction | null>(() => {
    if (!engineData || !engineData.predictions) return null;

    const key = String(cutoffCycle);
    if (engineData.predictions[key]) {
      return engineData.predictions[key];
    }

    const keys = Object.keys(engineData.predictions)
      .map(Number)
      .sort((a, b) => a - b);
    if (keys.length === 0) return null;

    const closest = keys.reduce(
      (prev, curr) =>
        Math.abs(curr - cutoffCycle) < Math.abs(prev - cutoffCycle) ? curr : prev,
      keys[0]
    );

    return engineData.predictions[String(closest)] || null;
  }, [engineData, cutoffCycle]);

  // Handle simulation ingest from modal
  const handleSimulatedIngest = useCallback(
    (unit: number, cycle: number, mode: string) => {
      setIsAddModalOpen(false);
      showToast(
        `Ingested Engine #${unit} at cycle ${cycle} (${mode}). Running prognostics...`,
        'success'
      );
      selectQuickEngine(unit, cycle);
    },
    [selectQuickEngine, showToast]
  );

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
    showToast('All diagnostic alerts marked as acknowledged.', 'info');
  }, [showToast]);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header Bar */}
        <TopBar
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onSelectEngine={(unitNr, cycle) => selectQuickEngine(unitNr, cycle)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          units={units}
          notifications={notifications}
          onClearNotifications={handleClearNotifications}
        />

        {/* Tab 1: Portfolio Dashboard */}
        {activeTab === 'tab-portfolio' && (
          <PortfolioTab
            fleetSummary={fleetSummary}
            onSelectEngine={selectQuickEngine}
          />
        )}

        {/* Tab 2: Sensor Telemetry */}
        {activeTab === 'tab-telemetry' && (
          <TelemetryTab
            units={units}
            selectedEngine={selectedEngine}
            onSelectEngine={(u) => setSelectedEngine(u)}
            engineData={engineData}
          />
        )}

        {/* Tab 3: RUL Prognostics */}
        {activeTab === 'tab-prognostics' && (
          <PrognosticsTab
            units={units}
            selectedEngine={selectedEngine}
            onSelectEngine={(u) => setSelectedEngine(u)}
            engineData={engineData}
            cutoffCycle={cutoffCycle}
            onCutoffChange={setCutoffCycle}
            prediction={currentPrediction}
          />
        )}

        {/* Tab 4: Maintenance Risk */}
        {activeTab === 'tab-risk' && (
          <RiskTab
            selectedEngine={selectedEngine}
            prediction={currentPrediction}
          />
        )}

        {/* Tab 5: Model Benchmarks */}
        {activeTab === 'tab-benchmarks' && (
          <BenchmarksTab benchmarks={benchmarks} />
        )}

        {/* Tab 6: Operating Regimes & Clustering */}
        {activeTab === 'tab-clusters' && <ClustersTab />}

        {/* Tab 7: Methodology & Docs */}
        {activeTab === 'tab-docs' && <DocsTab />}
      </main>

      {/* Add Engine Simulation Modal */}
      <AddEngineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        units={units}
        onSubmit={handleSimulatedIngest}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
