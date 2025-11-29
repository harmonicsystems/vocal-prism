/**
 * About Page
 * The "why" — demystification and context
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Prism } from '../components/Icons';

export default function About() {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="border-b border-carbon-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-carbon-500 hover:text-carbon-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Prism className="w-5 h-5 text-carbon-400" />
            <span className="font-medium text-carbon-700">About</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-carbon max-w-none"
        >
          <h1 className="text-3xl font-bold text-carbon-900 mb-6">
            About Vocal Prism
          </h1>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-carbon-800 mb-3">The Core Insight</h2>
            <p className="text-carbon-600 leading-relaxed">
              Your fundamental frequency (f0) is the natural pitch of your relaxed voice — the base note
              your vocal cords produce when you hum or speak. From this single number, we can derive your
              position in musical traditions spanning 3,000 years.
            </p>
            <p className="text-carbon-600 leading-relaxed mt-3">
              This isn't mysticism. It's math. Every calculation here is grounded in physics, musicology,
              and neuroscience. We're not making claims about healing frequencies or spiritual vibrations.
              We're showing you where your voice sits in the vast landscape of human musical knowledge.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-carbon-800 mb-3">Why This Exists</h2>
            <p className="text-carbon-600 leading-relaxed">
              The internet is full of frequency-related pseudoscience: "432 Hz is the frequency of the
              universe," "this tone heals your DNA," etc. Most of this is marketing nonsense built on
              misunderstandings of actual traditions.
            </p>
            <p className="text-carbon-600 leading-relaxed mt-3">
              The Vocal Prism exists to demystify. To show that the real relationships between your voice
              and music history are far more interesting than made-up claims. Pythagoras discovering that
              simple ratios create consonance? That's a genuine milestone in human knowledge. "528 Hz
              repairs DNA"? That's a sales pitch.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-carbon-800 mb-3">The Six Frameworks</h2>
            <ul className="space-y-3 text-carbon-600">
              <li>
                <strong className="text-carbon-800">Pythagorean (6th c. BCE):</strong> The discovery that
                simple mathematical ratios create musical consonance. This is the foundation of acoustic
                science.
              </li>
              <li>
                <strong className="text-carbon-800">Vedic/Indian Classical (c. 200 BCE):</strong> A
                voice-centered tradition where the singer's natural pitch becomes the tonic (Sa), and
                everything else relates to that center.
              </li>
              <li>
                <strong className="text-carbon-800">Gregorian/Medieval (9th c. CE):</strong> The modal
                system that gave emotional character to different scale patterns, plus the innovation of
                parallel harmony (organum).
              </li>
              <li>
                <strong className="text-carbon-800">Western Classical (1600s–present):</strong> The
                standardization of A=440 Hz and equal temperament, plus the vocabulary of key signatures
                and vocal ranges.
              </li>
              <li>
                <strong className="text-carbon-800">Tibetan/Overtone:</strong> The physics of resonance —
                how every pitched sound contains a series of overtones that explain consonance.
              </li>
              <li>
                <strong className="text-carbon-800">Neuroscience:</strong> How brainwave entrainment
                actually works (through beat frequencies, not magic numbers), and how vocalization affects
                the nervous system through vagal stimulation.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-carbon-800 mb-3">What This Isn't</h2>
            <ul className="space-y-2 text-carbon-600">
              <li>• <strong>Medical advice.</strong> We're not doctors. Consult professionals for health concerns.</li>
              <li>• <strong>Spiritual claims.</strong> We present the historical associations without endorsing them as truth.</li>
              <li>• <strong>Frequency healing.</strong> There's no scientific evidence that specific frequencies heal diseases.</li>
              <li>• <strong>A replacement for actual musical training.</strong> This is context, not instruction.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-carbon-800 mb-3">Design Philosophy</h2>
            <p className="text-carbon-600 leading-relaxed">
              Vocal Prism is designed with the aesthetic sensibility of Teenage Engineering and Telepathic
              Instruments — companies that prove tools can be beautiful, functional, and honest. No
              dark patterns. No mystification. No upsells. Just your voice, contextualized.
            </p>
          </section>

          <section className="bg-cream-200 rounded-lg p-6 border border-cream-300">
            <h3 className="font-semibold text-carbon-800 mb-2">Built by Harmonic Systems</h3>
            <p className="text-sm text-carbon-600">
              We build tools for exploring the intersection of music, science, and contemplative practice.
              Questions? Reach out at harmonicsystems.studio.
            </p>
          </section>
        </motion.article>

        <footer className="mt-12 pt-8 border-t border-carbon-200 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-carbon-500 hover:text-carbon-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </footer>
      </main>
    </div>
  );
}
