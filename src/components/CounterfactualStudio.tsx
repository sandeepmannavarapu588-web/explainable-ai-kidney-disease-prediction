import React, { useState } from 'react';
import { PatientBiomarkers, CounterfactualParameters } from '../types/ckd';
import { simulateCounterfactual } from '../services/ckdEnsembleEngine';
import { Sliders, Sparkles, HeartPulse, Check, ArrowDown, Clock, ShieldCheck } from 'lucide-react';

interface CounterfactualStudioProps {
  patient: PatientBiomarkers;
}

export const CounterfactualStudio: React.FC<CounterfactualStudioProps> = ({ patient }) => {
  const [params, setParams] = useState<CounterfactualParameters>({
    systolicBpTarget: Math.min(patient.systolicBp, 120),
    hba1cTarget: Math.min(patient.hba1c, 6.5),
    acrReductionPct: 40,
    smokingCessation: true,
    sglt2Inhibitor: true,
    rasInhibitor: true,
  });

  const result = simulateCounterfactual(patient, params);

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-800 mb-1">
            <span>Counterfactual Clinical Simulator</span>
            <span aria-hidden="true">·</span>
            <span>Guideline-Directed Medical Therapy (GDMT)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Actionable What-If Therapy Optimization
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Simulates the expected trajectory shift under target hemodynamic control, glycemic optimization,
            and evidence-backed nephroprotective pharmacotherapies (SGLT2 inhibitors and RAS blockade).
          </p>
        </div>

        {/* Big Impact Comparison Banner */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Baseline Risk */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-xs font-mono text-slate-500 uppercase">Current Baseline Risk</span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 mt-1">
              {(result.baselineRisk * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Without targeted interventions</p>
          </div>

          {/* Projected Intervened Risk */}
          <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-900 uppercase font-semibold">
                Projected Post-Intervention
              </span>
              <span className="text-xs font-bold text-cyan-700 bg-white px-2 py-0.5 rounded-md shadow-xs">
                -{(result.relativeReduction).toFixed(0)}% Relative
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-cyan-950 mt-1">
              {(result.projectedRisk * 100).toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-xs text-cyan-800 font-medium mt-1">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Absolute Reduction: -{(result.absoluteReduction * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Kidney Longevity Preserved */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70">
            <span className="text-xs font-mono text-emerald-900 uppercase font-semibold">
              Dialysis-Free Years Gained
            </span>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-950 mt-1">
              +{result.estimatedYearsGained} yrs
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium mt-1">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{result.gfrPreservationRate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Applied Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Clinical Target Sliders
            </h3>
          </div>

          {/* SBP Target */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Target Systolic Blood Pressure</span>
              <span className="font-mono font-bold text-slate-900">
                {params.systolicBpTarget} mmHg{' '}
                <span className="text-slate-400 font-normal">(Current: {patient.systolicBp})</span>
              </span>
            </div>
            <input
              type="range"
              min="105"
              max={patient.systolicBp}
              step="1"
              value={params.systolicBpTarget}
              onChange={(e) =>
                setParams({ ...params, systolicBpTarget: Number(e.target.value) })
              }
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>105 mmHg</span>
              <span className="text-cyan-700 font-medium">KDIGO Guideline: &lt;120 mmHg</span>
              <span>{patient.systolicBp} mmHg</span>
            </div>
          </div>

          {/* HbA1c Target */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Target Glycated Hemoglobin (HbA1c)</span>
              <span className="font-mono font-bold text-slate-900">
                {params.hba1cTarget.toFixed(1)}%{' '}
                <span className="text-slate-400 font-normal">(Current: {patient.hba1c}%)</span>
              </span>
            </div>
            <input
              type="range"
              min="5.5"
              max={patient.hba1c}
              step="0.1"
              value={params.hba1cTarget}
              onChange={(e) =>
                setParams({ ...params, hba1cTarget: Number(e.target.value) })
              }
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>5.5%</span>
              <span className="text-cyan-700 font-medium">ADA/KDIGO Target: &lt;6.5% - 7.0%</span>
              <span>{patient.hba1c}%</span>
            </div>
          </div>

          {/* Albuminuria Reduction target */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">Projected Albuminuria (ACR) Reduction</span>
              <span className="font-mono font-bold text-slate-900">
                {params.acrReductionPct}% Reduction{' '}
                <span className="text-slate-400 font-normal">
                  ({Math.round(patient.acr * (1 - params.acrReductionPct / 100))} mg/g)
                </span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="75"
              step="5"
              value={params.acrReductionPct}
              onChange={(e) =>
                setParams({ ...params, acrReductionPct: Number(e.target.value) })
              }
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0% (No change)</span>
              <span>30% (Standard)</span>
              <span>75% (Intensive dual-blockade)</span>
            </div>
          </div>

          {/* Pharmacotherapy Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <span className="text-xs font-semibold text-slate-700 block">
              Nephroprotective Pharmacotherapy Options:
            </span>

            {/* SGLT2i */}
            <div
              onClick={() =>
                setParams({ ...params, sglt2Inhibitor: !params.sglt2Inhibitor })
              }
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                params.sglt2Inhibitor
                  ? 'border-cyan-600 bg-cyan-50/60 text-cyan-950 font-medium'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-sm mt-0.5 flex items-center justify-center shrink-0 ${
                  params.sglt2Inhibitor ? 'bg-cyan-700 text-white' : 'border border-slate-300'
                }`}
              >
                {params.sglt2Inhibitor && <Check className="w-3 h-3" />}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Prescribe SGLT2 Inhibitor (Dapagliflozin 10mg / Empagliflozin 10mg)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  DAPA-CKD / EMPA-KIDNEY trial evidence: reduces risk of sustained $\ge 50\%$ eGFR decline,
                  ESRD, or renal death by 37%.
                </p>
              </div>
            </div>

            {/* RAS Blockade */}
            <div
              onClick={() => setParams({ ...params, rasInhibitor: !params.rasInhibitor })}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                params.rasInhibitor
                  ? 'border-cyan-600 bg-cyan-50/60 text-cyan-950 font-medium'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-sm mt-0.5 flex items-center justify-center shrink-0 ${
                  params.rasInhibitor ? 'bg-cyan-700 text-white' : 'border border-slate-300'
                }`}
              >
                {params.rasInhibitor && <Check className="w-3 h-3" />}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Titrate RAS Inhibitor to Max Tolerated Dose (ACEi or ARB)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Reduces intraglomerular hydrostatic pressure via efferent arteriolar vasodilation.
                </p>
              </div>
            </div>

            {/* Smoking Cessation if smoker */}
            {patient.smoking && (
              <div
                onClick={() =>
                  setParams({ ...params, smokingCessation: !params.smokingCessation })
                }
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  params.smokingCessation
                    ? 'border-cyan-600 bg-cyan-50/60 text-cyan-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-sm mt-0.5 flex items-center justify-center shrink-0 ${
                    params.smokingCessation ? 'bg-cyan-700 text-white' : 'border border-slate-300'
                  }`}
                >
                  {params.smokingCessation && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Structured Smoking Cessation Program</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Eliminates nicotine-induced sympathetic renal vasoconstriction and oxidative endothelial injury.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applied Interventions & Pathophysiology Blueprint */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Applied Counterfactual Bundle
              </h3>
            </div>

            <div className="space-y-2 mb-5">
              {result.interventionsApplied.length > 0 ? (
                result.interventionsApplied.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs flex items-center gap-2 text-emerald-900"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No interventions applied yet.</p>
              )}
            </div>

            {/* Renal Anatomy Illustration Cross-Reference */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src="/src/assets/images/kidney_cortex_pathology_1793015066290.jpg"
                alt="Kidney cortex nephron pathology cross section"
                referrerPolicy="no-referrer"
                className="w-full h-40 object-cover"
              />
              <div className="p-3 bg-white text-[11px] text-slate-600">
                <span className="font-semibold text-slate-900 block mb-0.5">
                  Nephron Preservation Mechanism
                </span>
                Targeting systolic BP &lt;120 mmHg plus SGLT2i restores tubuloglomerular feedback,
                diminishing single-nephron hyperfiltration in remaining healthy glomeruli.
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setParams({
                  systolicBpTarget: Math.min(patient.systolicBp, 120),
                  hba1cTarget: Math.min(patient.hba1c, 6.5),
                  acrReductionPct: 40,
                  smokingCessation: true,
                  sglt2Inhibitor: true,
                  rasInhibitor: true,
                });
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Reset to Optimal GDMT Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
