import React from 'react';

export const ClustersTab: React.FC = () => {
  return (
    <section id="tab-clusters" className="tab-pane active">
      <div className="board-card full-width-board">
        <div className="section-header">
          <h2>Unsupervised Operating Regimes & PCA</h2>
          <p>
            Latent machine wear state discovery using K-Means clustering and 2D
            Principal Component Analysis.
          </p>
        </div>

        <div className="stats-row" style={{ marginBottom: '24px' }}>
          <div className="stat-item">
            <span className="stat-num">3</span>
            <span className="stat-label">Optimal Clusters (k)</span>
          </div>
          <span className="dot-separator">•</span>
          <div className="stat-item">
            <span className="stat-num">0.1415</span>
            <span className="stat-label">Silhouette Score</span>
          </div>
          <span className="dot-separator">•</span>
          <div className="stat-item">
            <span className="stat-num">74.2%</span>
            <span className="stat-label">2D PCA Variance Explained</span>
          </div>
        </div>

        <div className="two-chart-row">
          <div className="figure-container">
            <h3>Elbow Method & Silhouette Curve</h3>
            <img
              src="/figures/clustering_elbow_silhouette.png"
              alt="Elbow and Silhouette Curve"
              className="figure-img"
            />
          </div>
          <div className="figure-container">
            <h3>PCA 2D Manifold: Clusters vs True RUL</h3>
            <img
              src="/figures/clustering_pca_visualization.png"
              alt="PCA 2D Cluster Visualization"
              className="figure-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
