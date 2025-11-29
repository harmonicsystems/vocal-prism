/**
 * StaffNotation Component
 * Renders the personalized scale in standard musical notation using ABCJS
 * Automatically selects appropriate clef based on frequency range
 */

import { useEffect, useRef } from 'react';
import abcjs from 'abcjs';

// Convert note name to ABC notation format
function noteToAbc(noteName) {
  // Parse note: e.g., "E3", "F#4", "Bb3"
  const match = noteName.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 'C';

  const [, letter, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr);

  // ABC notation:
  // C4 = C (middle C)
  // C5 = c (octave above)
  // C6 = c'
  // C3 = C, (octave below middle C)
  // C2 = C,,

  let abcNote = '';

  // Add accidental prefix
  if (accidental === '#') abcNote += '^';
  if (accidental === 'b') abcNote += '_';

  // Handle octave
  if (octave >= 5) {
    // Lowercase for octave 5 and above
    abcNote += letter.toLowerCase();
    if (octave >= 6) {
      abcNote += "'".repeat(octave - 5);
    }
  } else {
    // Uppercase for octave 4 and below
    abcNote += letter;
    if (octave <= 3) {
      abcNote += ",".repeat(4 - octave);
    }
  }

  return abcNote;
}

// Determine appropriate clef based on frequency range
function selectClef(scale) {
  if (!scale || scale.length === 0) return 'treble';

  const firstHz = scale[0]?.hz || 165;

  // Bass clef for low frequencies (below ~175 Hz / F3)
  // Treble clef for higher frequencies
  // Could also use alto clef for middle range, but keeping it simple

  if (firstHz < 175) return 'bass';
  if (firstHz < 350) return 'treble';
  return 'treble'; // treble8va would be nice but ABCJS support is limited
}

// Get octave range description
function getOctaveLabel(clef) {
  if (clef === 'bass') return 'Bass Clef';
  return 'Treble Clef';
}

export default function StaffNotation({
  scale = [],
  title = "Your Personalized Scale",
  showSvara = true,
  showCents = true
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || scale.length === 0) return;

    // Select appropriate clef
    const clef = selectClef(scale);

    // Convert scale notes to ABC format
    const abcNotes = scale.map(note => {
      const abcNote = noteToAbc(note.nearestPitch);
      return abcNote;
    });

    // Build ABC string with whole notes
    const notesLine = abcNotes.map((note, i) => {
      return note + '4'; // Whole note
    }).join(' ');

    // Svara names as lyrics (w: line in ABC)
    const svaraLine = showSvara
      ? `w: ${scale.map(s => s.svara).join(' ')}`
      : '';

    const abc = `
X:1
T:${title}
M:4/4
L:1/4
Q:1/4=60
K:C clef=${clef}
${notesLine} |]
${svaraLine}
`.trim();

    // Render with ABCJS
    abcjs.renderAbc(containerRef.current, abc, {
      responsive: 'resize',
      add_classes: true,
      staffwidth: 600,
      paddingleft: 10,
      paddingright: 10,
      paddingtop: 10,
      paddingbottom: 10,
      scale: 1.1,
    });

  }, [scale, title, showSvara]);

  if (scale.length === 0) {
    return (
      <div className="text-center text-carbon-400 py-8">
        No scale data available
      </div>
    );
  }

  const clef = selectClef(scale);

  return (
    <div className="staff-notation">
      {/* Clef indicator */}
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-xs text-carbon-400 font-mono uppercase tracking-wider">
          {getOctaveLabel(clef)}
        </span>
        <span className="text-[10px] text-carbon-500">
          Range: {scale[0]?.nearestPitch} - {scale[scale.length - 1]?.nearestPitch}
        </span>
      </div>

      {/* Staff rendering */}
      <div
        ref={containerRef}
        className="bg-white rounded-lg p-4 overflow-x-auto"
        style={{ minHeight: '150px' }}
      />

      {/* Solfège + Hz + Cents row */}
      <div className="grid grid-cols-8 gap-1 mt-3 px-2">
        {scale.map((note, i) => (
          <div key={i} className="text-center">
            <div className="font-mono text-xs text-carbon-600">
              {note.solfege}
            </div>
            <div className="font-mono text-[10px] text-carbon-400">
              {note.hz.toFixed(1)}
            </div>
            {showCents && (
              <div className={`font-mono text-[9px] ${
                Math.abs(note.cents) < 5 ? 'text-carbon-400' : 'text-signal-amber'
              }`}>
                {note.cents >= 0 ? '+' : ''}{note.cents}¢
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact inline notation for a single chord or interval
 */
export function ChordNotation({ notes, chordName, clef = 'treble' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !notes || notes.length === 0) return;

    const abcNotes = notes.map(noteToAbc);

    const abc = `
X:1
M:4/4
L:1/4
K:C clef=${clef}
"${chordName || ''}"[${abcNotes.join('')}]4|]
`.trim();

    abcjs.renderAbc(containerRef.current, abc, {
      responsive: 'resize',
      staffwidth: 200,
      paddingleft: 5,
      paddingright: 5,
      paddingtop: 5,
      paddingbottom: 5,
      scale: 0.9,
    });

  }, [notes, chordName, clef]);

  return (
    <div
      ref={containerRef}
      className="inline-block bg-white rounded"
      style={{ minHeight: '80px' }}
    />
  );
}
