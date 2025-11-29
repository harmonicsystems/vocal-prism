/**
 * Example Frequencies
 * Pre-defined examples spanning the vocal range
 */

export const EXAMPLES = [
  {
    f0: 130,
    label: "Bass",
    sublabel: "C3",
    description: "Deep, grounding bass voice",
    color: "framework-pythagorean"
  },
  {
    f0: 165,
    label: "Tenor",
    sublabel: "E3",
    description: "Versatile middle range",
    color: "framework-vedic"
  },
  {
    f0: 196,
    label: "Alto",
    sublabel: "G3",
    description: "Warm, centered voice",
    color: "framework-gregorian"
  },
  {
    f0: 220,
    label: "Mezzo",
    sublabel: "A3",
    description: "Bright, clear range",
    color: "framework-western"
  },
  {
    f0: 262,
    label: "Soprano",
    sublabel: "C4",
    description: "Higher, expressive voice",
    color: "framework-tibetan"
  }
];

// Framework metadata for display
export const FRAMEWORK_INFO = {
  pythagorean: {
    id: 'pythagorean',
    number: '01',
    title: 'Pythagorean',
    subtitle: '6th Century BCE',
    tagline: 'The birth of acoustic science',
    color: 'framework-pythagorean'
  },
  vedic: {
    id: 'vedic',
    number: '02',
    title: 'Vedic / Indian Classical',
    subtitle: 'c. 200 BCE',
    tagline: 'The voice-centered tradition',
    color: 'framework-vedic'
  },
  gregorian: {
    id: 'gregorian',
    number: '03',
    title: 'Gregorian / Medieval',
    subtitle: '9th Century CE',
    tagline: 'Sacred sound in the West',
    color: 'framework-gregorian'
  },
  western: {
    id: 'western',
    number: '04',
    title: 'Western Classical',
    subtitle: '1600s–Present',
    tagline: 'The common practice tradition',
    color: 'framework-western'
  },
  tibetan: {
    id: 'tibetan',
    number: '05',
    title: 'Tibetan / Overtone',
    subtitle: 'Ancient',
    tagline: 'The physics of resonance',
    color: 'framework-tibetan'
  },
  neuroscience: {
    id: 'neuroscience',
    number: '06',
    title: 'Neuroscience',
    subtitle: 'Modern',
    tagline: 'Brainwave entrainment',
    color: 'framework-neuroscience'
  }
};

export default EXAMPLES;
