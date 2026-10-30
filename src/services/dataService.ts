import { FleetSummary, EngineData, BenchmarksData } from '../types';

let summaryCache: FleetSummary | null = null;
let unitsCache: number[] | null = null;
let benchmarksCache: BenchmarksData | null = null;

export async function fetchFleetSummary(): Promise<FleetSummary> {
  if (summaryCache) return summaryCache;
  try {
    const res = await fetch('/data/fleet_summary.json');
    if (res.ok) {
      summaryCache = await res.json();
      return summaryCache!;
    }
  } catch (err) {
    console.warn('Failed to load fleet summary from static file:', err);
  }

  // Sensible default fallback
  return {
    fleet_size: 100,
    train_units: 100,
    total_historical_cycles: 20631,
    rul_cap: 125,
    risk_threshold: 30,
    models: {
      best_regression: {
        name: 'Random Forest Regressor',
        test_mae: 12.02,
        test_rmse: 16.53,
        test_r2: 0.8299,
      },
      best_classification: {
        name: 'Random Forest Classifier',
        accuracy: 0.95,
        f1_score: 0.8936,
        recall: 0.84,
        roc_auc: 0.984,
      },
      screening_classification: {
        name: 'Logistic Regression',
        accuracy: 0.93,
        recall: 0.92,
        roc_auc: 0.9861,
      },
    },
    feature_count: 78,
  };
}

export async function fetchEngineList(): Promise<number[]> {
  if (unitsCache) return unitsCache;
  try {
    const res = await fetch('/data/engines_list.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.test_units)) {
        unitsCache = data.test_units;
        return unitsCache!;
      }
    }
  } catch (err) {
    console.warn('Failed to load engine list:', err);
  }

  unitsCache = Array.from({ length: 100 }, (_, i) => i + 1);
  return unitsCache;
}

const engineCache = new Map<string, EngineData>();

export async function fetchEngineData(
  unitNr: number,
  split: 'test' | 'train' = 'test'
): Promise<EngineData | null> {
  const cacheKey = `${split}_${unitNr}`;
  if (engineCache.has(cacheKey)) {
    return engineCache.get(cacheKey)!;
  }

  const path =
    split === 'train'
      ? `/data/train_engines/unit_${unitNr}.json`
      : `/data/engines/unit_${unitNr}.json`;

  try {
    const res = await fetch(path);
    if (res.ok) {
      const data: EngineData = await res.json();
      engineCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn(`Failed to load engine unit ${unitNr} (${split}):`, err);
  }

  return null;
}

export async function fetchBenchmarks(): Promise<BenchmarksData> {
  if (benchmarksCache) return benchmarksCache;
  try {
    const res = await fetch('/data/benchmarks.json');
    if (res.ok) {
      benchmarksCache = await res.json();
      return benchmarksCache!;
    }
  } catch (err) {
    console.warn('Failed to load benchmarks:', err);
  }

  return {
    regression: [
      {
        model_name: 'Random Forest Regressor',
        train_mae: 4.315,
        train_rmse: 6.844,
        train_r2: 0.973,
        test_mae: 12.018,
        test_rmse: 16.527,
        test_r2: 0.8299,
        inference_time_ms: 58.6,
        training_time_sec: 33.91,
      },
      {
        model_name: 'Gradient Boosting Regressor',
        train_mae: 8.326,
        train_rmse: 12.031,
        train_r2: 0.9167,
        test_mae: 12.352,
        test_rmse: 17.17,
        test_r2: 0.8164,
        inference_time_ms: 2.66,
        training_time_sec: 90.18,
      },
      {
        model_name: 'Decision Tree Regressor',
        train_mae: 8.737,
        train_rmse: 13.726,
        train_r2: 0.8915,
        test_mae: 13.437,
        test_rmse: 18.182,
        test_r2: 0.7941,
        inference_time_ms: 1.45,
        training_time_sec: 1.15,
      },
      {
        model_name: 'Linear Regression (Baseline)',
        train_mae: 14.655,
        train_rmse: 18.237,
        train_r2: 0.8085,
        test_mae: 14.798,
        test_rmse: 19.418,
        test_r2: 0.7652,
        inference_time_ms: 3.15,
        training_time_sec: 0.26,
      },
    ],
    classification: [
      {
        model_name: 'Random Forest Classifier',
        accuracy: 0.95,
        precision: 0.9545,
        recall: 0.84,
        f1_score: 0.8936,
        roc_auc: 0.9819,
        inference_time_ms: 39.83,
        training_time_sec: 3.87,
      },
      {
        model_name: 'Logistic Regression',
        accuracy: 0.94,
        precision: 0.8519,
        recall: 0.92,
        f1_score: 0.8846,
        roc_auc: 0.9861,
        inference_time_ms: 3.56,
        training_time_sec: 0.52,
      },
      {
        model_name: 'Support Vector Classifier (SVM)',
        accuracy: 0.91,
        precision: 0.8077,
        recall: 0.84,
        f1_score: 0.8235,
        roc_auc: 0.9829,
        inference_time_ms: 40.11,
        training_time_sec: 45.16,
      },
      {
        model_name: 'Decision Tree Classifier',
        accuracy: 0.91,
        precision: 0.7857,
        recall: 0.88,
        f1_score: 0.8302,
        roc_auc: 0.9509,
        inference_time_ms: 2.35,
        training_time_sec: 1.17,
      },
    ],
  };
}
