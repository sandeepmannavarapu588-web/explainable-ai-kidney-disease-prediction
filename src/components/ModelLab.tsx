import React, { useState } from 'react';
import {
  BENCHMARK_MODELS,
  GLOBAL_FEATURE_IMPORTANCES,
  ModelBenchmarkComparison,
} from '../services/modelBenchmarks';
import { Cpu, BarChart3, LineChart, Sliders, CheckCircle2 } from 'lucide-react';

export const ModelLab: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('stacking_meta');
  const [activeCurveType, setActiveCurveType] = useState<'roc' | 'pr'>('roc');
  const [importanceMetric, setImportanceMetric] = useState<'meanShap' | 'permutationImportance' | 'giniGain'>('meanShap');

  // Custom stacking weights state
  const [weights, setWeights] = useState<{
    xgb: number;
    lgb: number;
    cat: number;
    rf: number;
  }>({
    xgb: 34,
    lgb: 28,
    cat: 24,
    rf: 14,
  });

  const selectedModel =
    BENCHMARK_MODELS.find((m) => m.id === selectedModelId) || BENCHMARK_MODELS[0];

  // SVG dimensions for ROC/PR Curve
  const svgWidth = 480;
  const svgHeight = 360;
  const pad = 45;
  const plotWidth = svgWidth - pad * 2;
  const plotHeight = svgHeight - pad * 2;

  // Convert (x,y) in [0,1] to SVG coordinates
  const toSvgX = (x: number) => pad + x * plotWidth;
  const toSvgY = (y: number) => pad + (1 - y) * plotHeight;

  return (
    <div className="space-y-6">
      {/* Model Lab Introduction */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-800 mb-1">
              <span>Empirical Model Validation Suite</span>
              <span aria-hidden="true">·</span>
              <span>10-Fold Stratified Cross-Validation (N=4,820)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Ensemble Architecture &amp; Benchmark Lab
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Inspect model calibration, Receiver Operating Characteristic (ROC) curves, Precision-Recall
              dynamics, and global game-theoretic feature importance across all individual base models and
              the stacking super-learner.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Benchmark Metric:</span>
            <span className="text-xs font-mono font-bold text-cyan-900 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100">
              Stacking AUC-ROC: 0.994
            </span>
          </div>
        </div>

        {/* Model Benchmark Comparative Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3 text-right">AUC-ROC</th>
                <th className="py-2.5 px-3 text-right">AUC-PR</th>
                <th className="py-2.5 px-3 text-right">Sensitivity</th>
                <th className="py-2.5 px-3 text-right">Specificity</th>
                <th className="py-2.5 px-3 text-right">F1-Score</th>
                <th className="py-2.5 px-3 text-right">Brier Score</th>
                <th className="py-2.5 px-3 text-right">Inference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {BENCHMARK_MODELS.map((m) => {
                const isSelected = m.id === selectedModelId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: m.color }}
                        />
                        <span className="font-bold text-slate-900">{m.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 ml-4 font-normal">{m.type}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{m.aucRoc.toFixed(3)}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{m.aucPr.toFixed(3)}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{m.sensitivity.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right text-slate-700">{m.specificity.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right text-slate-700">{m.f1Score.toFixed(3)}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{m.brierScore.toFixed(3)}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{m.inferenceLatencyMs} ms</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Grid: ROC/PR Curves & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Curve Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {activeCurveType === 'roc' ? 'ROC Curve Discrimination' : 'Precision-Recall Curve'}
              </h3>
            </div>

            {/* Curve Type Selector (Compliant interactive segmented buttons) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveCurveType('roc')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeCurveType === 'roc'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ROC Curve
              </button>
              <button
                onClick={() => setActiveCurveType('pr')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeCurveType === 'pr'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Precision-Recall
              </button>
            </div>
          </div>

          {/* SVG Plot */}
          <div className="flex justify-center">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full max-w-[480px] h-auto select-none"
            >
              {/* Axes & Grids */}
              {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((tick) => {
                const x = toSvgX(tick);
                const y = toSvgY(tick);
                return (
                  <g key={tick}>
                    {/* Vertical grid */}
                    <line
                      x1={x}
                      y1={pad}
                      x2={x}
                      y2={svgHeight - pad}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={svgHeight - pad + 15}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {tick.toFixed(1)}
                    </text>

                    {/* Horizontal grid */}
                    <line
                      x1={pad}
                      y1={y}
                      x2={svgWidth - pad}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={pad - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {tick.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Diagonal chance line for ROC */}
              {activeCurveType === 'roc' && (
                <line
                  x1={toSvgX(0)}
                  y1={toSvgY(0)}
                  x2={toSvgX(1)}
                  y2={toSvgY(1)}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              )}

              {/* Plot Curves for each model */}
              {BENCHMARK_MODELS.map((m) => {
                const points = activeCurveType === 'roc' ? m.rocPoints : m.prPoints;
                const pathD = points
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
                  .join(' ');
                const isSelected = m.id === selectedModelId;

                return (
                  <g key={m.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={m.color}
                      strokeWidth={isSelected ? '3' : '1.5'}
                      opacity={isSelected ? '1.0' : '0.4'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {isSelected &&
                      points.map((p, i) => (
                        <circle
                          key={i}
                          cx={toSvgX(p.x)}
                          cy={toSvgY(p.y)}
                          r="3"
                          fill={m.color}
                        />
                      ))}
                  </g>
                );
              })}

              {/* Axes Titles */}
              <text
                x={svgWidth / 2}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-mono"
              >
                {activeCurveType === 'roc'
                  ? 'False Positive Rate (1 - Specificity)'
                  : 'Recall (Sensitivity)'}
              </text>
              <text
                x={12}
                y={svgHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90, 12, ${svgHeight / 2})`}
                className="text-[10px] fill-slate-500 font-mono"
              >
                {activeCurveType === 'roc' ? 'True Positive Rate (Sensitivity)' : 'Precision (PPV)'}
              </text>
            </svg>
          </div>

          {/* Model Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100 text-xs">
            {BENCHMARK_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModelId(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  m.id === selectedModelId ? 'bg-slate-100 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.name.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Confusion Matrix & Stacking Weight Customizer */}
        <div className="lg:col-span-5 space-y-6">
          {/* Confusion Matrix Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Evaluation Holdout (N=1,889)</span>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedModel.name.split('(')[0]} Confusion Matrix
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Acc: {selectedModel.accuracy}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-center">
              <div className="p-3.5 bg-emerald-50/80 rounded-lg border border-emerald-200">
                <span className="text-[10px] uppercase text-emerald-800 block">True Positive (TP)</span>
                <span className="text-2xl font-bold text-emerald-950">
                  {selectedModel.confusionMatrix.tp}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Correct CKD Detection</span>
              </div>
              <div className="p-3.5 bg-rose-50/60 rounded-lg border border-rose-100">
                <span className="text-[10px] uppercase text-rose-800 block">False Positive (FP)</span>
                <span className="text-2xl font-bold text-rose-950">
                  {selectedModel.confusionMatrix.fp}
                </span>
                <span className="text-[10px] text-rose-700 block mt-0.5">Type I Error</span>
              </div>
              <div className="p-3.5 bg-rose-50/60 rounded-lg border border-rose-100">
                <span className="text-[10px] uppercase text-rose-800 block">False Negative (FN)</span>
                <span className="text-2xl font-bold text-rose-950">
                  {selectedModel.confusionMatrix.fn}
                </span>
                <span className="text-[10px] text-rose-700 block mt-0.5">Type II Missed Cases</span>
              </div>
              <div className="p-3.5 bg-emerald-50/80 rounded-lg border border-emerald-200">
                <span className="text-[10px] uppercase text-emerald-800 block">True Negative (TN)</span>
                <span className="text-2xl font-bold text-emerald-950">
                  {selectedModel.confusionMatrix.tn}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Correct Non-CKD</span>
              </div>
            </div>
          </div>

          {/* Interactive Stacking Meta-Weights Customizer */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Sliders className="w-4 h-4 text-cyan-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ensemble Meta-Learner Weight Tuning
                </h3>
                <p className="text-[11px] text-slate-500">
                  Adjust soft voting / stacking coefficients across base learners.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span>XGBoost Weight:</span>
                  <span className="font-bold">{weights.xgb}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.xgb}
                  onChange={(e) => setWeights({ ...weights, xgb: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span>LightGBM Weight:</span>
                  <span className="font-bold">{weights.lgb}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.lgb}
                  onChange={(e) => setWeights({ ...weights, lgb: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span>CatBoost Weight:</span>
                  <span className="font-bold">{weights.cat}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.cat}
                  onChange={(e) => setWeights({ ...weights, cat: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono mb-1">
                  <span>Random Forest Weight:</span>
                  <span className="font-bold">{weights.rf}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.rf}
                  onChange={(e) => setWeights({ ...weights, rf: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Sum of Weights: {weights.xgb + weights.lgb + weights.cat + weights.rf}%</span>
              <button
                onClick={() => setWeights({ xgb: 34, lgb: 28, cat: 24, rf: 14 })}
                className="text-cyan-700 hover:text-cyan-900 font-semibold"
              >
                Reset to Optimal CV Weights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feature Importance Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Global Feature Importance Ranking (Entire Cohort)
            </h3>
            <p className="text-xs text-slate-500">
              Mean absolute Shapley value across 4,820 training cases compared with Permutation Importance and Tree Gini Gain.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setImportanceMetric('meanShap')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                importanceMetric === 'meanShap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mean |SHAP|
            </button>
            <button
              onClick={() => setImportanceMetric('permutationImportance')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                importanceMetric === 'permutationImportance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Permutation
            </button>
            <button
              onClick={() => setImportanceMetric('giniGain')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                importanceMetric === 'giniGain'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gini Gain
            </button>
          </div>
        </div>

        {/* Importance Bars */}
        <div className="space-y-3">
          {GLOBAL_FEATURE_IMPORTANCES.map((item, idx) => {
            const val = item[importanceMetric];
            const maxVal = 0.35;
            const barPct = Math.min(100, (val / maxVal) * 100);

            return (
              <div key={item.feature} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-5">{idx + 1}.</span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">[{item.category}]</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {val.toFixed(3)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-700 rounded-full transition-all duration-500"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
