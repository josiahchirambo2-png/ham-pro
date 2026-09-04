import type { LucideIcon } from "lucide-react";
import {
  Sprout, Microscope, Ruler, Laptop, Stethoscope, Cog, TrendingUp,
  Scale, Palette, Wheat, Languages,
} from "lucide-react";

export type Course = {
  id: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  greeting: string;
  subjects: readonly string[];
};

export const COURSES: readonly Course[] = [
  {
    id: "general",
    name: "General Learning",
    icon: Sprout,
    tagline: "A bit of everything — the classic KIT AI experience.",
    greeting: "Pick a tool below to keep growing your knowledge.",
    subjects: ["Mathematics", "English", "Science", "Social Studies"],
  },
  {
    id: "sciences",
    name: "Pure Sciences",
    icon: Microscope,
    tagline: "Physics, chemistry and biology, lab-first.",
    greeting: "Run an experiment, then let KIT explain the theory behind it.",
    subjects: ["Physics", "Chemistry", "Biology", "Environmental Science"],
  },
  {
    id: "maths",
    name: "Mathematics",
    icon: Ruler,
    tagline: "Numbers, proofs and problem solving.",
    greeting: "Work a problem step by step — KIT shows every line.",
    subjects: ["Algebra", "Geometry", "Calculus", "Statistics"],
  },
  {
    id: "computing",
    name: "Computer Science",
    icon: Laptop,
    tagline: "Code, algorithms and how machines think.",
    greeting: "Build, break and debug — KIT reviews your logic.",
    subjects: ["Programming", "Algorithms", "Databases", "Networks"],
  },
  {
    id: "medicine",
    name: "Medicine & Health",
    icon: Stethoscope,
    tagline: "Anatomy, physiology and clinical thinking.",
    greeting: "Study a system of the body, then test yourself on it.",
    subjects: ["Anatomy", "Physiology", "Biochemistry", "Public Health"],
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: Cog,
    tagline: "Mechanics, circuits and design.",
    greeting: "Model it, simulate it, then prove it with the maths.",
    subjects: ["Mechanics", "Electronics", "Thermodynamics", "Materials"],
  },
  {
    id: "business",
    name: "Business & Economics",
    icon: TrendingUp,
    tagline: "Markets, money and management.",
    greeting: "Ask KIT to turn any concept into a real-world example.",
    subjects: ["Economics", "Accounting", "Marketing", "Entrepreneurship"],
  },
  {
    id: "law",
    name: "Law & Civics",
    icon: Scale,
    tagline: "Rules, rights and reasoning.",
    greeting: "Argue both sides — KIT will challenge your reasoning.",
    subjects: ["Constitutional Law", "Civics", "Ethics", "Legal Writing"],
  },
  {
    id: "arts",
    name: "Arts & Literature",
    icon: Palette,
    tagline: "Stories, language and creative expression.",
    greeting: "Read closely, write boldly — KIT helps you edit.",
    subjects: ["Literature", "History", "Creative Writing", "Art"],
  },
  {
    id: "agriculture",
    name: "Agriculture",
    icon: Wheat,
    tagline: "Soil, crops, livestock and food systems.",
    greeting: "From seed to harvest — learn the science of growing.",
    subjects: ["Crop Science", "Soil Science", "Animal Husbandry", "Agribusiness"],
  },
  {
    id: "languages",
    name: "Languages",
    icon: Languages,
    tagline: "Speak, read and write in any language.",
    greeting: "Practise out loud — KIT speaks your language.",
    subjects: ["English", "French", "Bemba", "Nyanja"],
  },
] as const;

export function courseById(id: string): Course {
  return COURSES.find((c) => c.id === id) ?? COURSES[0]!;
}