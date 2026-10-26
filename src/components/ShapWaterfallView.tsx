import React, { useState } from 'react';
import { ShapFeatureContribution, WaterfallStep, LimeRule } from '../types/ckd';
import { Info, HelpCircle, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface ShapWaterfallViewProps {
  baseValue: number;
  finalValue: number;
  steps: WaterfallStep[];
  contributions: ShapFeatureContribution[];
  limeRules: LimeRule[];
}

export const ShapWaterfallView: React.FC<ShapWaterfallViewProps> = ({
  baseValue,
  finalValue,
  steps,
  contributions,
  limeRules,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(
    steps[0]?.featureKey || null
  );

  const selectedContribution = contributions.find(
    (c) => String(c.featureKey) === selectedFeature
  );

  // SVG Waterfall dimensions
  const svgWidth = 840;
  const rowHeight = 44;
  const svgHeight = (steps.length + 2) * rowHeight + 40;
  const paddingLeft = 240;
  const chartWidth = 540;

  // X-scale maps value 0.0 -> 1.0 to pixel coordinates
  const scaleX = (val: number) => paddingLeft + Math.max(0, Math.min(1, val)) * chartWidth;

  return (
    <div className="space-y-6">
      {/* SHAP Introduction Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-800 mb-1">
              <span>Shapley Additive exPlanations (SHAP)</span>
              <span aria-hidden="true">·</span>
              <span>Game-Theoretic Local Attribution</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Interactive SHAP Waterfall Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Deconstructs the patient's individual prediction from the baseline expected population
              risk ($E[f(x)] = {(baseValue * 100).toFixed(1)}\%$) to the final model prediction ($f(x) = {(finalValue * 100).toFixed(1)}\%$). Red bars push risk UP; cyan/blue bars push risk DOWN.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
              <span className="w-3 h-3 rounded-xs bg-rose-500" />
              <span>Risk Driver (+)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-700 font-medium">
              <span className="w-3 h-3 rounded-xs bg-cyan-600" />
              <span>Protective Factor (-)</span>
            </div>
          </div>
        </div>

        {/* The SVG Waterfall Plot */}
        <div className="overflow-x-auto pt-4">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[700px] font-sans select-none"
          >
            {/* Grid vertical lines */}
            {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => {
              const x = scaleX(v);
              return (
                <g key={v}>
                  <line
                    x1={x}
                    y1={20}
                    x2={x}
                    y2={svgHeight - 20}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={16}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {(v * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* Base Value Line E[f(x)] */}
            <line
              x1={scaleX(baseValue)}
              y1={25}
              x2={scaleX(baseValue)}
              y2={svgHeight - 20}
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={scaleX(baseValue)}
              y={svgHeight - 6}
              textAnchor="middle"
              className="text-[10px] fill-slate-600 font-mono font-bold"
            >
              E[f(x)] = {(baseValue * 100).toFixed(1)}%
            </text>

            {/* Step 0: Baseline row */}
            <text
              x={paddingLeft - 15}
              y={44}
              textAnchor="end"
              className="text-xs fill-slate-500 font-medium font-mono"
            >
              Baseline Population Prior
            </text>
            <circle cx={scaleX(baseValue)} cy={40} r="4" fill="#64748b" />

            {/* Render Waterfall Bars */}
            {steps.map((step, idx) => {
              const y = (idx + 1) * rowHeight + 35;
              const prevCumulative = idx === 0 ? baseValue : steps[idx - 1].cumulative;
              const currCumulative = step.cumulative;

              const startX = scaleX(prevCumulative);
              const endX = scaleX(currCumulative);
              const barLeft = Math.min(startX, endX);
              const barWidth = Math.max(3, Math.abs(endX - startX));
              const isPositive = step.delta >= 0;
              const isSelected = selectedFeature === step.featureKey;

              return (
                <g
                  key={step.featureKey}
                  onClick={() => setSelectedFeature(step.featureKey)}
                  className="cursor-pointer group"
                >
                  {/* Row Hover highlight background */}
                  <rect
                    x={0}
                    y={y - 18}
                    width={svgWidth}
                    height={rowHeight - 6}
                    fill={isSelected ? '#f1f5f9' : 'transparent'}
                    rx="6"
                    className="group-hover:fill-slate-50 transition-colors"
                  />

                  {/* Feature Label */}
                  <text
                    x={paddingLeft - 15}
                    y={y + 3}
                    textAnchor="end"
                    className={`text-xs ${
                      isSelected ? 'font-bold fill-slate-900' : 'fill-slate-700 font-medium'
                    }`}
                  >
                    {step.label}
                    <tspan className="text-[10px] fill-slate-400 font-mono">
                      {' '}
                      ({step.valueDisplay})
                    </tspan>
                  </text>

                  {/* Connecting line to previous point */}
                  <line
                    x1={startX}
                    y1={y - 14}
                    x2={startX}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />

                  {/* The Shapley bar */}
                  <rect
                    x={barLeft}
                    y={y - 8}
                    width={barWidth}
                    height={16}
                    rx="3"
                    fill={isPositive ? '#f43f5e' : '#0891b2'}
                    className="transition-all duration-300 group-hover:opacity-90"
                  />

                  {/* Delta text on bar */}
                  <text
                    x={isPositive ? endX + 8 : endX - 8}
                    y={y + 4}
                    textAnchor={isPositive ? 'start' : 'end'}
                    className={`text-[11px] font-mono font-bold ${
                      isPositive ? 'fill-rose-700' : 'fill-cyan-800'
                    }`}
                  >
                    {isPositive ? `+${(step.delta * 100).toFixed(1)}%` : `${(step.delta * 100).toFixed(1)}%`}
                  </text>
                </g>
              );
            })}

            {/* Final prediction vertical marker */}
            <line
              x1={scaleX(finalValue)}
              y1={25}
              x2={scaleX(finalValue)}
              y2={svgHeight - 20}
              stroke={finalValue >= 0.5 ? '#e11d48' : '#059669'}
              strokeWidth="2"
            />
            <text
              x={scaleX(finalValue)}
              y={svgHeight - 6}
              textAnchor="middle"
              className={`text-[11px] font-mono font-extrabold ${
                finalValue >= 0.5 ? 'fill-rose-700' : 'fill-emerald-700'
              }`}
            >
              f(x) = {(finalValue * 100).toFixed(1)}%
            </text>
          </svg>
        </div>
      </div>

      {/* Feature Deep Dive & LIME Surrogate Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Biomarker Pathophysiology Card */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <Info className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Biomarker Clinical Attribution Deep Dive
            </h3>
          </div>

          {selectedContribution ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-xs uppercase font-mono text-slate-400">Selected Biomarker</span>
                  <p className="text-base font-bold text-slate-900">{selectedContribution.label}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-500">Patient Value</span>
                  <p className="text-base font-bold font-mono text-cyan-900">
                    {String(selectedContribution.value)}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Nephrological Pathophysiology &amp; Mechanism:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-cyan-50/40 p-3 rounded-lg border border-cyan-100">
                  {selectedContribution.clinicalContext}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Marginal SHAP Impact</span>
                  <div className="text-base font-bold font-mono mt-0.5">
                    {selectedContribution.phi >= 0 ? (
                      <span className="text-rose-600">
                        +{(selectedContribution.phi * 100).toFixed(2)}% Risk
                      </span>
                    ) : (
                      <span className="text-cyan-700">
                        {(selectedContribution.phi * 100).toFixed(2)}% Protective
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Attribution Vector</span>
                  <div className="text-base font-bold font-mono mt-0.5 text-slate-800">
                    φ = {selectedContribution.phi.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select any row in the waterfall to view clinical context.</p>
          )}
        </div>

        {/* LIME Local Surrogate Decision Rules */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <Layers className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900">
              LIME Local Surrogate Rules
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Local sparse linear model approximating the non-linear ensemble manifold around this patient's perturbation neighborhood:
          </p>

          <div className="space-y-2.5">
            {limeRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {rule.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  )}
                  <span className="font-mono text-slate-700">{rule.description}</span>
                </div>
                <span
                  className={`font-mono font-bold shrink-0 ml-2 ${
                    rule.isPositive ? 'text-rose-600' : 'text-cyan-700'
                  }`}
                >
                  {rule.weight > 0 ? `+${rule.weight.toFixed(2)}` : rule.weight.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
