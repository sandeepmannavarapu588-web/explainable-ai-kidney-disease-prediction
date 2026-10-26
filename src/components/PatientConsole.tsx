import React, { useState, useEffect } from 'react';
import {
  PatientBiomarkers,
  BiologicalSex,
} from '../types/ckd';
import { calculateEgfr, CLINICAL_PRESETS } from '../services/ckdEnsembleEngine';
import { Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PatientConsoleProps {
  patient: PatientBiomarkers;
  onChangePatient: (updated: PatientBiomarkers) => void;
  onRunPrediction: () => void;
  isCalculating: boolean;
}

export const PatientConsole: React.FC<PatientConsoleProps> = ({
  patient,
  onChangePatient,
  onRunPrediction,
  isCalculating,
}) => {
  const [activeCategory, setActiveCategory] = useState<'renal' | 'urine' | 'metabolic' | 'history'>('renal');

  // Auto-update eGFR when creatinine, age, or sex changes
  useEffect(() => {
    const computedEgfr = calculateEgfr(patient.serumCreatinine, patient.age, patient.sex);
    if (computedEgfr !== patient.egfr) {
      onChangePatient({
        ...patient,
        egfr: computedEgfr,
      });
    }
  }, [patient.serumCreatinine, patient.age, patient.sex]);

  const handlePresetSelect = (presetId: string) => {
    const found = CLINICAL_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChangePatient({ ...found });
    }
  };

  const updateField = <K extends keyof PatientBiomarkers>(key: K, val: PatientBiomarkers[K]) => {
    onChangePatient({
      ...patient,
      [key]: val,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Console Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Patient Biomarker Console
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Subject ID: {patient.id}</span>
            <span aria-hidden="true">·</span>
            <span>{patient.name}</span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="preset-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
            Cohort Presets:
          </label>
          <select
            id="preset-select"
            value={patient.id}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all cursor-pointer shadow-xs"
          >
            {CLINICAL_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.id}: {preset.name.split('(')[0].trim()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-Time eGFR Ribbon */}
      <div className="px-5 py-3 bg-cyan-50/60 border-b border-cyan-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-cyan-950">2021 CKD-EPI Creatinine eGFR:</span>
          <span className="text-base font-bold font-mono text-cyan-900 tabular-nums">
            {patient.egfr}
            <span className="text-xs font-normal text-cyan-700 ml-1">mL/min/1.73m²</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">
            {patient.egfr >= 90
              ? 'Stage G1 (Normal/High)'
              : patient.egfr >= 60
              ? 'Stage G2 (Mild decrease)'
              : patient.egfr >= 45
              ? 'Stage G3a (Mild-Moderate)'
              : patient.egfr >= 30
              ? 'Stage G3b (Moderate-Severe)'
              : patient.egfr >= 15
              ? 'Stage G4 (Severe decrease)'
              : 'Stage G5 (Kidney failure)'}
          </span>
        </div>
        <div className="text-cyan-800 text-[11px] font-mono">Race-Free NKF/ASN Standardized</div>
      </div>

      {/* Segmented Category Filter Navigation (Compliant interactive tabs) */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('renal')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'renal'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Renal Function &amp; Vitals
        </button>
        <button
          onClick={() => setActiveCategory('urine')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'urine'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Urinalysis &amp; Proteinuria
        </button>
        <button
          onClick={() => setActiveCategory('metabolic')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'metabolic'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Metabolic &amp; Electrolytes
        </button>
        <button
          onClick={() => setActiveCategory('history')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeCategory === 'history'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hematology &amp; Comorbidities
        </button>
      </div>

      {/* Parameter Fields Grid */}
      <div className="p-5">
        {activeCategory === 'renal' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Age */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Patient Age</label>
                <span className="text-xs font-mono tabular-nums text-slate-500">{patient.age} yrs</span>
              </div>
              <input
                type="range"
                min="18"
                max="95"
                value={patient.age}
                onChange={(e) => updateField('age', Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>18</span>
                <span>60</span>
                <span>95</span>
              </div>
            </div>

            {/* Biological Sex */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Biological Sex</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateField('sex', 'male')}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    patient.sex === 'male'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => updateField('sex', 'female')}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    patient.sex === 'female'
                      ? 'border-cyan-600 bg-cyan-50 text-cyan-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Female
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Determines kappa/alpha in 2021 CKD-EPI</span>
            </div>

            {/* Serum Creatinine */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Serum Creatinine (Scr)</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {patient.serumCreatinine.toFixed(2)} mg/dL
                </span>
              </div>
              <input
                type="number"
                step="0.05"
                min="0.3"
                max="10.0"
                value={patient.serumCreatinine}
                onChange={(e) => updateField('serumCreatinine', Math.max(0.2, Number(e.target.value)))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Reference: 0.60 – 1.20 mg/dL</span>
            </div>

            {/* BUN */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Blood Urea Nitrogen (BUN)</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {patient.bun} mg/dL
                </span>
              </div>
              <input
                type="number"
                step="1"
                min="5"
                max="120"
                value={patient.bun}
                onChange={(e) => updateField('bun', Number(e.target.value))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Reference: 7 – 20 mg/dL</span>
            </div>

            {/* Systolic Blood Pressure */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Systolic Blood Pressure</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {patient.systolicBp} mmHg
                </span>
              </div>
              <input
                type="range"
                min="90"
                max="210"
                step="2"
                value={patient.systolicBp}
                onChange={(e) => updateField('systolicBp', Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>90</span>
                <span className="text-emerald-600 font-semibold">&lt;120 (KDIGO)</span>
                <span>210</span>
              </div>
            </div>

            {/* Diastolic Blood Pressure */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Diastolic Blood Pressure</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {patient.diastolicBp} mmHg
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="130"
                step="2"
                value={patient.diastolicBp}
                onChange={(e) => updateField('diastolicBp', Number(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>50</span>
                <span>80</span>
                <span>130</span>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'urine' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Albumin-to-Creatinine Ratio (ACR) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Urine ACR (Spot Ratio)</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {patient.acr} mg/g
                </span>
              </div>
              <input
                type="number"
                min="2"
                max="3000"
                value={patient.acr}
                onChange={(e) => updateField('acr', Math.max(1, Number(e.target.value)))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                <span>Category:</span>
                <span className="font-semibold text-slate-800">
                  {patient.acr < 30 ? 'A1 (<30 Normal)' : patient.acr <= 300 ? 'A2 (30–300 Micro)' : 'A3 (>300 Macro)'}
                </span>
              </div>
            </div>

            {/* Urine Albumin Dipstick */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Urinary Albumin (Dipstick)</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  Grade {patient.urineAlbumin}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => updateField('urineAlbumin', grade)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      patient.urineAlbumin === grade
                        ? 'border-cyan-600 bg-cyan-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {grade === 0 ? 'Neg' : `+${grade}`}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">0 = Negative, +1 = 30mg, +4 = &gt;1000mg</span>
            </div>

            {/* Urine Specific Gravity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Urine Specific Gravity</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {patient.specificGravity.toFixed(3)}
                </span>
              </div>
              <input
                type="number"
                step="0.001"
                min="1.000"
                max="1.040"
                value={patient.specificGravity}
                onChange={(e) => updateField('specificGravity', Number(e.target.value))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Isosthenuria (1.010) indicates tubular loss</span>
            </div>
          </div>
        )}

        {activeCategory === 'metabolic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* HbA1c */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">HbA1c</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">{patient.hba1c}%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="4.0"
                max="16.0"
                value={patient.hba1c}
                onChange={(e) => updateField('hba1c', Number(e.target.value))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">&lt;5.7% Normal · ≥6.5% Diabetes</span>
            </div>

            {/* Fasting Glucose */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Fasting Blood Glucose</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">{patient.bloodGlucose} mg/dL</span>
              </div>
              <input
                type="number"
                step="1"
                min="50"
                max="400"
                value={patient.bloodGlucose}
                onChange={(e) => updateField('bloodGlucose', Number(e.target.value))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Reference: 70 – 99 mg/dL</span>
            </div>

            {/* Serum Sodium */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Serum Sodium (Na+)</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">{patient.sodium} mEq/L</span>
              </div>
              <input
                type="number"
                step="0.5"
                min="115"
                max="160"
                value={patient.sodium}
                onChange={(e) => updateField('sodium', Number(e.target.value))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Reference: 135 – 145 mEq/L</span>
            </div>

            {/* Serum Potassium */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">Serum Potassium (K+)</label>
                <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">{patient.potassium} mEq/L</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="2.5"
                max="7.5"
                value={patient.potassium}
                onChange={(e) => updateField('potassium', Number(e.target.value))}
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Reference: 3.5 – 5.0 mEq/L</span>
            </div>
          </div>
        )}

        {activeCategory === 'history' && (
          <div className="space-y-5">
            {/* Blood panel numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Hemoglobin (Hb)</label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="20"
                  value={patient.hemoglobin}
                  onChange={(e) => updateField('hemoglobin', Number(e.target.value))}
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Normal: 12.0 – 17.0 g/dL</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Packed Cell Volume (PCV %)</label>
                <input
                  type="number"
                  step="1"
                  min="15"
                  max="60"
                  value={patient.pcv}
                  onChange={(e) => updateField('pcv', Number(e.target.value))}
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Normal: 36% – 50%</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">White Blood Cells (WBC)</label>
                <input
                  type="number"
                  step="100"
                  min="2000"
                  max="25000"
                  value={patient.wbc}
                  onChange={(e) => updateField('wbc', Number(e.target.value))}
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Normal: 4,000 – 11,000 /µL</span>
              </div>
            </div>

            {/* Comorbidity Toggles */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-2">Comorbid Diagnoses &amp; Clinical Findings</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { key: 'hypertension', label: 'Hypertension' },
                  { key: 'diabetes', label: 'Diabetes' },
                  { key: 'coronaryArteryDisease', label: 'CAD' },
                  { key: 'pedalEdema', label: 'Pedal Edema' },
                  { key: 'anemia', label: 'Anemia' },
                  { key: 'smoking', label: 'Smoker' },
                ].map((item) => {
                  const active = Boolean(patient[item.key as keyof PatientBiomarkers]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateField(item.key as keyof PatientBiomarkers, !active as never)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        active
                          ? 'border-cyan-600 bg-cyan-50/70 text-cyan-950 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {active ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {patient.notes || 'Cohort characteristics loaded. Adjust parameters to test real-time response.'}
          </p>

          <button
            type="button"
            onClick={onRunPrediction}
            disabled={isCalculating}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-cyan-700 hover:bg-cyan-800 active:scale-98 disabled:opacity-50 rounded-lg transition-all shadow-sm whitespace-nowrap"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Computing Ensemble...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Run Stacking Ensemble Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
