export interface FleetSummary {
  fleet_size: number;
  train_units: number;
  total_historical_cycles: number;
  rul_cap: number;
  risk_threshold: number;
  models: {
    best_regression: {
      name: string;
      test_mae: number;
      test_rmse: number;
      test_r2: number;
    };
    best_classification: {
      name: string;
      accuracy: number;
      f1_score: number;
      recall: number;
      roc_auc: number;
    };
    screening_classification?: {
      name: string;
      accuracy: number;
      recall: number;
      roc_auc: number;
    };
  };
  feature_count: number;
}

export interface SensorRecord {
  cycle: number;
  rul?: number | null;
  s_2: number;
  s_3: number;
  s_4: number;
  s_11: number;
  [key: string]: any;
}

export interface RiskClassification {
  predicted_class: number;
  label: string;
  probability: number;
  confidence_pct: number;
  threshold_cycles: number;
}

export interface PrognosticPrediction {
  unit_nr: number;
  cutoff_cycle: number;
  max_observed_cycle: number;
  is_final_cycle: boolean;
  predicted_rul: number;
  ground_truth_rul: number | null;
  prediction_error: number | null;
  health_margin_pct: number;
  risk_classification: RiskClassification;
}

export interface EngineData {
  unit_nr: number;
  total_cycles: number;
  max_cycle: number;
  records: SensorRecord[];
  predictions: Record<string, PrognosticPrediction>;
  split?: string;
}

export interface RegressionBenchmark {
  model_name: string;
  train_mae: number;
  train_rmse: number;
  train_r2: number;
  test_mae: number;
  test_rmse: number;
  test_r2: number;
  inference_time_ms: number;
  inference_per_sample_ms?: number;
  training_time_sec: number;
}

export interface ClassificationBenchmark {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  macro_f1?: number;
  roc_auc: number;
  tn?: number;
  fp?: number;
  fn?: number;
  tp?: number;
  inference_time_ms: number;
  training_time_sec: number;
}

export interface BenchmarksData {
  regression: RegressionBenchmark[];
  classification: ClassificationBenchmark[];
}

export type TabId =
  | 'tab-portfolio'
  | 'tab-telemetry'
  | 'tab-prognostics'
  | 'tab-risk'
  | 'tab-benchmarks'
  | 'tab-clusters'
  | 'tab-docs';

export interface NotificationItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  unit: number;
  title: string;
  text: string;
  time: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info';
}
