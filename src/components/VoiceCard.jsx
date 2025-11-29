/**
 * VoiceCard Component
 * The hero visual — designed like a Teenage Engineering product label
 * Beautiful enough to screenshot and share
 */

import { motion } from 'framer-motion';

export default function VoiceCard({
  f0,
  nearestPitch,
  centsFormatted,
  mode,
  saptak,
  keySignature,
  vocalCategory,
  chakra,
  bija,
  compact = false,
  index = 1,
  onClick
}) {
  const Container = onClick ? motion.button : motion.div;

  return (
    <Container
      onClick={onClick}
      className={`
        bg-white border border-carbon-200 rounded-lg overflow-hidden
        text-left w-full
        ${onClick ? 'cursor-pointer hover:border-carbon-300 hover:shadow-card-elevated transition-all duration-200' : ''}
        ${compact ? 'shadow-card' : 'shadow-card-elevated'}
      `}
      whileHover={onClick ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
    >
      {/* Top bar with branding and index */}
      <div className="px-4 py-3 border-b border-carbon-100 flex items-center justify-between bg-cream-50">
        <span className="text-xs font-medium tracking-widest text-carbon-400 uppercase">
          Vocal Prism
        </span>
        <span className="font-mono text-xs text-carbon-300">
          {String(index).padStart(3, '0')}
        </span>
      </div>

      {/* Main frequency display */}
      <div className={`${compact ? 'p-4' : 'p-6'} bg-white`}>
        <div className="text-center">
          {/* Hz value — the hero */}
          <div className="flex items-baseline justify-center gap-1">
            <span className={`font-mono font-bold tracking-tight text-carbon-900 ${compact ? 'text-4xl' : 'text-5xl'}`}>
              {typeof f0 === 'number' ? f0.toFixed(f0 % 1 === 0 ? 0 : 2) : f0}
            </span>
            <span className={`font-mono text-carbon-400 ${compact ? 'text-lg' : 'text-xl'}`}>
              Hz
            </span>
          </div>

          {/* Note name and cents */}
          <div className={`mt-2 font-mono ${compact ? 'text-base' : 'text-lg'} text-carbon-600`}>
            {nearestPitch}
            {centsFormatted && (
              <span className="ml-2 text-carbon-400">{centsFormatted}</span>
            )}
          </div>
        </div>
      </div>

      {/* Specs grid */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-4'} border-t border-carbon-100`}>
        <SpecCell label="Mode" value={mode} compact={compact} />
        <SpecCell label="Saptak" value={saptak} compact={compact} />
        {!compact && (
          <>
            <SpecCell label="Key" value={keySignature} />
            <SpecCell label="Range" value={vocalCategory} />
          </>
        )}
      </div>

      {/* Chakra row */}
      {(chakra || bija) && (
        <div className="px-4 py-3 border-t border-carbon-100 bg-cream-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="led led-on" />
            <span className="text-xs text-carbon-500 uppercase tracking-wide">
              {chakra}
            </span>
          </div>
          {bija && (
            <span className="font-mono text-sm text-carbon-600 font-medium">
              {bija}
            </span>
          )}
        </div>
      )}
    </Container>
  );
}

function SpecCell({ label, value, compact = false }) {
  return (
    <div className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} border-r border-carbon-100 last:border-r-0`}>
      <div className="text-[10px] uppercase tracking-wider text-carbon-400 font-medium mb-0.5">
        {label}
      </div>
      <div className={`font-medium text-carbon-700 ${compact ? 'text-xs' : 'text-sm'} truncate`}>
        {value || '—'}
      </div>
    </div>
  );
}
