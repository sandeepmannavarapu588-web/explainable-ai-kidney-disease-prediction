import React from 'react';
import {
  KdigoClassification,
  KdigoGfrCategory,
  KdigoAcrCategory,
  ModelOutput,
} from '../types/ckd';
import { ArrowRight, AlertTriangle, CheckCircle, ShieldAlert, Sliders } from 'lucide-react';

interface PredictionResultsProps {
  probability: number;
  confidence: number;
  kdigo: KdigoClassification;
  models: {
    xgboost: ModelOutput;
    lightgbm: ModelOutput;
    catboost: ModelOutput;
    randomForest: ModelOutput;
    stackingMeta: ModelOutput;
  };
  onViewShap: () => void;
  onViewCounterfactual: () => void;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({
  probability,
  confidence,
  kdigo,
  models,
  onViewShap,
  onViewCounterfactual,
}) => {
  const isHighRisk = probability >= 0.5;
  const pct = Math.round(probability * 1000) / 10;

  // KDIGO Grid definition
  const gfrStages: { key: KdigoGfrCategory; label: string; range: string }[] = [
    { key: 'G1', label: 'G1 Normal/High', range: '≥90' },
    { key: 'G2', label: 'G2 Mild decrease', range: '60–89' },
    { key: 'G3a', label: 'G3a Mild-Mod', range: '45–59' },
    { key: 'G3b', label: 'G3b Mod-Severe', range: '30–44' },
    { key: 'G4', label: 'G4 Severe decrease', range: '15–29' },
    { key: 'G5', label: 'G5 Kidney failure', range: '<15' },
  ];

  const acrStages: { key: KdigoAcrCategory; label: string; range: string }[] = [
    { key: 'A1', label: 'A1 Normal', range: '<30 mg/g' },
    { key: 'A2', label: 'A2 Microalbuminuria', range: '30–300 mg/g' },
    { key: 'A3', label: 'A3 Macroalbuminuria', range: '>300 mg/g' },
  ];

  // Helper for KDIGO cell background color
  const getCellColor = (gfr: KdigoGfrCategory, acr: KdigoAcrCategory) => {
    if (gfr === 'G1' || gfr === 'G2') {
      if (acr === 'A1') return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      if (acr === 'A2') return 'bg-amber-100 text-amber-900 border-amber-300';
      return 'bg-orange-100 text-orange-900 border-orange-300';
    }
    if (gfr === 'G3a') {
      if (acr === 'A1') return 'bg-amber-100 text-amber-900 border-amber-300';
      if (acr === 'A2') return 'bg-orange-100 text-orange-900 border-orange-300';
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (gfr === 'G3b') {
      if (acr === 'A1') return 'bg-orange-100 text-orange-900 border-orange-300';
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    // G4 & G5
    return 'bg-rose-200 text-rose-950 border-rose-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Primary Ensemble Output Card */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                Stacking Meta-Ensemble
              </span>
              <h3 className="text-lg font-bold text-slate-900">CKD Probability Score</h3>
            </div>
            {isHighRisk ? (
              <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Elevated Risk</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Low Risk</span>
              </div>
            )}
          </div>

          <div className="py-6 flex items-baseline gap-3">
            <span
              className={`text-5xl font-extrabold font-mono tabular-nums tracking-tight ${
                isHighRisk ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {pct.toFixed(1)}%
            </span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-700">
                {isHighRisk ? 'Positive for CKD / Rapid Decline Risk' : 'Negative for Active CKD Decline'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Model Certainty: {(confidence * 100).toFixed(0)}% · Super Learner
              </p>
            </div>
          </div>

          {/* Progress gauge bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative mb-4">
            <div
              className={`h-full transition-all duration-700 ${
                pct < 30 ? 'bg-emerald-500' : pct < 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${pct}%` }}
            />
            {/* 50% clinical decision boundary marker */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-900/60" title="Diagnostic Threshold 50%" />
          </div>

          {/* KDIGO Staging summary */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">KDIGO 2024 Category:</span>
              <span className="font-bold text-slate-900 font-mono">
                {kdigo.gfrStage} / {kdigo.acrStage}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Risk Stratum:</span>
              <span
                className={`font-semibold ${
                  kdigo.riskLevel === 'very_high'
                    ? 'text-rose-700'
                    : kdigo.riskLevel === 'high'
                    ? 'text-orange-700'
                    : kdigo.riskLevel === 'moderate'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {kdigo.riskLabel}
              </span>
            </div>
            <div className="flex items-start justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Monitoring Cadence:</span>
              <span className="text-right text-slate-700 max-w-[210px]">{kdigo.monitoringInterval}</span>
            </div>
          </div>
        </div>

        {/* CTA links */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onViewShap}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-cyan-900 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
          >
            <span>Explain with SHAP</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-700" />
          </button>
          <button
            onClick={onViewCounterfactual}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Simulate What-If</span>
          </button>
        </div>
      </div>

      {/* KDIGO 2D Risk Stratification Matrix */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              KDIGO 2024 Prognosis Grid (eGFR × Albuminuria)
            </h3>
            <p className="text-xs text-slate-500">
              Cross-classification for risk of CKD progression, cardiovascular events, and kidney failure.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Active: {kdigo.gfrStage} × {kdigo.acrStage}
          </span>
        </div>

        {/* The Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-400 font-mono font-normal">GFR Category</th>
                {acrStages.map((acr) => (
                  <th key={acr.key} className="p-2 text-center font-semibold text-slate-700 bg-slate-50 border-b border-slate-200">
                    <div>{acr.key}</div>
                    <div className="text-[10px] font-normal text-slate-500 font-mono">{acr.range}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gfrStages.map((gfr) => (
                <tr key={gfr.key}>
                  <td className="p-2 font-medium text-slate-800 border-r border-slate-200 bg-slate-50/60 whitespace-nowrap">
                    <span className="font-bold">{gfr.key}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({gfr.range})</span>
                  </td>
                  {acrStages.map((acr) => {
                    const isCurrentPatient = kdigo.gfrStage === gfr.key && kdigo.acrStage === acr.key;
                    const cellColorClass = getCellColor(gfr.key, acr.key);

                    return (
                      <td
                        key={`${gfr.key}-${acr.key}`}
                        className={`p-2.5 text-center transition-all border ${cellColorClass} ${
                          isCurrentPatient
                            ? 'ring-2 ring-slate-950 font-bold shadow-md scale-98 relative z-10'
                            : 'opacity-85'
                        }`}
                      >
                        {isCurrentPatient ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-900" />
                            <span className="font-mono text-xs">Patient</span>
                          </div>
                        ) : (
                          <span className="text-[11px] opacity-70">
                            {gfr.key === 'G1' && acr.key === 'A1'
                              ? 'Low'
                              : gfr.key === 'G5' || acr.key === 'A3'
                              ? 'Very High'
                              : 'Risk Tier'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Base Model Consensus Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 block mb-2.5">
            Base Model Consensus &amp; Meta-Stacking Weights:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              models.xgboost,
              models.lightgbm,
              models.catboost,
              models.randomForest,
            ].map((m) => (
              <div key={m.modelId} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/80">
                <div className="flex justify-between items-center text-[11px] text-slate-500 mb-0.5">
                  <span className="font-medium text-slate-700 truncate">{m.modelId.toUpperCase()}</span>
                  <span className="font-mono text-[10px]">W: {(m.weightInStack * 100).toFixed(0)}%</span>
                </div>
                <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                  {(m.probability * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  AUC-ROC: {m.aucRoc.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
