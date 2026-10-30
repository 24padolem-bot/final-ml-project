import React, { useState, useRef, useEffect } from 'react';
import { TabId, NotificationItem } from '../types';

interface TopBarProps {
  activeTab: TabId;
  onToggleSidebar: () => void;
  onSelectEngine: (unitNr: number, cycle?: number) => void;
  onOpenAddModal: () => void;
  units: number[];
  notifications: NotificationItem[];
  onClearNotifications: () => void;
}

const TAB_TITLES: Record<TabId, string> = {
  'tab-portfolio': 'Portfolio',
  'tab-telemetry': 'Telemetry',
  'tab-prognostics': 'Prognostics',
  'tab-risk': 'Maintenance Risk',
  'tab-benchmarks': 'Benchmarks',
  'tab-clusters': 'Operating Regimes',
  'tab-docs': 'Methodology',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onToggleSidebar,
  onSelectEngine,
  onOpenAddModal,
  units,
  notifications,
  onClearNotifications,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter search results
  const getSearchResults = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const unitList = units.length ? units : Array.from({ length: 100 }, (_, i) => i + 1);
    const matches: { unit_nr: number; isCritical: boolean; isWarning: boolean; score: number }[] = [];

    unitList.forEach((u) => {
      const uStr = String(u);
      const name = `engine #${u}`;
      const isCritical = u === 34 || u === 81 || u === 68 || u === 76;
      const isWarning = u === 18 || u === 49 || u === 92;

      let score = 0;
      if (uStr === q || name === q) score = 10;
      else if (uStr.startsWith(q)) score = 8;
      else if (uStr.includes(q)) score = 5;
      else if (q.includes('alert') || q.includes('crit')) {
        if (isCritical) score = 9;
      } else if (q.includes('risk') || q.includes('warn')) {
        if (isWarning || isCritical) score = 7;
      } else if (q.includes('nom') || q.includes('ok')) {
        if (!isCritical && !isWarning) score = 4;
      }

      if (score > 0) {
        matches.push({ unit_nr: u, isCritical, isWarning, score });
      }
    });

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 7);
  };

  const searchResults = getSearchResults();

  return (
    <header className="top-bar">
      <div className="top-left">
        <button
          className="menu-icon-btn"
          id="menuToggleBtn"
          title="Toggle Sidebar"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSidebar();
          }}
        >
          ☰
        </button>
        <h1 className="page-title" id="topPageTitle">
          {TAB_TITLES[activeTab] || 'Portfolio'}
        </h1>
      </div>

      <div className="top-right">
        {/* Functional Live Search */}
        <div className="search-container" ref={searchContainerRef}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search Engine (e.g. 34, 1, alert)..."
              id="fleetSearchInput"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  setIsSearchOpen(true);
                }
              }}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                id="clearSearchBtn"
                title="Clear search"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {isSearchOpen && (
            <div className="search-results-dropdown" style={{ display: 'block' }}>
              {searchResults.length === 0 ? (
                <div className="search-no-results">
                  No engine units matching "<strong>{searchQuery}</strong>"
                </div>
              ) : (
                searchResults.map((m) => {
                  const statusLabel = m.isCritical
                    ? 'CRITICAL RISK'
                    : m.isWarning
                    ? 'ELEVATED'
                    : 'NOMINAL';
                  const avatarBg = m.isCritical
                    ? '#FEE2E2'
                    : m.isWarning
                    ? '#FEE8D6'
                    : '#E0F2FE';
                  const avatarColor = m.isCritical
                    ? '#DC2626'
                    : m.isWarning
                    ? '#EA580C'
                    : '#0284C7';

                  return (
                    <div
                      key={m.unit_nr}
                      className="search-result-item"
                      onClick={() => {
                        onSelectEngine(m.unit_nr);
                        setIsSearchOpen(false);
                      }}
                    >
                      <div className="search-item-left">
                        <div
                          className="search-item-avatar"
                          style={{ background: avatarBg, color: avatarColor }}
                        >
                          #{m.unit_nr}
                        </div>
                        <div>
                          <div className="search-item-name">
                            Turbofan Engine #{m.unit_nr}
                          </div>
                          <div className="search-item-meta">
                            {m.isCritical ? 'RUL ≤ 20 cyc' : 'In-Service Flight'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`pill-badge ${m.isCritical ? 'pill-rose' : 'pill-white'}`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Ingest / Add Engine Telemetry Button */}
        <button
          className="icon-circle-btn"
          id="addEngineBtn"
          title="Ingest / Add Engine Telemetry"
          onClick={onOpenAddModal}
        >
          +
        </button>

        {/* Notifications Dropdown */}
        <div className="notification-container" ref={notifContainerRef}>
          <button
            className="icon-circle-btn notification-btn"
            id="notificationBtn"
            title="Fleet Alerts"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotifOpen((prev) => !prev);
              setIsSearchOpen(false);
            }}
          >
            🔔
            {notifications.length > 0 && (
              <span className="notification-badge" id="notifBadge">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="notification-dropdown" style={{ display: 'block' }}>
              <div className="notif-header">
                <h3>Fleet Diagnostic Alerts</h3>
                <span
                  className="notif-count"
                  id="notifCountText"
                  style={
                    notifications.length === 0
                      ? { background: '#E2E8F0', color: '#64748B' }
                      : {}
                  }
                >
                  {notifications.length} Active
                </span>
              </div>

              <div className="notif-list" id="notifList">
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 18px',
                      textAlign: 'center',
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                    }}
                  >
                    ✅ All alerts acknowledged. Fleet telemetry nominal.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${notif.type}`}
                      onClick={() => {
                        onSelectEngine(notif.unit);
                        setIsNotifOpen(false);
                      }}
                    >
                      <div
                        className={`notif-dot ${
                          notif.type === 'critical'
                            ? 'red'
                            : notif.type === 'warning'
                            ? 'orange'
                            : 'blue'
                        }`}
                      />
                      <div className="notif-body">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-text">{notif.text}</div>
                        <div className="notif-time">{notif.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notif-footer">
                  <button
                    className="clear-notif-btn"
                    id="clearNotifBtn"
                    onClick={() => {
                      onClearNotifications();
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Fleet Avatar */}
        <div className="user-badge" title="NASA C-MAPSS FD001 Fleet">
          <div className="avatar-pink">NASA</div>
          <span className="user-name">FD001 Fleet</span>
        </div>
      </div>
    </header>
  );
};
