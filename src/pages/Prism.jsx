/**
 * Prism Page
 * Full analysis view for a given f0
 */

import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

import { calculatePrism } from '../engine';
import { FRAMEWORK_INFO } from '../data/examples';

import VoiceCard from '../components/VoiceCard';
import FrameworkCard, { DataRow, IntervalRow, ConceptBox } from '../components/FrameworkCard';
import ScaleTable from '../components/ScaleTable';
import OvertoneChart from '../components/OvertoneChart';
import BrainwaveMap from '../components/BrainwaveMap';
import PianoKeyboard from '../components/PianoKeyboard';
import StaffNotation from '../components/StaffNotation';
import DroneMixer from '../components/DroneMixer';
import MathVerification from '../components/MathVerification';
import TuningSelector from '../components/TuningSelector';
import ShrutiScale from '../components/ShrutiScale';
import ShrutiMixer from '../components/ShrutiMixer';
import BinauralBeatMixer from '../components/BinauralBeatMixer';
import { ArrowLeft, Prism as PrismIcon } from '../components/Icons';

// Contextual explanation component
function ContextBox({ context, color = 'carbon' }) {
  if (!context) return null;
  return (
    <div className={`mt-3 p-3 bg-${color}-50 border border-${color}-200 rounded text-xs space-y-1.5`}>
      <div className="text-carbon-800 font-medium">What does this mean?</div>
      {context.what && <p className="text-carbon-600"><span className="font-medium">What:</span> {context.what}</p>}
      {context.why && <p className="text-carbon-600"><span className="font-medium">Why:</span> {context.why}</p>}
      {context.how && <p className="text-carbon-600"><span className="font-medium">How:</span> {context.how}</p>}
      {context.example && <p className="text-carbon-500 italic">{context.example}</p>}
      {context.note && <p className="text-carbon-500 italic">{context.note}</p>}
      {context.yourPosition && <p className="text-carbon-700 font-medium">{context.yourPosition}</p>}
    </div>
  );
}

// Parse f0 from URL, supporting both:
// - /prism/165 (integer)
// - /prism/165.5 (decimal with dot)
// - /prism/165_5 (decimal with underscore for URL-friendliness)
function parseF0(param) {
  if (!param) return NaN;
  // Replace underscore with dot for decimal support
  const normalized = param.replace('_', '.');
  return parseFloat(normalized);
}

export default function PrismPage() {
  const { f0: f0Param } = useParams();
  const f0 = parseF0(f0Param);

  // Calculate prism data
  const prismData = useMemo(() => {
    if (isNaN(f0) || f0 < 50 || f0 > 1000) return null;
    try {
      return calculatePrism(f0);
    } catch (e) {
      console.error('Prism calculation error:', e);
      return null;
    }
  }, [f0]);

  if (!prismData) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-carbon-800 mb-2">Invalid Frequency</h1>
          <p className="text-carbon-500 mb-4">Please enter a frequency between 50 and 1000 Hz.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { input, scale, frameworks, narrative } = prismData;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="border-b border-carbon-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 text-carbon-500 hover:text-carbon-800 active:text-carbon-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PrismIcon className="w-4 h-4 sm:w-5 sm:h-5 text-carbon-400" />
            <span className="font-mono text-xs sm:text-sm text-carbon-600">{input.f0Formatted} Hz</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Hero Voice Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <VoiceCard
            f0={input.f0}
            nearestPitch={input.nearestPitch}
            centsFormatted={input.centsFormatted}
            mode={frameworks.gregorian.mode.name}
            saptak={frameworks.vedic.saptak.name}
            keySignature={frameworks.western.keySignature.key}
            vocalCategory={frameworks.western.vocalCategory.category}
            chakra={frameworks.vedic.chakra.name}
            bija={frameworks.vedic.chakra.bija}
          />
        </motion.section>

        {/* Narrative */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-8 p-3 sm:p-4 bg-white border border-carbon-200 rounded-lg"
        >
          <p className="text-sm sm:text-base text-carbon-600 leading-relaxed">{narrative.medium}</p>
        </motion.section>

        {/* Your Scale */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-8"
        >
          <h2 className="text-base sm:text-lg font-semibold text-carbon-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-carbon-300">00</span>
            Your Personalized Scale
          </h2>
          <div className="module">
            <div className="module-body">
              <ScaleTable scale={scale} highlightDegrees={[1, 4, 5]} />
            </div>
          </div>
        </motion.section>

        {/* Piano Keyboard */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mb-4 sm:mb-8"
        >
          <h2 className="text-base sm:text-lg font-semibold text-carbon-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-carbon-300">01</span>
            Your Scale on Piano
          </h2>
          <div className="module overflow-x-auto">
            <div className="module-body min-w-[500px] sm:min-w-0">
              <PianoKeyboard
                scale={scale}
                startOctave={Math.floor(input.f0 < 200 ? 2 : 3)}
                numOctaves={2}
              />
            </div>
          </div>
        </motion.section>

        {/* Staff Notation */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="mb-4 sm:mb-8"
        >
          <h2 className="text-base sm:text-lg font-semibold text-carbon-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-carbon-300">02</span>
            Staff Notation
          </h2>
          <div className="module overflow-x-auto">
            <div className="module-body">
              <StaffNotation
                scale={scale}
                title={`${input.nearestPitch} - Your Scale`}
              />
            </div>
          </div>
        </motion.section>

        {/* Drone Mixer */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 sm:mb-8"
        >
          <h2 className="text-base sm:text-lg font-semibold text-carbon-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-carbon-300">03</span>
            Hear Your Frequencies
          </h2>
          <DroneMixer scale={scale} f0={input.f0} />
        </motion.section>

        {/* Framework Sections */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-carbon-800 mb-3 sm:mb-4">
            Your Voice Across History
          </h2>

          {/* Pythagorean */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <FrameworkCard
              {...FRAMEWORK_INFO.pythagorean}
              defaultExpanded={true}
              insight={frameworks.pythagorean.insight}
            >
              <div className="space-y-4">
                <DataRow
                  label="Circle of Fifths"
                  value={frameworks.pythagorean.circlePosition.note}
                  sublabel={`Position ${frameworks.pythagorean.circlePosition.position}`}
                />

                <div className="pt-2">
                  <h4 className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-2">
                    Pure Intervals
                  </h4>
                  {Object.entries(frameworks.pythagorean.intervals).map(([key, interval]) => (
                    <IntervalRow
                      key={key}
                      name={interval.name}
                      hz={interval.hzFormatted}
                      ratio={interval.ratio}
                    />
                  ))}
                </div>

                <ConceptBox title="The Pythagorean Comma">
                  If you stack 12 perfect fifths, you should return to your starting note. But the math doesn't quite work: the difference is about {frameworks.pythagorean.comma.cents} cents. This tiny gap drove 2,000 years of tuning system development.
                </ConceptBox>
              </div>
            </FrameworkCard>
          </motion.div>

          {/* Vedic */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <FrameworkCard
              {...FRAMEWORK_INFO.vedic}
              insight={frameworks.vedic.insight}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cream-50 rounded p-3 border border-carbon-100">
                    <div className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-1">Saptak</div>
                    <div className="font-medium text-carbon-800">{frameworks.vedic.saptak.name}</div>
                    <div className="text-xs text-carbon-500 mt-1">{frameworks.vedic.saptak.quality}</div>
                    <div className="text-[10px] text-carbon-400 mt-1">Range: {frameworks.vedic.saptak.range}</div>
                  </div>
                  <div className="bg-cream-50 rounded p-3 border border-carbon-100">
                    <div className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-1">Chakra</div>
                    <div className="font-medium text-carbon-800">{frameworks.vedic.chakra.name}</div>
                    <div className="text-xs text-carbon-500 mt-1">Bija: {frameworks.vedic.chakra.bija}</div>
                  </div>
                </div>

                {/* Saptak context */}
                {frameworks.vedic.saptak.context && (
                  <ContextBox context={frameworks.vedic.saptak.context} />
                )}

                <ConceptBox title="On Sa Being Floating">
                  Unlike Western music's A=440 standard, Indian classical music has no universal pitch reference. The tradition explicitly teaches that the singer finds their own center. Your f0 becomes your Sa.
                </ConceptBox>

                {/* 22 Shruti Scale */}
                {frameworks.vedic.shruti && (
                  <div className="mt-4">
                    <ShrutiScale
                      shrutiData={frameworks.vedic.shruti}
                      f0={input.f0}
                    />
                  </div>
                )}

                {/* Shruti Harmony Mixer */}
                {frameworks.vedic.shruti && (
                  <div className="mt-4">
                    <ShrutiMixer
                      shrutiData={frameworks.vedic.shruti}
                      f0={input.f0}
                    />
                  </div>
                )}

                <ConceptBox title="On Chakras">
                  The chakra-frequency associations shown here are approximate guides based on traditional pitch-body mappings. They're not medical claims—think of them as a somatic vocabulary.
                </ConceptBox>
              </div>
            </FrameworkCard>
          </motion.div>

          {/* Gregorian */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <FrameworkCard
              {...FRAMEWORK_INFO.gregorian}
              insight={frameworks.gregorian.insight}
            >
              <div className="space-y-4">
                <div className="bg-cream-50 rounded p-3 border border-carbon-100">
                  <div className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-1">Mode</div>
                  <div className="font-medium text-carbon-800">{frameworks.gregorian.mode.name}</div>
                  <div className="text-sm text-carbon-600 mt-1">{frameworks.gregorian.mode.character}</div>
                  <div className="text-xs text-carbon-500 mt-1 italic">"{frameworks.gregorian.mode.affect}"</div>
                </div>

                {/* Mode context */}
                {frameworks.gregorian.mode.context && (
                  <ContextBox context={frameworks.gregorian.mode.context} />
                )}

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-2">
                    Organum Intervals
                  </h4>
                  <IntervalRow
                    name={frameworks.gregorian.organum.voxPrincipalis.role}
                    hz={frameworks.gregorian.organum.voxPrincipalis.hzFormatted}
                    ratio="1:1"
                  />
                  <IntervalRow
                    name={frameworks.gregorian.organum.parallelFourth.role}
                    hz={frameworks.gregorian.organum.parallelFourth.hzFormatted}
                    ratio={frameworks.gregorian.organum.parallelFourth.ratio}
                  />
                  <IntervalRow
                    name={frameworks.gregorian.organum.parallelFifth.role}
                    hz={frameworks.gregorian.organum.parallelFifth.hzFormatted}
                    ratio={frameworks.gregorian.organum.parallelFifth.ratio}
                  />
                </div>

                <ConceptBox title="Diabolus in Musica">
                  {frameworks.gregorian.diabolus.description}
                </ConceptBox>
              </div>
            </FrameworkCard>
          </motion.div>

          {/* Western */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <FrameworkCard
              {...FRAMEWORK_INFO.western}
              insight={frameworks.western.insight}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cream-50 rounded p-3 border border-carbon-100">
                    <div className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-1">Key Signature</div>
                    <div className="font-medium text-carbon-800">{frameworks.western.keySignature.key}</div>
                    <div className="text-xs text-carbon-500 mt-1">{frameworks.western.keySignature.signature}</div>
                  </div>
                  <div className="bg-cream-50 rounded p-3 border border-carbon-100">
                    <div className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-1">Vocal Range</div>
                    <div className="font-medium text-carbon-800">{frameworks.western.vocalCategory.category}</div>
                    <div className="text-xs text-carbon-500 mt-1">{frameworks.western.vocalCategory.range}</div>
                    {frameworks.western.vocalCategory.positionInRange !== undefined && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-carbon-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-signal-orange rounded-full"
                            style={{ width: `${frameworks.western.vocalCategory.positionInRange}%` }}
                          />
                        </div>
                        <div className="text-[9px] text-carbon-400 mt-0.5">
                          {frameworks.western.vocalCategory.positionInRange}% through range
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vocal category context */}
                {frameworks.western.vocalCategory.context && (
                  <ContextBox context={frameworks.western.vocalCategory.context} />
                )}

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-2">
                    I-IV-V Progression
                  </h4>
                  {['I', 'IV', 'V'].map((deg) => {
                    const chord = frameworks.western.I_IV_V[deg];
                    return (
                      <IntervalRow
                        key={deg}
                        name={`${chord.degree} (${chord.role})`}
                        hz={chord.hzFormatted}
                        ratio={chord.note}
                      />
                    );
                  })}
                </div>

                <ConceptBox title="On A=440">
                  {frameworks.western.a440.description}
                </ConceptBox>

                <ConceptBox title="Equal Temperament">
                  {frameworks.western.equalTemperament.description}
                </ConceptBox>
              </div>
            </FrameworkCard>
          </motion.div>

          {/* Tibetan */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <FrameworkCard
              {...FRAMEWORK_INFO.tibetan}
              insight={frameworks.tibetan.insight}
            >
              <div className="space-y-4">
                <div className="bg-cream-50 rounded p-3 border border-carbon-100">
                  <div className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-1">Bowl Equivalent</div>
                  <div className="font-medium text-carbon-800">{frameworks.tibetan.bowlEquivalent.size}</div>
                  <div className="text-xs text-carbon-500 mt-1">
                    {frameworks.tibetan.bowlEquivalent.diameter} • {frameworks.tibetan.bowlEquivalent.character}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-3">
                    Overtone Series
                  </h4>
                  <OvertoneChart overtones={frameworks.tibetan.overtones} />
                </div>

                <ConceptBox title="On Bowl Tuning Claims">
                  {frameworks.tibetan.bowlCaveat.description}
                </ConceptBox>
              </div>
            </FrameworkCard>
          </motion.div>

          {/* Neuroscience */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <FrameworkCard
              {...FRAMEWORK_INFO.neuroscience}
              insight={frameworks.neuroscience.insight}
            >
              <div className="space-y-4">
                <BrainwaveMap
                  f0={input.f0}
                  brainwaveMap={frameworks.neuroscience.brainwaveMap}
                />

                {/* Binaural Beat Mixer */}
                <div className="mt-4">
                  <h4 className="text-xs uppercase tracking-wider text-carbon-400 font-medium mb-3">
                    Create Binaural Beats
                  </h4>
                  <BinauralBeatMixer f0={input.f0} />
                </div>

                <ConceptBox title="On Entrainment">
                  {frameworks.neuroscience.entrainment.description}
                </ConceptBox>

                <ConceptBox title="On Vagal Tone">
                  {frameworks.neuroscience.vagalTone.description}
                </ConceptBox>

                <div className="bg-cream-100 rounded p-3 border border-cream-300">
                  <h4 className="text-xs font-semibold text-carbon-700 mb-2">
                    {frameworks.neuroscience.tryThis.title}
                  </h4>
                  <ol className="space-y-1">
                    {frameworks.neuroscience.tryThis.steps.map((step, i) => (
                      <li key={i} className="text-xs text-carbon-600 flex gap-2">
                        <span className="font-mono text-carbon-400">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </FrameworkCard>
          </motion.div>
        </section>

        {/* Tuning Comparison */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 sm:mt-8"
        >
          <h2 className="text-base sm:text-lg font-semibold text-carbon-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-carbon-300">06</span>
            Compare Tuning Standards
          </h2>
          <TuningSelector f0={input.f0} />
        </motion.section>

        {/* Math Verification */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-4 sm:mt-8"
        >
          <h2 className="text-base sm:text-lg font-semibold text-carbon-800 mb-3 sm:mb-4 flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-carbon-300">07</span>
            Verify the Math
          </h2>
          <MathVerification f0={input.f0} />
        </motion.section>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-carbon-200 text-center pb-8">
          <p className="text-xs sm:text-sm text-carbon-400">
            Physics, not mysticism. Your voice, contextualized.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-carbon-500 hover:text-carbon-800 active:text-carbon-900"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Explore other frequencies
          </Link>
        </footer>
      </main>
    </div>
  );
}
