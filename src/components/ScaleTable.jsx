/**
 * ScaleTable Component
 * Displays the personalized just-intonation scale
 */

import { motion } from 'framer-motion';

export default function ScaleTable({ scale, highlightDegrees = [1, 5], compact = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-8">#</th>
            <th>Svara</th>
            <th>Solfège</th>
            <th className="text-right">Your Hz</th>
            <th>Nearest</th>
            <th className="text-right">Std Hz</th>
            {!compact && <th className="text-right">Ratio</th>}
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
                className={isHighlighted ? 'bg-cream-100' : ''}
              >
                <td className="font-mono text-carbon-400 text-xs">
                  {note.degree}
                </td>
                <td className={`font-medium ${isHighlighted ? 'text-signal-orange' : 'text-carbon-700'}`}>
                  {note.svara}
                </td>
                <td className="text-carbon-500">{note.solfege}</td>
                <td className="font-mono text-right text-carbon-800">
                  {note.hzFormatted}
                </td>
                <td className="font-mono text-carbon-600">
                  {note.nearestPitch}
                  <span className="text-carbon-400 ml-1 text-xs">
                    {note.centsFormatted}
                  </span>
                </td>
                <td className="font-mono text-right text-carbon-400 text-sm">
                  {note.nearestPitchHz}
                </td>
                {!compact && (
                  <td className="font-mono text-right text-carbon-400 text-sm">
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
