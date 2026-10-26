import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroOverview } from './components/HeroOverview';
import { PatientConsole } from './components/PatientConsole';
import { PredictionResults } from './components/PredictionResults';
import { ShapWaterfallView } from './components/ShapWaterfallView';
import { CounterfactualStudio } from './components/CounterfactualStudio';
import { ModelLab } from './components/ModelLab';
import { CohortScreener } from './components/CohortScreener';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { CLINICAL_PRESETS, runEnsemblePrediction } from './services/ckdEnsembleEngine';
import { PatientBiomarkers } from './types/ckd';

export default function App() {
  const [activeTab, setActiveTab] = useState<'prediction' | 'shap' | 'counterfactual' | 'models' | 'cohort'>(
    'prediction'
  );
  const [patient, setPatient] = useState<PatientBiomarkers>(CLINICAL_PRESETS[0]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Memoized prediction based on current patient state
  const prediction = useMemo(() => {
    return runEnsemblePrediction(patient);
  }, [patient]);

  const handleRunPrediction = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 350);
  };

  const handleSelectCohortPatient = (selected: PatientBiomarkers) => {
    setPatient(selected);
    setActiveTab('prediction');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500/20 selection:text-cyan-900">
      {/* 3-Zone Compliant Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <HeroOverview
          onStartAssessment={() => setActiveTab('prediction')}
          onExploreModels={() => setActiveTab('models')}
        />

        {/* Tab 1: Risk Assessment & Patient Console */}
        {activeTab === 'prediction' && (
          <div className="space-y-8">
            <PatientConsole
              patient={patient}
              onChangePatient={setPatient}
              onRunPrediction={handleRunPrediction}
              isCalculating={isCalculating}
            />

            <PredictionResults
              probability={prediction.overallProbability}
              confidence={prediction.confidence}
              kdigo={prediction.kdigo}
              models={prediction.models}
              onViewShap={() => setActiveTab('shap')}
              onViewCounterfactual={() => setActiveTab('counterfactual')}
            />
          </div>
        )}

        {/* Tab 2: SHAP Explainability & Waterfall */}
        {activeTab === 'shap' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Feature Attribution for {patient.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Subject {patient.id} · Stacking Meta-Prediction: {(prediction.overallProbability * 100).toFixed(1)}%
                </p>
              </div>
              <button
                onClick={() => setActiveTab('prediction')}
                className="text-xs text-cyan-700 hover:text-cyan-900 font-medium"
              >
                &larr; Back to Patient Inputs
              </button>
            </div>

            <ShapWaterfallView
              baseValue={prediction.shap.baseValue}
              finalValue={prediction.overallProbability}
              steps={prediction.shap.waterfallSteps}
              contributions={prediction.shap.contributions}
              limeRules={prediction.lime.rules}
            />
          </div>
        )}

        {/* Tab 3: Counterfactual What-If Simulator */}
        {activeTab === 'counterfactual' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Counterfactual Exploration for {patient.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Subject {patient.id} · Baseline SBP: {patient.systolicBp} mmHg · Baseline HbA1c: {patient.hba1c}%
                </p>
              </div>
              <button
                onClick={() => setActiveTab('prediction')}
                className="text-xs text-cyan-700 hover:text-cyan-900 font-medium"
              >
                &larr; Back to Patient Inputs
              </button>
            </div>

            <CounterfactualStudio patient={patient} />
          </div>
        )}

        {/* Tab 4: Ensemble Lab & ROC / PR Benchmarks */}
        {activeTab === 'models' && <ModelLab />}

        {/* Tab 5: Cohort Population Screener */}
        {activeTab === 'cohort' && (
          <CohortScreener
            onSelectPatient={handleSelectCohortPatient}
            activePatientId={patient.id}
          />
        )}
      </main>

      {/* Printable Clinical Report Modal */}
      <ClinicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        patient={patient}
        prediction={prediction}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">NephroExplain AI</span>
            <span aria-hidden="true">·</span>
            <span>Stacking Ensemble Learning Suite for Early CKD Detection</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Aligned with KDIGO 2024 Practice Guidelines</span>
            <span>·</span>
            <span>Race-Free 2021 CKD-EPI Equation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
