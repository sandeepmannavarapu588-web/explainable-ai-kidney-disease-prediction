import React, { useState, useMemo } from 'react';
import { PatientBiomarkers } from '../types/ckd';
import { SYNTHETIC_POPULATION, runEnsemblePrediction } from '../services/ckdEnsembleEngine';
import { Search, Download, ArrowRight, Filter, Users } from 'lucide-react';

interface CohortScreenerProps {
  onSelectPatient: (patient: PatientBiomarkers) => void;
  activePatientId: string;
}

export const CohortScreener: React.FC<CohortScreenerProps> = ({
  onSelectPatient,
  activePatientId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');

  // Compute ensemble prediction for each patient in the synthetic population
  const cohortData = useMemo(() => {
    return SYNTHETIC_POPULATION.map((p) => {
      const pred = runEnsemblePrediction(p);
      return {
        patient: p,
        prediction: pred,
      };
    });
  }, []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return cohortData.filter((item) => {
      const p = item.patient;
      const kdigoLevel = item.prediction.kdigo.riskLevel;

      // Search match
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Risk filter
      if (riskFilter === 'all') return true;
      if (riskFilter === 'high') return kdigoLevel === 'high' || kdigoLevel === 'very_high';
      if (riskFilter === 'moderate') return kdigoLevel === 'moderate';
      if (riskFilter === 'low') return kdigoLevel === 'low';
      return true;
    });
  }, [cohortData, searchQuery, riskFilter]);

  // Aggregate stats
  const totalCount = cohortData.length;
  const highRiskCount = cohortData.filter(
    (d) => d.prediction.kdigo.riskLevel === 'high' || d.prediction.kdigo.riskLevel === 'very_high'
  ).length;
  const avgEgfr = Math.round(
    cohortData.reduce((acc, d) => acc + d.patient.egfr, 0) / totalCount
  );

  // CSV Export handler
  const handleExportCsv = () => {
    const headers = [
      'Patient ID',
      'Name',
      'Age',
      'Sex',
      'eGFR (mL/min)',
      'Serum Creatinine (mg/dL)',
      'ACR (mg/g)',
      'Systolic BP',
      'HbA1c',
      'CKD Probability (%)',
      'KDIGO GFR Stage',
      'KDIGO ACR Stage',
      'Risk Classification',
    ];

    const rows = filteredData.map((d) => [
      d.patient.id,
      `"${d.patient.name}"`,
      d.patient.age,
      d.patient.sex,
      d.patient.egfr,
      d.patient.serumCreatinine,
      d.patient.acr,
      d.patient.systolicBp,
      d.patient.hba1c,
      (d.prediction.overallProbability * 100).toFixed(1),
      d.prediction.kdigo.gfrStage,
      d.prediction.kdigo.acrStage,
      `"${d.prediction.kdigo.riskLabel}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CKD_Cohort_Screening_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Aggregate Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-800 mb-1">
              <span>Population Health Analytics</span>
              <span aria-hidden="true">·</span>
              <span>Primary Care &amp; Nephrology Triage</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Batch Cohort Screener &amp; Early Triage
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Screen multi-patient clinical batches across primary care registries to identify silent
              microalbuminuria, masked hypertension, and high-risk trajectories before GFR deteriorates.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Filtered CSV</span>
          </button>
        </div>

        {/* Aggregated KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Patients in Registry</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{totalCount}</div>
            <span className="text-[10px] text-slate-400 font-mono">100% evaluated</span>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-100">
            <span className="text-xs text-rose-800 font-medium">High / Urgent Triage</span>
            <div className="text-2xl font-bold font-mono text-rose-950 mt-0.5">
              {highRiskCount}{' '}
              <span className="text-xs font-normal text-rose-700 font-sans">
                ({((highRiskCount / totalCount) * 100).toFixed(0)}%)
              </span>
            </div>
            <span className="text-[10px] text-rose-700 font-mono">KDIGO Orange / Red</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Cohort Median eGFR</span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
              {avgEgfr}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">mL/min</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">CKD-EPI 2021</span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100">
            <span className="text-xs text-amber-800 font-medium">Microalbuminuria Rate</span>
            <div className="text-2xl font-bold font-mono text-amber-950 mt-0.5">
              {(
                (cohortData.filter((d) => d.patient.acr >= 30).length / totalCount) *
                100
              ).toFixed(0)}
              %
            </div>
            <span className="text-[10px] text-amber-700 font-mono">ACR ≥ 30 mg/g</span>
          </div>
        </div>
      </div>

      {/* Cohort Table & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, ID, or clinical profile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-500 font-medium mr-1 whitespace-nowrap">Filter:</span>
            {[
              { id: 'all', label: 'All Patients' },
              { id: 'high', label: 'High / Very High' },
              { id: 'moderate', label: 'Moderate' },
              { id: 'low', label: 'Low Risk' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRiskFilter(f.id as never)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  riskFilter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Age / Sex</th>
                <th className="py-2.5 px-3 text-right">eGFR</th>
                <th className="py-2.5 px-3 text-right">Creatinine</th>
                <th className="py-2.5 px-3 text-right">ACR</th>
                <th className="py-2.5 px-3 text-right">BP</th>
                <th className="py-2.5 px-3">KDIGO Staging</th>
                <th className="py-2.5 px-3 text-right">Ensemble Risk</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map(({ patient, prediction }) => {
                const isSelected = patient.id === activePatientId;
                const risk = prediction.kdigo.riskLevel;
                const probPct = (prediction.overallProbability * 100).toFixed(1);

                return (
                  <tr
                    key={patient.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-cyan-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{patient.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{patient.id}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {patient.age}y / {patient.sex === 'female' ? 'F' : 'M'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {patient.egfr}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {patient.serumCreatinine.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={
                          patient.acr >= 300
                            ? 'text-rose-700 font-bold'
                            : patient.acr >= 30
                            ? 'text-amber-700 font-semibold'
                            : 'text-slate-600'
                        }
                      >
                        {patient.acr}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {patient.systolicBp}/{patient.diastolicBp}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-800">
                        {prediction.kdigo.gfrStage} · {prediction.kdigo.acrStage}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          risk === 'very_high'
                            ? 'text-rose-700'
                            : risk === 'high'
                            ? 'text-orange-700'
                            : risk === 'moderate'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {prediction.kdigo.riskLabel.split('(')[0]}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          prediction.overallProbability >= 0.5 ? 'text-rose-600' : 'text-emerald-600'
                        }
                      >
                        {probPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className={`py-1 px-2.5 text-xs font-semibold rounded-md transition-colors ${
                          isSelected
                            ? 'bg-cyan-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Loaded' : 'Assess'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
