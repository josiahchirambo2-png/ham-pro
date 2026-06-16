// Built-in question bank used when the device is offline so users can still
// take practice tests. Covers a few core subjects across primary, secondary,
// and university levels.

export type OfflineQuestion = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Bank = Record<string, OfflineQuestion[]>;

const MATH: OfflineQuestion[] = [
  { q: "What is 7 × 8?", options: ["54", "56", "64", "48"], answer: 1, explanation: "7 × 8 = 56." },
  { q: "Solve for x: 2x + 5 = 17", options: ["5", "6", "7", "8"], answer: 1, explanation: "2x = 12, so x = 6." },
  { q: "Area of a circle with radius 3?", options: ["6π", "9π", "12π", "3π"], answer: 1, explanation: "A = πr² = 9π." },
  { q: "Square root of 144?", options: ["10", "11", "12", "14"], answer: 2, explanation: "12 × 12 = 144." },
  { q: "Slope of y = 3x + 2?", options: ["2", "3", "1", "-3"], answer: 1, explanation: "The coefficient of x is the slope." },
  { q: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: 2, explanation: "0.15 × 200 = 30." },
  { q: "Sum of interior angles of a triangle?", options: ["90°", "180°", "270°", "360°"], answer: 1, explanation: "Always 180°." },
  { q: "Derivative of x²?", options: ["x", "2x", "x²", "2"], answer: 1, explanation: "d/dx[x²] = 2x." },
  { q: "Value of π to 2 dp?", options: ["3.12", "3.14", "3.16", "3.18"], answer: 1, explanation: "π ≈ 3.14." },
  { q: "Which is prime?", options: ["9", "15", "17", "21"], answer: 2, explanation: "17 is only divisible by 1 and itself." },
  { q: "Log base 10 of 1000?", options: ["2", "3", "4", "10"], answer: 1, explanation: "10³ = 1000." },
  { q: "Sin(30°)?", options: ["0", "0.5", "√3/2", "1"], answer: 1, explanation: "sin 30° = 1/2." },
];

const SCIENCE: OfflineQuestion[] = [
  { q: "Chemical symbol for water?", options: ["O₂", "H₂O", "CO₂", "NaCl"], answer: 1, explanation: "Two hydrogens and one oxygen." },
  { q: "Process plants use to make food?", options: ["Respiration", "Digestion", "Photosynthesis", "Osmosis"], answer: 2, explanation: "They convert sunlight, CO₂ and water into glucose." },
  { q: "Force pulling objects to Earth?", options: ["Friction", "Magnetism", "Gravity", "Tension"], answer: 2, explanation: "Gravity attracts mass." },
  { q: "Closest star to Earth?", options: ["Alpha Centauri", "Polaris", "The Sun", "Sirius"], answer: 2, explanation: "The Sun is our nearest star." },
  { q: "Unit of electric current?", options: ["Volt", "Watt", "Ampere", "Ohm"], answer: 2, explanation: "Current is measured in amperes (A)." },
  { q: "Largest organ in the human body?", options: ["Liver", "Skin", "Lungs", "Brain"], answer: 1, explanation: "Skin is the largest organ." },
  { q: "Gas most needed for human breathing?", options: ["Nitrogen", "Oxygen", "Carbon dioxide", "Helium"], answer: 1, explanation: "We breathe in oxygen." },
  { q: "Speed of light (approx)?", options: ["3×10⁵ m/s", "3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s"], answer: 2, explanation: "c ≈ 3×10⁸ m/s." },
  { q: "pH of a neutral solution?", options: ["0", "7", "10", "14"], answer: 1, explanation: "Neutral pH is 7." },
  { q: "How many bones in an adult human?", options: ["106", "186", "206", "306"], answer: 2, explanation: "An adult human skeleton has 206 bones." },
  { q: "Powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Vacuole"], answer: 1, explanation: "Mitochondria produce ATP." },
  { q: "Atomic number of carbon?", options: ["4", "6", "8", "12"], answer: 1, explanation: "Carbon has 6 protons." },
];

const ENGLISH: OfflineQuestion[] = [
  { q: "Which is a noun?", options: ["Quickly", "Beautiful", "School", "Run"], answer: 2, explanation: "School is a person, place or thing." },
  { q: "Antonym of 'happy'?", options: ["Joyful", "Sad", "Glad", "Merry"], answer: 1, explanation: "Sad is the opposite of happy." },
  { q: "Plural of 'child'?", options: ["Childs", "Childes", "Children", "Childer"], answer: 2, explanation: "Children is irregular plural." },
  { q: "Past tense of 'go'?", options: ["Goed", "Went", "Gone", "Going"], answer: 1, explanation: "Went is the simple past." },
  { q: "Which is a complete sentence?", options: ["Running fast.", "The dog barked.", "Under the bed.", "After lunch."], answer: 1, explanation: "It has a subject and a verb." },
  { q: "Synonym of 'big'?", options: ["Tiny", "Large", "Slim", "Quick"], answer: 1, explanation: "Large means big." },
  { q: "'I ___ tired.' Fill in.", options: ["are", "am", "is", "be"], answer: 1, explanation: "I am tired." },
  { q: "Which word is an adjective?", options: ["Slowly", "Bright", "Jump", "Cat"], answer: 1, explanation: "Bright describes a noun." },
  { q: "Punctuation that ends a question?", options: [".", "!", "?", ","], answer: 2, explanation: "A question mark ends questions." },
  { q: "Which is a pronoun?", options: ["She", "Quick", "Table", "Sing"], answer: 0, explanation: "She replaces a noun." },
];

const HISTORY: OfflineQuestion[] = [
  { q: "Year Zambia gained independence?", options: ["1953", "1960", "1964", "1972"], answer: 2, explanation: "Zambia became independent on 24 October 1964." },
  { q: "First president of Zambia?", options: ["Levy Mwanawasa", "Kenneth Kaunda", "Frederick Chiluba", "Rupiah Banda"], answer: 1, explanation: "Dr. Kenneth Kaunda." },
  { q: "World War II ended in?", options: ["1918", "1939", "1945", "1950"], answer: 2, explanation: "WWII ended in 1945." },
  { q: "Great Wall is in which country?", options: ["Japan", "China", "India", "Mongolia"], answer: 1, explanation: "The Great Wall is in China." },
  { q: "Who discovered penicillin?", options: ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Isaac Newton"], answer: 1, explanation: "Fleming, in 1928." },
  { q: "Victoria Falls is on which river?", options: ["Nile", "Congo", "Zambezi", "Limpopo"], answer: 2, explanation: "On the Zambezi River." },
  { q: "Pyramids of Giza are in?", options: ["Sudan", "Egypt", "Libya", "Morocco"], answer: 1, explanation: "They are in Egypt." },
  { q: "Berlin Wall fell in?", options: ["1979", "1985", "1989", "1991"], answer: 2, explanation: "It fell in November 1989." },
];

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const BANK: Bank = {
  math: MATH,
  mathematics: MATH,
  algebra: MATH,
  science: SCIENCE,
  physics: SCIENCE,
  chemistry: SCIENCE,
  biology: SCIENCE,
  english: ENGLISH,
  language: ENGLISH,
  history: HISTORY,
  social: HISTORY,
  geography: HISTORY,
};

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getOfflineQuestions(subject: string, count: number): OfflineQuestion[] {
  const key = norm(subject);
  let pool: OfflineQuestion[] | undefined;
  for (const k of Object.keys(BANK)) {
    if (key.includes(k)) { pool = BANK[k]; break; }
  }
  if (!pool) pool = [...MATH, ...SCIENCE, ...ENGLISH, ...HISTORY];
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}