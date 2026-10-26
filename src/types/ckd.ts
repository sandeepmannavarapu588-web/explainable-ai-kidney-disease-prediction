/**
 * Chronic Kidney Disease (CKD) Clinical Types & ML Schemas
 */

export type BiologicalSex = 'male' | 'female';

export interface PatientBiomarkers {
  id: string;
  name: string;
  age: number; // years
  sex: BiologicalSex;
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  serumCreatinine: number; // mg/dL
  bun: number; // Blood Urea Nitrogen, mg/dL
  egfr: number; // CKD-EPI 2021 mL/min/1.73m²
  urineAlbumin: number; // 0 to 4 (dipstick equivalent)
  acr: number; // Urine Albumin-to-Creatinine Ratio mg/g
  specificGravity: number; // 1.005 - 1.030
  bloodGlucose: number; // mg/dL fasting
  hba1c: number; // %
  sodium: number; // mEq/L
  potassium: number; // mEq/L
  hemoglobin: number; // g/dL
  pcv: number; // Packed Cell Volume %
  wbc: number; // /µL
  hypertension: boolean;
  diabetes: boolean;
  coronaryArteryDisease: boolean;
  pedalEdema: boolean;
  anemia: boolean;
  smoking: boolean;
  notes?: string;
}

export type KdigoGfrCategory = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
export type KdigoAcrCategory = 'A1' | 'A2' | 'A3';
export type KdigoRiskLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface KdigoClassification {
  gfrStage: KdigoGfrCategory;
  gfrDescription: string;
  acrStage: KdigoAcrCategory;
  acrDescription: string;
  riskLevel: KdigoRiskLevel;
  riskLabel: string;
  monitoringInterval: string;
}

export interface ModelOutput {
  modelId: 'xgboost' | 'lightgbm' | 'catboost' | 'random_forest' | 'stacking_meta';
  displayName: string;
  probability: number;
  confidence: number;
  weightInStack: number;
  architecture: string;
  aucRoc: number;
  f1Score: number;
  brierScore: number;
}

export interface ShapFeatureContribution {
  featureKey: keyof PatientBiomarkers | string;
  label: string;
  value: string | number | boolean;
  phi: number; // Shapley attribution value (+ increases CKD risk, - protects)
  relativeImportance: number; // percentage
  clinicalContext: string;
}

export interface WaterfallStep {
  featureKey: string;
  label: string;
  valueDisplay: string;
  delta: number;
  cumulative: number;
  direction: 'increase' | 'decrease';
}

export interface LimeRule {
  description: string;
  weight: number;
  isPositive: boolean;
}

export interface ClinicalRecommendation {
  category: 'pharmacotherapy' | 'lifestyle' | 'monitoring' | 'referral';
  title: string;
  description: string;
  guidelineEvidence: string;
  urgency: 'routine' | 'priority' | 'urgent';
}

export interface CounterfactualParameters {
  systolicBpTarget: number;
  hba1cTarget: number;
  acrReductionPct: number;
  smokingCessation: boolean;
  sglt2Inhibitor: boolean;
  rasInhibitor: boolean;
}

export interface CounterfactualResult {
  baselineRisk: number;
  projectedRisk: number;
  absoluteReduction: number;
  relativeReduction: number;
  gfrPreservationRate: string; // e.g. "Preserves ~2.1 mL/min/1.73m² per year"
  estimatedYearsGained: number; // Delay to G4/ESRD
  interventionsApplied: string[];
}

export interface BenchmarkMetrics {
  accuracy: number;
  aucRoc: number;
  precision: number;
  recall: number;
  f1Score: number;
  brierScore: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
}
