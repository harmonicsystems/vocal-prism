/**
 * FrameworkCard Component
 * Expandable module panel for each framework — numbered like hardware panels
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from './Icons';

export default function FrameworkCard({
  number,
  title,
  subtitle,
  tagline,
  colorClass = 'framework-pythagorean',
  defaultExpanded = false,
  children,
  insight
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Color mapping for the accent
  const colorMap = {
    'framework-pythagorean': 'bg-framework-pythagorean',
    'framework-vedic': 'bg-framework-vedic',
    'framework-gregorian': 'bg-framework-gregorian',
    'framework-western': 'bg-framework-western',
    'framework-tibetan': 'bg-framework-tibetan',
    'framework-neuroscience': 'bg-framework-neuroscience'
  };

  const accentColor = colorMap[colorClass] || 'bg-carbon-400';

  return (
    <div className="module overflow-hidden">
      {/* Header — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full module-header hover:bg-cream-50 transition-colors duration-150"
      >
        <div className="flex items-center gap-3">
          {/* Number badge */}
          <span className="font-mono text-xs text-carbon-300 w-6">
            {number}
          </span>

          {/* Color indicator */}
          <span className={`w-2 h-2 rounded-full ${accentColor}`} />

          {/* Title and subtitle */}
          <div className="text-left">
            <h3 className="font-semibold text-carbon-800">{title}</h3>
            {subtitle && (
              <p className="text-xs text-carbon-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Expand indicator */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-carbon-400" />
        </motion.div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Tagline */}
            {tagline && (
              <div className="px-4 py-2 bg-cream-50 border-t border-carbon-100">
                <p className="text-xs italic text-carbon-500">{tagline}</p>
              </div>
            )}

            {/* Main content */}
            <div className="module-body border-t border-carbon-100">
              {children}
            </div>

            {/* Insight box */}
            {insight && (
              <div className="mx-4 mb-4 p-3 bg-cream-100 rounded border border-cream-300">
                <p className="text-xs text-carbon-600 leading-relaxed">
                  <span className="font-semibold text-carbon-700">Insight: </span>
                  {insight}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * DataRow — for displaying key-value pairs in frameworks
 */
export function DataRow({ label, value, sublabel, mono = false }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-carbon-50 last:border-b-0">
      <div>
        <span className="text-xs uppercase tracking-wider text-carbon-400 font-medium">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-carbon-300 ml-2">{sublabel}</span>
        )}
      </div>
      <span className={`text-sm text-carbon-700 ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}

/**
 * IntervalRow — for displaying musical intervals
 */
export function IntervalRow({ name, hz, ratio }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-carbon-50 last:border-b-0">
      <span className="text-sm text-carbon-600">{name}</span>
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-carbon-700">{hz} Hz</span>
        <span className="font-mono text-xs text-carbon-400 w-12 text-right">{ratio}</span>
      </div>
    </div>
  );
}

/**
 * ConceptBox — for expandable concept explanations
 */
export function ConceptBox({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-carbon-100 rounded bg-white mb-2 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-cream-50"
      >
        <span className="text-xs font-medium text-carbon-600">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-carbon-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 text-xs text-carbon-500 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
