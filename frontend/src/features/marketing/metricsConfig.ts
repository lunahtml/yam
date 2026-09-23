//frontend\src\features\marketing\metricsConfig.ts
export interface MetricConfig {
    key: string;
    label: string;
    formula: string;
    description: string;
    value: number;
    unit: string;
    thresholds: {
        bad: number;
        good: number;
    };
    higherIsBetter: boolean;
}

export interface MetricsGroup {
    title: string;
    icon: string;
    metrics: MetricConfig[];
}