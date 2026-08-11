// ---------------------------------------------------------------------------
// ECZ PAST PAPER BANK
// Hand-typed by Josiah Brian Chirambo from Examinations Council of Zambia
// past papers. Kept as a plain TypeScript array on purpose: no database call,
// no AI call, so past papers open instantly and work fully offline.
// ---------------------------------------------------------------------------

export type EczQuestion = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type EczPaper = {
  id: string;
  subject: string;
  level: "Grade 7" | "Grade 9" | "Grade 12";
  year: number;
  paper: string;
  questions: EczQuestion[];
};

export const ECZ_PAPERS: EczPaper[] = [
  {
    id: "math-g9-2019-p1",
    subject: "Mathematics",
    level: "Grade 9",
    year: 2019,
    paper: "Paper 1",
    questions: [
      { q: "Simplify: 3(2x - 4) + 5x", options: ["11x - 12", "6x - 12", "11x - 4", "8x - 12"], answer: 0, explanation: "6x - 12 + 5x = 11x - 12." },
      { q: "The ratio 45 minutes to 3 hours in its simplest form is", options: ["1 : 3", "1 : 4", "3 : 1", "15 : 60"], answer: 1, explanation: "45 : 180 divides by 45 to give 1 : 4." },
      { q: "Find the value of [x] if 2x - 7 = 15", options: ["4", "8", "11", "22"], answer: 2, explanation: "2x = 22, so x = 11." },
      { q: "A rectangle is 12 cm by 5 cm. Its perimeter is", options: ["17 cm", "34 cm", "60 cm", "48 cm"], answer: 1, explanation: "P = 2(12 + 5) = 34 cm." },
      { q: "Express 0.0045 in standard form", options: ["4.5 x 10^-3", "45 x 10^-4", "4.5 x 10^3", "0.45 x 10^-2"], answer: 0, explanation: "Move the point three places to give 4.5 x 10^-3." },
      { q: "The mean of 4, 7, 9 and 12 is", options: ["7", "8", "8.5", "9"], answer: 1, explanation: "32 divided by 4 equals 8." },
    ],
  },
  {
    id: "math-g12-2021-p1",
    subject: "Mathematics",
    level: "Grade 12",
    year: 2021,
    paper: "Paper 1",
    questions: [
      { q: "Given [f(x) = 3x^2 - 2x], find f'(x)", options: ["6x - 2", "3x - 2", "6x", "6x^2 - 2"], answer: 0, explanation: "Differentiate term by term to get 6x - 2." },
      { q: "Solve for x: log10 x = 2", options: ["10", "20", "100", "1000"], answer: 2, explanation: "x = 10^2 = 100." },
      { q: "The 10th term of the AP 5, 9, 13, ... is", options: ["37", "41", "45", "49"], answer: 1, explanation: "a + 9d = 5 + 36 = 41." },
      { q: "In a right angled triangle, the sides are 6 cm and 8 cm. The hypotenuse is", options: ["10 cm", "12 cm", "14 cm", "48 cm"], answer: 0, explanation: "By Pythagoras, the hypotenuse is 10 cm." },
      { q: "Probability of getting an even number on a fair die is", options: ["1/6", "1/3", "1/2", "2/3"], answer: 2, explanation: "Three of six outcomes are even." },
      { q: "The matrix determinant of [[3, 4], [1, 2]] is", options: ["2", "6", "10", "-2"], answer: 0, explanation: "3(2) - 4(1) = 2." },
    ],
  },
  {
    id: "sci-g9-2020-p1",
    subject: "Integrated Science",
    level: "Grade 9",
    year: 2020,
    paper: "Paper 1",
    questions: [
      { q: "Which gas is used by plants during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2, explanation: "Plants take in carbon dioxide and release oxygen." },
      { q: "The basic unit of life is the", options: ["Tissue", "Organ", "Cell", "Organism"], answer: 2, explanation: "All living things are made of cells." },
      { q: "Which of these is a good conductor of electricity?", options: ["Rubber", "Copper", "Wood", "Glass"], answer: 1, explanation: "Metals such as copper conduct electricity well." },
      { q: "The process by which a liquid changes into a gas is", options: ["Condensation", "Evaporation", "Sublimation", "Freezing"], answer: 1, explanation: "Evaporation turns a liquid into vapour." },
      { q: "Blood is pumped around the body by the", options: ["Lungs", "Liver", "Heart", "Kidney"], answer: 2, explanation: "The heart is the pump of the circulatory system." },
      { q: "The SI unit of force is the", options: ["Joule", "Watt", "Newton", "Pascal"], answer: 2, explanation: "Force is measured in newtons." },
    ],
  },
  {
    id: "bio-g12-2019-p1",
    subject: "Biology",
    level: "Grade 12",
    year: 2019,
    paper: "Paper 1",
    questions: [
      { q: "The site of protein synthesis in a cell is the", options: ["Ribosome", "Nucleus", "Mitochondrion", "Vacuole"], answer: 0, explanation: "Ribosomes assemble amino acids into proteins." },
      { q: "Which blood vessel carries oxygenated blood from the lungs?", options: ["Pulmonary artery", "Pulmonary vein", "Vena cava", "Aorta"], answer: 1, explanation: "The pulmonary vein returns oxygenated blood to the heart." },
      { q: "Insulin is produced by the", options: ["Liver", "Pancreas", "Kidney", "Thyroid"], answer: 1, explanation: "Beta cells of the pancreas secrete insulin." },
      { q: "Genetic information is carried by", options: ["RNA only", "Protein", "DNA", "Lipids"], answer: 2, explanation: "DNA carries the hereditary code." },
      { q: "Transpiration mainly occurs through the", options: ["Roots", "Stomata", "Xylem vessels", "Bark"], answer: 1, explanation: "Water vapour escapes through stomata in the leaf." },
      { q: "A food chain always begins with a", options: ["Herbivore", "Carnivore", "Producer", "Decomposer"], answer: 2, explanation: "Producers capture energy from the sun." },
    ],
  },
  {
    id: "eng-g9-2018-p1",
    subject: "English",
    level: "Grade 9",
    year: 2018,
    paper: "Paper 1",
    questions: [
      { q: "Choose the correct form: She ____ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1, explanation: "Third person singular takes goes." },
      { q: "The plural of 'child' is", options: ["childs", "childes", "children", "childrens"], answer: 2, explanation: "Children is an irregular plural." },
      { q: "Identify the adverb: He ran quickly to the shop.", options: ["He", "ran", "quickly", "shop"], answer: 2, explanation: "Quickly describes how he ran." },
      { q: "The opposite of 'generous' is", options: ["kind", "mean", "wealthy", "helpful"], answer: 1, explanation: "Mean is the antonym of generous." },
      { q: "Which sentence is punctuated correctly?", options: ["Where are you going.", "Where are you going?", "where are you going?", "Where, are you going"], answer: 1, explanation: "A direct question ends with a question mark." },
      { q: "'A blessing in disguise' means", options: ["a hidden gift", "a bad thing that turns out good", "a secret plan", "a costume"], answer: 1, explanation: "It describes misfortune with a good outcome." },
    ],
  },
  {
    id: "civ-g12-2020-p1",
    subject: "Civic Education",
    level: "Grade 12",
    year: 2020,
    paper: "Paper 1",
    questions: [
      { q: "Zambia gained independence in", options: ["1953", "1960", "1964", "1972"], answer: 2, explanation: "Zambia became independent on 24 October 1964." },
      { q: "The supreme law of Zambia is the", options: ["Penal Code", "Constitution", "Statutory Instrument", "By-law"], answer: 1, explanation: "All other laws must conform to the Constitution." },
      { q: "The arm of government that makes laws is the", options: ["Executive", "Judiciary", "Legislature", "Civil service"], answer: 2, explanation: "Parliament, the legislature, makes laws." },
      { q: "A right that cannot be taken away is called", options: ["a claim", "an inalienable right", "a privilege", "a duty"], answer: 1, explanation: "Inalienable rights are inherent to every person." },
      { q: "Voting in Zambia is open to citizens aged", options: ["16 and above", "18 and above", "21 and above", "25 and above"], answer: 1, explanation: "The voting age is 18." },
      { q: "Corruption is investigated in Zambia mainly by the", options: ["ECZ", "ACC", "ZRA", "DEC"], answer: 1, explanation: "The Anti Corruption Commission handles corruption cases." },
    ],
  },
  {
    id: "sci-g7-2019-p1",
    subject: "Integrated Science",
    level: "Grade 7",
    year: 2019,
    paper: "Composite",
    questions: [
      { q: "Which animal is a mammal?", options: ["Crocodile", "Cow", "Frog", "Eagle"], answer: 1, explanation: "Cows have hair and feed their young on milk." },
      { q: "Water boils at", options: ["50 degrees C", "80 degrees C", "100 degrees C", "120 degrees C"], answer: 2, explanation: "Pure water boils at 100 degrees Celsius at sea level." },
      { q: "The main source of light on earth is the", options: ["Moon", "Sun", "Stars", "Lamp"], answer: 1, explanation: "The sun supplies almost all natural light." },
      { q: "Plants make their food in the", options: ["Roots", "Stem", "Leaves", "Flowers"], answer: 2, explanation: "Leaves contain chlorophyll for photosynthesis." },
      { q: "Which of these is a renewable source of energy?", options: ["Coal", "Petrol", "Wind", "Diesel"], answer: 2, explanation: "Wind is naturally replenished." },
      { q: "A magnet attracts", options: ["Plastic", "Iron", "Paper", "Rubber"], answer: 1, explanation: "Magnets attract magnetic metals like iron." },
    ],
  },
];

export function eczSubjects(): string[] {
  return Array.from(new Set(ECZ_PAPERS.map((p) => p.subject))).sort();
}

export function findPaper(id: string): EczPaper | undefined {
  return ECZ_PAPERS.find((p) => p.id === id);
}
