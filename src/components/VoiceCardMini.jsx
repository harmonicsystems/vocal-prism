/**
 * VoiceCardMini Component
 * Compact card for the example gallery — clickable
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function VoiceCardMini({ f0, label, sublabel, description, index = 1 }) {
  return (
    <Link to={`/prism/${f0}`}>
      <motion.div
        className="
          bg-white border border-carbon-200 rounded-lg overflow-hidden
          cursor-pointer shadow-card
          hover:border-carbon-300 hover:shadow-card-elevated
          transition-all duration-200
        "
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Top bar */}
        <div className="px-3 py-2 border-b border-carbon-100 bg-cream-50 flex items-center justify-between">
          <span className="text-[10px] font-medium tracking-widest text-carbon-400 uppercase">
            Example
          </span>
          <span className="font-mono text-[10px] text-carbon-300">
            {String(index).padStart(3, '0')}
          </span>
        </div>

        {/* Main content */}
        <div className="p-4">
          {/* Hz display */}
          <div className="text-center mb-3">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="font-mono text-3xl font-bold tracking-tight text-carbon-900">
                {f0}
              </span>
              <span className="font-mono text-sm text-carbon-400">Hz</span>
            </div>
            <div className="font-mono text-sm text-carbon-500 mt-1">
              {sublabel}
            </div>
          </div>

          {/* Label */}
          <div className="text-center">
            <div className="text-sm font-semibold text-carbon-800">{label}</div>
            <div className="text-xs text-carbon-400 mt-0.5">{description}</div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-3 py-2 border-t border-carbon-100 bg-cream-50 flex items-center justify-center gap-2">
          <span className="led led-off" />
          <span className="text-[10px] text-carbon-400 uppercase tracking-wide">
            Explore →
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
