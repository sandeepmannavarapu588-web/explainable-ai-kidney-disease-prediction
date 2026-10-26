import React from 'react';
import {
  PatientBiomarkers,
  KdigoClassification,
  ModelOutput,
  ShapFeatureContribution,
  ClinicalRecommendation,
} from '../types/ckd';
import { X, Printer, Download, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientBiomarkers;
  prediction: {
    overallProbability: number;
    confidence: number;
    kdigo: KdigoClassification;
    models: {
      xgboost: ModelOutput;
      lightgbm: ModelOutput;
      catboost: ModelOutput;
      randomForest: ModelOutput;
      stackingMeta: ModelOutput;
    };
    shap: {
      baseValue: number;
      contributions: ShapFeatureContribution[];
    };
    recommendations: ClinicalRecommendation[];
  };
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  prediction,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isHighRisk = prediction.overallProbability >= 0.5;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            <span className="text-sm font-bold text-slate-900">
              Nephrological Decision Support Report
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-900 font-sans print:p-0">
          {/* Institution & Title Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Clinical Nephrology &amp; Explainable AI Assessment
              </p>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Chronic Kidney Disease Stacking Ensemble Report
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Conducted according to KDIGO 2024 Clinical Practice Guidelines &amp; 2021 CKD-EPI Formula
              </p>
            </div>
            <div className="text-right text-xs font-mono text-slate-500">
              <p>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              <p>Protocol: ENSEMBLE-STCK-XAI-v2.4</p>
            </div>
          </div>

          {/* Patient Demographic & Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block font-mono">Patient Name:</span>
              <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-mono">Subject ID:</span>
              <span className="font-mono font-bold text-slate-900">{patient.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-mono">Age / Sex:</span>
              <span className="font-bold text-slate-900 font-mono">
                {patient.age} yrs / {patient.sex.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-mono">Blood Pressure:</span>
              <span className="font-bold text-slate-900 font-mono">
                {patient.systolicBp}/{patient.diastolicBp} mmHg
              </span>
            </div>
          </div>

          {/* Core Diagnostic Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs font-mono text-slate-500 uppercase">Ensemble Risk Score</span>
              <div
                className={`text-3xl font-extrabold font-mono mt-1 ${
                  isHighRisk ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {(prediction.overallProbability * 100).toFixed(1)}%
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {isHighRisk ? 'Positive (High Progression Risk)' : 'Negative (Nominal / Preserved)'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs font-mono text-slate-500 uppercase">KDIGO Stage (GFR × ACR)</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
                {prediction.kdigo.gfrStage} / {prediction.kdigo.acrStage}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                eGFR: {patient.egfr} mL/min · ACR: {patient.acr} mg/g
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs font-mono text-slate-500 uppercase">Stratified Risk Tier</span>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {prediction.kdigo.riskLabel}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cadence: {prediction.kdigo.monitoringInterval}
              </p>
            </div>
          </div>

          {/* Model Consensus Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              Ensemble Sub-Model Probabilities
            </h3>
            <div className="grid grid-cols-4 gap-3 text-xs font-mono text-center">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[10px]">XGBoost (34%)</span>
                <span className="font-bold text-slate-900">
                  {(prediction.models.xgboost.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[10px]">LightGBM (28%)</span>
                <span className="font-bold text-slate-900">
                  {(prediction.models.lightgbm.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[10px]">CatBoost (24%)</span>
                <span className="font-bold text-slate-900">
                  {(prediction.models.catboost.probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[10px]">Random Forest (14%)</span>
                <span className="font-bold text-slate-900">
                  {(prediction.models.randomForest.probability * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Top SHAP Drivers */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              Local SHAP Attribution Breakdown
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {prediction.shap.contributions.slice(0, 5).map((c) => (
                <div key={String(c.featureKey)} className="p-3 flex items-center justify-between bg-white">
                  <div>
                    <span className="font-semibold text-slate-900">{c.label}</span>
                    <span className="text-slate-400 font-mono ml-2">({String(c.value)})</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.clinicalContext}</p>
                  </div>
                  <div className="text-right font-mono font-bold shrink-0 ml-4">
                    {c.phi >= 0 ? (
                      <span className="text-rose-600">+{(c.phi * 100).toFixed(1)}%</span>
                    ) : (
                      <span className="text-cyan-700">{(c.phi * 100).toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guideline-Directed Recommendations */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              KDIGO 2024 Clinical Action Pathway
            </h3>
            <div className="space-y-2">
              {prediction.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rec.title}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        rec.urgency === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : rec.urgency === 'priority'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rec.urgency}
                    </span>
                  </div>
                  <p className="text-slate-600">{rec.description}</p>
                  <p className="text-[10px] font-mono text-slate-400">{rec.guidelineEvidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinician Signature Strip */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <p className="text-slate-400">Attending Nephrologist / Physician:</p>
              <div className="mt-8 border-b border-slate-400" />
              <p className="mt-1 text-slate-600">MD Signature &amp; License Number</p>
            </div>
            <div>
              <p className="text-slate-400">Validation &amp; Co-Sign Date:</p>
              <div className="mt-8 border-b border-slate-400" />
              <p className="mt-1 text-slate-600">Electronic Health Record Verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
