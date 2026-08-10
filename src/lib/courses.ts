export type Course = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  greeting: string;
  subjects: readonly string[];
};

export const COURSES: readonly Course[] = [
  {
    id: "general",
    name: "General Learning",
    emoji: "🌱",
    tagline: "A bit of everything — the classic HAM PRO experience.",
    greeting: "Pick a tool below to keep growing your knowledge.",
    subjects: ["Mathematics", "English", "Science", "Social Studies"],
  },
  {
    id: "sciences",
    name: "Pure Sciences",
    emoji: "🔬",
    tagline: "Physics, chemistry and biology, lab-first.",
    greeting: "Run an experiment, then let HAM explain the theory behind it.",
    subjects: ["Physics", "Chemistry", "Biology", "Environmental Science"],
  },
  {
    id: "maths",
    name: "Mathematics",
    emoji: "📐",
    tagline: "Numbers, proofs and problem solving.",
    greeting: "Work a problem step by step — HAM shows every line.",
    subjects: ["Algebra", "Geometry", "Calculus", "Statistics"],
  },
  {
    id: "computing",
    name: "Computer Science",
    emoji: "💻",
    tagline: "Code, algorithms and how machines think.",
    greeting: "Build, break and debug — HAM reviews your logic.",
    subjects: ["Programming", "Algorithms", "Databases", "Networks"],
  },
  {
    id: "medicine",
    name: "Medicine & Health",
    emoji: "🩺",
    tagline: "Anatomy, physiology and clinical thinking.",
    greeting: "Study a system of the body, then test yourself on it.",
    subjects: ["Anatomy", "Physiology", "Biochemistry", "Public Health"],
  },
  {
    id: "engineering",
    name: "Engineering",
    emoji: "⚙️",
    tagline: "Mechanics, circuits and design.",
    greeting: "Model it, simulate it, then prove it with the maths.",
    subjects: ["Mechanics", "Electronics", "Thermodynamics", "Materials"],
  },
  {
    id: "business",
    name: "Business & Economics",
    emoji: "📈",
    tagline: "Markets, money and management.",
    greeting: "Ask HAM to turn any concept into a real-world example.",
    subjects: ["Economics", "Accounting", "Marketing", "Entrepreneurship"],
  },
  {
    id: "law",
    name: "Law & Civics",
    emoji: "⚖️",
    tagline: "Rules, rights and reasoning.",
    greeting: "Argue both sides — HAM will challenge your reasoning.",
    subjects: ["Constitutional Law", "Civics", "Ethics", "Legal Writing"],
  },
  {
    id: "arts",
    name: "Arts & Literature",
    emoji: "🎨",
    tagline: "Stories, language and creative expression.",
    greeting: "Read closely, write boldly — HAM helps you edit.",
    subjects: ["Literature", "History", "Creative Writing", "Art"],
  },
  {
    id: "agriculture",
    name: "Agriculture",
    emoji: "🌾",
    tagline: "Soil, crops, livestock and food systems.",
    greeting: "From seed to harvest — learn the science of growing.",
    subjects: ["Crop Science", "Soil Science", "Animal Husbandry", "Agribusiness"],
  },
  {
    id: "languages",
    name: "Languages",
    emoji: "🗣️",
    tagline: "Speak, read and write in any language.",
    greeting: "Practise out loud — HAM speaks your language.",
    subjects: ["English", "French", "Bemba", "Nyanja"],
  },
] as const;

export function courseById(id: string): Course {
  return COURSES.find((c) => c.id === id) ?? COURSES[0]!;
}