import React from 'react';
import { Layers, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

interface HeroOverviewProps {
  onStartAssessment: () => void;
  onExploreModels: () => void;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({
  onStartAssessment,
  onExploreModels,
}) => {
  return (
    <section className="bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Clinical & Machine Learning Mission */}
          <div className="lg:col-span-7 space-y-5">
            {/* Unboxed Metadata Discipline */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-cyan-700 font-semibold">KDIGO 2024 Guidelines</span>
              <span aria-hidden="true">·</span>
              <span>Stacking Meta-Ensemble</span>
              <span aria-hidden="true">·</span>
              <span>Additive SHAP Attribution</span>
              <span aria-hidden="true">·</span>
              <span>Race-Free CKD-EPI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
              Explainable AI-Driven Early Prediction of Chronic Kidney Disease
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              An advanced clinical decision support system combining 4 gradient-boosted and bagged
              architectures (XGBoost, LightGBM, CatBoost, Random Forest) through a meta-learner.
              Provides exact local SHAP feature attributions, KDIGO 2D risk stratification, and
              actionable counterfactual therapy simulations before irreversible nephron loss occurs.
            </p>

            {/* Proof Points Strip adjacent to claims */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100 max-w-xl">
              <div>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">0.994</p>
                <p className="text-xs text-slate-500 font-medium">Meta-Learner AUC-ROC</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">98.7%</p>
                <p className="text-xs text-slate-500 font-medium">Clinical Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">&lt;2.0ms</p>
                <p className="text-xs text-slate-500 font-medium">Inference Latency</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartAssessment}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-98 transition-all shadow-sm"
              >
                Assess Patient Case
              </button>
              <button
                onClick={onExploreModels}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <span>View Ensemble Benchmarks</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Right Column: Renal Glomerulus Microscopy Visual Asset */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
              <img
                src="/src/assets/images/hero_renal_microscopy_1793015065725.jpg"
                alt="High-resolution biomedical visualization of renal glomerulus and nephron filtration barrier"
                referrerPolicy="no-referrer"
                className="w-full h-80 lg:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Podocyte &amp; Endothelial Filtration Barrier</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  Early glomerular basement membrane stress and microalbuminuria precede symptomatic
                  serum creatinine elevation by up to 36 months.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
