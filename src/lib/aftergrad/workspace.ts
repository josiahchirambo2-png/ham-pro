import { DOCS, STAGES, ZMW_PER_USD, type Uni } from "./data";
import { DEFAULT_PROFILE } from "./match";

export type Costs = { tuition: number; accommodation: number; transport: number; food: number };
export type Stage = (typeof STAGES)[number];
export type Workspace = {
  profile: typeof DEFAULT_PROFILE & { course: string };
  saved: string[];
  stages: Record<string, Stage>;
  docs: Partial<Record<(typeof DOCS)[number], boolean>>;
  reminders: string[];
  tasks: { text: string; done: boolean }[];
  essay: string;
  costs: Costs;
};

export const EMPTY_WORKSPACE: Workspace = {
  profile: { ...DEFAULT_PROFILE, course: "" }, saved: [], stages: {}, docs: {}, reminders: [], tasks: [], essay: "",
  costs: { tuition: 26000, accommodation: 1200, transport: 300, food: 1000 },
};

export const nextSteps = ["Confirm entry requirements and deadlines on official sites", "Gather results, ID and recommendation letters", "Draft a personal statement", "Submit applications and save confirmations", "Prepare for interviews and follow up"];
export const yearlyCost = (c: Costs) => c.tuition + 12 * (c.accommodation + c.transport + c.food);
export const semesterFee = (u: Uni) => u.feesUSD * ZMW_PER_USD / 2;
export const kwacha = (n: number) => `K${Math.round(n).toLocaleString("en-ZM")}`;
export const universityKey = (id: string) => `u:${id}`;
export const scholarshipKey = (id: string) => `s:${id}`;
export const withinReminderWindow = (days: number) => days >= 0 && days <= 14;
