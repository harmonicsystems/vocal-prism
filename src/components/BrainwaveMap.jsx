/**
 * BrainwaveMap Component
 * Visual guide for binaural beat creation
 */

import { motion } from 'framer-motion';

export default function BrainwaveMap({ f0, brainwaveMap }) {
  const states = [
    { key: 'delta', label: 'δ Delta' },
    { key: 'theta', label: 'θ Theta' },
    { key: 'alpha', label: 'α Alpha' },
    { key: 'beta', label: 'β Beta' },
    { key: 'gamma', label: 'γ Gamma' }
  ];

  return (
    <div className="space-y-4">
      {/* Visual bar representation */}
      <div className="bg-cream-50 rounded border border-carbon-100 p-4">
        {/* Center marker */}
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-wider text-carbon-400">Your Sa</span>
          <div className="font-mono text-xl font-bold text-carbon-800">{f0} Hz</div>
        </div>

        {/* State bars */}
        <div className="flex rounded overflow-hidden h-12">
          {states.map((state, i) => {
            const data = brainwaveMap[state.key];
            return (
              <motion.div
                key={state.key}
                className="flex-1 flex items-center justify-center relative group"
                style={{ backgroundColor: data.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-white text-xs font-medium opacity-80">
                  {state.label.split(' ')[0]}
                </span>

                {/* Hover tooltip */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-carbon-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {data.beatRange}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Range labels */}
        <div className="flex justify-between mt-2 text-xs text-carbon-400">
          <span>← Near unison</span>
          <span>Far from drone →</span>
        </div>
      </div>

      {/* Detailed state list */}
      <div className="space-y-2">
        {states.map((state) => {
          const data = brainwaveMap[state.key];
          return (
            <div
              key={state.key}
              className="flex items-start gap-3 p-3 bg-white border border-carbon-100 rounded"
            >
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                style={{ backgroundColor: data.color }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-carbon-800">{data.name}</span>
                  <span className="font-mono text-xs text-carbon-400">{data.beatRange}</span>
                </div>
                <p className="text-xs text-carbon-500 mt-0.5">{data.state}</p>
                <p className="text-xs text-carbon-400 mt-1 italic">{data.instruction}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
