import React from 'react';
import { Activity, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'prediction' | 'shap' | 'counterfactual' | 'models' | 'cohort';
  onSelectTab: (tab: 'prediction' | 'shap' | 'counterfactual' | 'models' | 'cohort') => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onOpenReport }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Title (Single line, no descriptor badges) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center font-bold text-base shadow-sm">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('prediction');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-slate-700 transition-colors"
            >
              NephroExplain AI
            </a>
          </div>

          {/* Zone 2: 4-5 Navigation Links (1-2 word labels, single-line) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('prediction')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'prediction'
                  ? 'border-cyan-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Risk Assessment
            </button>
            <button
              onClick={() => onSelectTab('shap')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'shap'
                  ? 'border-cyan-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              SHAP Explainability
            </button>
            <button
              onClick={() => onSelectTab('counterfactual')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'counterfactual'
                  ? 'border-cyan-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Counterfactuals
            </button>
            <button
              onClick={() => onSelectTab('models')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'models'
                  ? 'border-cyan-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Ensemble Lab
            </button>
            <button
              onClick={() => onSelectTab('cohort')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'cohort'
                  ? 'border-cyan-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Cohort Screener
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clinical Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
