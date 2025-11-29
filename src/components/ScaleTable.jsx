/**
 * ScaleTable Component
 * Displays the personalized just-intonation scale
 */

import { motion } from 'framer-motion';

export default function ScaleTable({ scale, highlightDegrees = [1, 5], compact = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-carbon-200 text-xs uppercase tracking-wider text-carbon-500">
            <th className="py-2 px-2 text-left w-10">#</th>
            <th className="py-2 px-3 text-left">Svara</th>
            <th className="py-2 px-3 text-left">Solfège</th>
            <th className="py-2 px-3 text-right">Your Hz</th>
            <th className="py-2 px-3 text-left">Nearest</th>
            <th className="py-2 px-3 text-right">Std Hz</th>
            {!compact && <th className="py-2 px-3 text-right">Ratio</th>}
          </tr>
        </thead>
        <tbody>
          {scale.map((note, i) => {
            const isHighlighted = highlightDegrees.includes(note.degree);
            return (
              <motion.tr
                key={note.svara}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border-b border-carbon-100 ${isHighlighted ? 'bg-cream-100' : ''}`}
              >
                <td className="py-2.5 px-2 font-mono text-carbon-400 text-sm">
                  {note.degree}
                </td>
                <td className={`py-2.5 px-3 font-semibold ${isHighlighted ? 'text-signal-orange' : 'text-carbon-700'}`}>
                  {note.svara}
                </td>
                <td className="py-2.5 px-3 text-carbon-500">{note.solfege}</td>
                <td className="py-2.5 px-3 font-mono text-right text-carbon-800">
                  {note.hzFormatted}
                </td>
                <td className="py-2.5 px-3 font-mono text-carbon-600">
                  {note.nearestPitch}
                  <span className="text-carbon-400 ml-2 text-xs">
                    {note.centsFormatted}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-right text-carbon-400 text-sm">
                  {note.nearestPitchHz}
                </td>
                {!compact && (
                  <td className="py-2.5 px-3 font-mono text-right text-carbon-400 text-sm">
                    {note.ratio}
                  </td>
                )}
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
