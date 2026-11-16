// After Graduation demo data. Fees and deadlines are ESTIMATES unless `verified` is true.
// Always check the official website before applying.
export type Country = "Zambia" | "South Africa" | "UK" | "USA" | "China" | "India" | "Canada" | "Australia" | "Germany" | "Japan" | "International";
export type Mode = "On-campus" | "Distance" | "Online";
export type Uni = {
  id: string; name: string; short: string; country: Country; city: string; type: "Public" | "Private";
  courses: string[]; fields: string[]; minPoints: number; // ECZ best-6 points (lower = better), 6 best
  requirements: string; feesUSD: number; // estimated tuition per year in USD
  intakes: ("January" | "July" | "September")[]; modes: Mode[]; deadline: string; scholarships: string[];
  website: string; verified: boolean;
};

const U = (u: Uni) => u;
export const UNIVERSITIES: Uni[] = [
  U({ id: "unza", name: "University of Zambia", short: "UNZA", country: "Zambia", city: "Lusaka", type: "Public",
    courses: ["Medicine (MBChB)", "Law", "Engineering", "Computer Science", "Education", "Agriculture", "Economics", "Nursing"],
    fields: ["medicine", "law", "engineering", "computing", "education", "agriculture", "business", "health"],
    minPoints: 12, requirements: "5 O-level credits incl. English and Maths; Natural Sciences need Biology, Chemistry, Physics credits.",
    feesUSD: 1300, intakes: ["January"], modes: ["On-campus", "Distance"], deadline: "2027-03-31",
    scholarships: ["helsb", "unza-merit"], website: "https://www.unza.zm", verified: false }),
  U({ id: "cbu", name: "Copperbelt University", short: "CBU", country: "Zambia", city: "Kitwe", type: "Public",
    courses: ["Mining Engineering", "Civil Engineering", "Accountancy", "Medicine", "Architecture", "ICT", "Forestry"],
    fields: ["engineering", "business", "medicine", "computing", "agriculture"],
    minPoints: 14, requirements: "5 credits incl. English, Maths and Physics for engineering programmes.",
    feesUSD: 1200, intakes: ["January"], modes: ["On-campus", "Distance"], deadline: "2027-03-15",
    scholarships: ["helsb"], website: "https://www.cbu.ac.zm", verified: false }),
  U({ id: "mu", name: "Mulungushi University", short: "MU", country: "Zambia", city: "Kabwe", type: "Public",
    courses: ["Business Administration", "Agriculture", "Education", "Medicine", "Social Sciences", "ICT"],
    fields: ["business", "agriculture", "education", "medicine", "computing", "social"],
    minPoints: 18, requirements: "5 credits incl. English; Maths for business and science programmes.",
    feesUSD: 1000, intakes: ["January", "July"], modes: ["On-campus", "Distance"], deadline: "2027-04-30",
    scholarships: ["helsb"], website: "https://www.mu.ac.zm", verified: false }),
  U({ id: "zcas", name: "ZCAS University", short: "ZCAS", country: "Zambia", city: "Lusaka", type: "Private",
    courses: ["Accountancy (ACCA)", "Computer Science", "Data Science", "Law", "Economics", "Banking & Finance"],
    fields: ["business", "computing", "law"],
    minPoints: 20, requirements: "5 credits incl. English and Maths.",
    feesUSD: 2200, intakes: ["January", "July"], modes: ["On-campus", "Online"], deadline: "2027-05-31",
    scholarships: ["zcas-bursary"], website: "https://www.zcasu.edu.zm", verified: false }),
  U({ id: "cavendish", name: "Cavendish University Zambia", short: "Cavendish", country: "Zambia", city: "Lusaka", type: "Private",
    courses: ["Medicine", "Nursing", "Law", "Business", "Public Health", "IT"],
    fields: ["medicine", "health", "law", "business", "computing"],
    minPoints: 22, requirements: "5 credits incl. English; Biology and Chemistry for health programmes.",
    feesUSD: 2600, intakes: ["January", "July"], modes: ["On-campus", "Distance", "Online"], deadline: "2027-06-30",
    scholarships: [], website: "https://www.cavendish.co.zm", verified: false }),
  U({ id: "lamu", name: "Lusaka Apex Medical University", short: "LAMU", country: "Zambia", city: "Lusaka", type: "Private",
    courses: ["Medicine (MBChB)", "Pharmacy", "Nursing", "Physiotherapy", "Biomedical Sciences"],
    fields: ["medicine", "health"],
    minPoints: 16, requirements: "Credits in Biology, Chemistry, Physics or Science, Maths and English.",
    feesUSD: 5500, intakes: ["January"], modes: ["On-campus"], deadline: "2027-02-28",
    scholarships: [], website: "https://www.lamu.edu.zm", verified: false }),
  U({ id: "unilus", name: "University of Lusaka", short: "UNILUS", country: "Zambia", city: "Lusaka", type: "Private",
    courses: ["Law", "Business", "Medicine", "Public Health", "Social Work"],
    fields: ["law", "business", "medicine", "health", "social"],
    minPoints: 24, requirements: "5 credits incl. English.",
    feesUSD: 2400, intakes: ["January", "July"], modes: ["On-campus", "Distance"], deadline: "2027-06-15",
    scholarships: [], website: "https://www.unilus.ac.zm", verified: false }),
  U({ id: "kmu", name: "Kwame Nkrumah University", short: "KNU", country: "Zambia", city: "Kabwe", type: "Public",
    courses: ["Education", "Natural Sciences", "Languages", "Business"],
    fields: ["education", "science", "social", "business"],
    minPoints: 26, requirements: "5 credits incl. English and two teaching subjects.",
    feesUSD: 800, intakes: ["January"], modes: ["On-campus", "Distance"], deadline: "2027-04-15",
    scholarships: ["helsb"], website: "https://www.nkrumah.edu.zm", verified: false }),
  U({ id: "chau", name: "Chalimbana University", short: "ChaU", country: "Zambia", city: "Chongwe", type: "Public",
    courses: ["Education", "Early Childhood", "Special Education"], fields: ["education"],
    minPoints: 28, requirements: "5 credits incl. English.", feesUSD: 700, intakes: ["January"], modes: ["On-campus", "Distance"],
    deadline: "2027-04-15", scholarships: ["helsb"], website: "https://www.chau.ac.zm", verified: false }),
  U({ id: "uct", name: "University of Cape Town", short: "UCT", country: "South Africa", city: "Cape Town", type: "Public",
    courses: ["Medicine", "Engineering", "Computer Science", "Commerce", "Law"], fields: ["medicine", "engineering", "computing", "business", "law"],
    minPoints: 8, requirements: "Strong A-grade results; NBT tests; English proficiency.", feesUSD: 5000, intakes: ["January"], modes: ["On-campus"],
    deadline: "2026-07-31", scholarships: ["mastercard"], website: "https://www.uct.ac.za", verified: false }),
  U({ id: "wits", name: "University of the Witwatersrand", short: "Wits", country: "South Africa", city: "Johannesburg", type: "Public",
    courses: ["Mining Engineering", "Medicine", "Actuarial Science", "Architecture"], fields: ["engineering", "medicine", "business"],
    minPoints: 9, requirements: "High results in Maths and Physical Science.", feesUSD: 4500, intakes: ["January"], modes: ["On-campus"],
    deadline: "2026-09-30", scholarships: [], website: "https://www.wits.ac.za", verified: false }),
  U({ id: "edinburgh", name: "University of Edinburgh", short: "Edinburgh", country: "UK", city: "Edinburgh", type: "Public",
    courses: ["Medicine", "Informatics", "Law", "Economics", "Veterinary"], fields: ["medicine", "computing", "law", "business"],
    minPoints: 7, requirements: "Grade 12 plus Foundation year or A-levels; IELTS 6.5+.", feesUSD: 32000, intakes: ["September"], modes: ["On-campus"],
    deadline: "2027-01-29", scholarships: ["commonwealth"], website: "https://www.ed.ac.uk", verified: false }),
  U({ id: "mit", name: "Massachusetts Institute of Technology", short: "MIT", country: "USA", city: "Cambridge, MA", type: "Private",
    courses: ["Engineering", "Computer Science", "Physics", "Mathematics"], fields: ["engineering", "computing", "science"],
    minPoints: 6, requirements: "Top results; SAT optional/required per year; essays; need-blind aid for internationals.", feesUSD: 60000, intakes: ["September"], modes: ["On-campus"],
    deadline: "2027-01-05", scholarships: ["mit-aid"], website: "https://mitadmissions.org", verified: false }),
  U({ id: "tsinghua", name: "Tsinghua University", short: "Tsinghua", country: "China", city: "Beijing", type: "Public",
    courses: ["Engineering", "Computer Science", "Architecture", "Economics"], fields: ["engineering", "computing", "business"],
    minPoints: 8, requirements: "Strong results; English or Chinese programme test.", feesUSD: 4500, intakes: ["September"], modes: ["On-campus"],
    deadline: "2027-03-01", scholarships: ["csc"], website: "https://www.tsinghua.edu.cn/en", verified: false }),
  U({ id: "amity", name: "Amity University", short: "Amity", country: "India", city: "Noida", type: "Private",
    courses: ["Engineering", "Pharmacy", "Business", "Computer Applications"], fields: ["engineering", "health", "business", "computing"],
    minPoints: 22, requirements: "Grade 12 certificate, 55%+ average.", feesUSD: 4000, intakes: ["July"], modes: ["On-campus", "Online"],
    deadline: "2027-05-31", scholarships: ["iccr"], website: "https://www.amity.edu", verified: false }),
  U({ id: "toronto", name: "University of Toronto", short: "UofT", country: "Canada", city: "Toronto", type: "Public",
    courses: ["Engineering", "Computer Science", "Life Sciences", "Commerce"], fields: ["engineering", "computing", "science", "business"],
    minPoints: 7, requirements: "Strong final results; English test.", feesUSD: 45000, intakes: ["September"], modes: ["On-campus"],
    deadline: "2027-01-15", scholarships: ["lester-pearson"], website: "https://www.utoronto.ca", verified: false }),
  U({ id: "melbourne", name: "University of Melbourne", short: "Melbourne", country: "Australia", city: "Melbourne", type: "Public",
    courses: ["Biomedicine", "Engineering", "Commerce", "Science"], fields: ["medicine", "engineering", "business", "science"],
    minPoints: 9, requirements: "Foundation year often required; IELTS 6.5.", feesUSD: 35000, intakes: ["January", "July"], modes: ["On-campus"],
    deadline: "2026-11-30", scholarships: ["australia-awards"], website: "https://www.unimelb.edu.au", verified: false }),
];

export type Coverage = "Full" | "Partial" | "Tuition Only";
export type Category = "Government" | "University" | "International" | "NGO / Church / Company" | "Girls in STEM" | "Orphans & Vulnerable";
export type Scholarship = {
  id: string; name: string; provider: string; category: Category; coverage: Coverage; amount: string; country: Country;
  level: ("Undergraduate" | "Diploma" | "Postgraduate")[]; deadline: string; requirements: string[];
  maxAge?: number; maxPoints?: number; nationality?: "Zambian" | "African" | "Any"; maxIncomeZMW?: number;
  fields?: string[]; femaleOnly?: boolean; vulnerable?: boolean; website: string; verified: boolean;
};

export const SCHOLARSHIPS: Scholarship[] = [
  { id: "helsb", name: "HELSB Loans & Scholarships", provider: "Higher Education Loans and Scholarships Board", category: "Government", coverage: "Full",
    amount: "Tuition + upkeep (loan / scholarship)", country: "Zambia", level: ["Undergraduate"], deadline: "2027-03-31",
    requirements: ["Zambian citizen with NRC", "Admitted to a public university", "Grade 12 certificate", "Proof of financial need"],
    maxPoints: 30, nationality: "Zambian", maxIncomeZMW: 15000, website: "https://www.helsb.gov.zm", verified: false },
  { id: "unza-merit", name: "UNZA Vice-Chancellor Merit Award", provider: "University of Zambia", category: "University", coverage: "Tuition Only",
    amount: "Up to 100% tuition", country: "Zambia", level: ["Undergraduate"], deadline: "2027-04-15",
    requirements: ["Best-6 points of 10 or better", "Admitted to UNZA"], maxPoints: 10, nationality: "Zambian", website: "https://www.unza.zm", verified: false },
  { id: "zcas-bursary", name: "ZCAS University Bursary", provider: "ZCAS University", category: "University", coverage: "Partial",
    amount: "25–50% of tuition", country: "Zambia", level: ["Undergraduate", "Diploma"], deadline: "2027-05-31",
    requirements: ["Admitted to ZCAS", "Good Grade 12 results"], maxPoints: 18, website: "https://www.zcasu.edu.zm", verified: false },
  { id: "mastercard", name: "Mastercard Foundation Scholars Program", provider: "Mastercard Foundation", category: "International", coverage: "Full",
    amount: "Tuition, housing, travel, stipend", country: "International", level: ["Undergraduate", "Postgraduate"], deadline: "2027-01-31",
    requirements: ["African citizen", "Strong academics", "Financial need", "Commitment to giving back"],
    maxPoints: 14, nationality: "African", maxIncomeZMW: 20000, website: "https://mastercardfdn.org/all/scholars/", verified: false },
  { id: "chevening", name: "Chevening Scholarship", provider: "UK Government", category: "International", coverage: "Full",
    amount: "Full master's funding in the UK", country: "UK", level: ["Postgraduate"], deadline: "2026-11-05",
    requirements: ["Undergraduate degree", "2 years work experience", "Return home after study"], nationality: "Any", website: "https://www.chevening.org", verified: false },
  { id: "commonwealth", name: "Commonwealth Scholarships", provider: "CSC UK", category: "International", coverage: "Full",
    amount: "Tuition, airfare, living allowance", country: "UK", level: ["Postgraduate"], deadline: "2026-10-15",
    requirements: ["Commonwealth citizen", "First degree (2:1)", "Financial need"], nationality: "Any", website: "https://cscuk.fcdo.gov.uk", verified: false },
  { id: "daad", name: "DAAD Scholarships", provider: "German Academic Exchange Service", category: "International", coverage: "Full",
    amount: "€934/month + insurance + travel", country: "Germany", level: ["Postgraduate"], deadline: "2026-10-31",
    requirements: ["Bachelor's degree", "Development-related field", "Work experience"], nationality: "Any", website: "https://www.daad.de/en/", verified: false },
  { id: "mext", name: "MEXT Japanese Government Scholarship", provider: "Government of Japan", category: "International", coverage: "Full",
    amount: "Tuition + ¥117,000/month + airfare", country: "Japan", level: ["Undergraduate", "Postgraduate"], deadline: "2027-05-15",
    requirements: ["Aged 17–25 (undergraduate)", "Excellent results in Maths and Sciences", "Pass embassy exams"], maxAge: 25, maxPoints: 12, nationality: "Any", website: "https://www.studyinjapan.go.jp", verified: false },
  { id: "csc", name: "Chinese Government Scholarship", provider: "China Scholarship Council", category: "International", coverage: "Full",
    amount: "Tuition, housing, stipend", country: "China", level: ["Undergraduate", "Postgraduate"], deadline: "2027-03-31",
    requirements: ["Under 25 for undergraduate", "Good health", "Strong results"], maxAge: 25, maxPoints: 18, nationality: "Any", website: "https://www.campuschina.org", verified: false },
  { id: "iccr", name: "ICCR Africa Scholarship", provider: "Government of India", category: "International", coverage: "Full",
    amount: "Tuition + monthly allowance", country: "India", level: ["Undergraduate", "Postgraduate"], deadline: "2027-04-30",
    requirements: ["African citizen", "Aged 18–30", "English proficiency"], maxAge: 30, nationality: "African", website: "https://a2ascholarships.iccr.gov.in", verified: false },
  { id: "australia-awards", name: "Australia Awards Africa", provider: "Australian Government", category: "International", coverage: "Full",
    amount: "Full master's funding", country: "Australia", level: ["Postgraduate"], deadline: "2027-02-28",
    requirements: ["Zambian or eligible African citizen", "Degree + work experience"], nationality: "African", website: "https://www.australiaawardsafrica.org", verified: false },
  { id: "lester-pearson", name: "Lester B. Pearson International Scholarship", provider: "University of Toronto", category: "University", coverage: "Full",
    amount: "Tuition, books, residence (4 years)", country: "Canada", level: ["Undergraduate"], deadline: "2026-11-07",
    requirements: ["Exceptional results", "School nomination", "Leadership"], maxPoints: 7, maxAge: 20, website: "https://future.utoronto.ca/pearson", verified: false },
  { id: "mit-aid", name: "MIT Need-Based Financial Aid", provider: "MIT", category: "University", coverage: "Full",
    amount: "Covers full demonstrated need", country: "USA", level: ["Undergraduate"], deadline: "2027-01-05",
    requirements: ["Admission to MIT", "Family income documentation"], maxPoints: 6, website: "https://sfs.mit.edu", verified: false },
  { id: "camfed", name: "CAMFED Secondary-to-Tertiary Support", provider: "CAMFED Zambia", category: "NGO / Church / Company", coverage: "Partial",
    amount: "Fees and learning materials", country: "Zambia", level: ["Diploma", "Undergraduate"], deadline: "2027-02-15",
    requirements: ["Young woman from rural Zambia", "Financial need"], femaleOnly: true, nationality: "Zambian", maxIncomeZMW: 6000, website: "https://camfed.org", verified: false },
  { id: "fqm", name: "First Quantum Minerals Bursary", provider: "First Quantum Minerals", category: "NGO / Church / Company", coverage: "Full",
    amount: "Tuition + allowance", country: "Zambia", level: ["Undergraduate"], deadline: "2027-03-01",
    requirements: ["From North-Western Province", "Engineering, mining or geology", "Best-6 of 15 or better"], maxPoints: 15, fields: ["engineering", "science"], nationality: "Zambian", website: "https://www.first-quantum.com", verified: false },
  { id: "catholic", name: "Catholic Diocese Education Fund", provider: "Zambia Conference of Catholic Bishops", category: "NGO / Church / Company", coverage: "Partial",
    amount: "Up to 50% tuition", country: "Zambia", level: ["Diploma", "Undergraduate"], deadline: "2027-04-01",
    requirements: ["Parish recommendation letter", "Financial need"], nationality: "Zambian", maxIncomeZMW: 10000, website: "https://www.zccb.org.zm", verified: false },
  { id: "stem-girls", name: "Girls in STEM Scholarship", provider: "Women in STEM Zambia (demo)", category: "Girls in STEM", coverage: "Tuition Only",
    amount: "Full tuition for STEM degree", country: "Zambia", level: ["Undergraduate"], deadline: "2027-03-20",
    requirements: ["Female", "Credits in Maths and a Science", "STEM course"], femaleOnly: true, maxPoints: 20, fields: ["engineering", "computing", "science", "medicine"], nationality: "Zambian", website: "https://www.moe.gov.zm", verified: false },
  { id: "ovc", name: "Social Cash Transfer OVC Bursary", provider: "Ministry of Community Development (demo)", category: "Orphans & Vulnerable", coverage: "Full",
    amount: "Tuition + upkeep", country: "Zambia", level: ["Diploma", "Undergraduate"], deadline: "2027-02-28",
    requirements: ["Orphan or vulnerable student", "Social welfare letter", "Zambian citizen"], vulnerable: true, nationality: "Zambian", maxIncomeZMW: 4000, website: "https://www.mcdss.gov.zm", verified: false },
];

export const CAREERS = [
  { degree: "Medicine (MBChB)", field: "medicine", jobs: ["Medical Officer", "Surgeon", "Public Health Specialist"], salaryZMW: "K18,000 – K45,000 / month", skills: ["Clinical reasoning", "Empathy", "Biology & Chemistry"] },
  { degree: "Computer Science", field: "computing", jobs: ["Software Developer", "Data Analyst", "Cybersecurity Officer"], salaryZMW: "K8,000 – K30,000 / month", skills: ["Programming", "Problem solving", "Maths"] },
  { degree: "Mining / Civil Engineering", field: "engineering", jobs: ["Mining Engineer", "Site Engineer", "Project Manager"], salaryZMW: "K12,000 – K40,000 / month", skills: ["Physics & Maths", "AutoCAD", "Safety management"] },
  { degree: "Accountancy", field: "business", jobs: ["Accountant", "Auditor", "Tax Consultant"], salaryZMW: "K7,000 – K25,000 / month", skills: ["Excel", "ZICA / ACCA", "Attention to detail"] },
  { degree: "Law", field: "law", jobs: ["Advocate", "Legal Officer", "Magistrate"], salaryZMW: "K9,000 – K35,000 / month", skills: ["Writing", "Public speaking", "Research"] },
  { degree: "Education", field: "education", jobs: ["Secondary Teacher", "Lecturer", "Education Officer"], salaryZMW: "K6,000 – K14,000 / month", skills: ["Communication", "Patience", "Subject mastery"] },
  { degree: "Agriculture", field: "agriculture", jobs: ["Agronomist", "Extension Officer", "Farm Manager"], salaryZMW: "K6,000 – K18,000 / month", skills: ["Biology", "Soil science", "Business sense"] },
  { degree: "Nursing", field: "health", jobs: ["Registered Nurse", "Midwife", "Clinical Officer"], salaryZMW: "K7,000 – K15,000 / month", skills: ["Care", "Biology", "Teamwork"] },
];

export const SUBJECT_TO_DEGREES: Record<string, string[]> = {
  biology: ["Medicine", "Nursing", "Pharmacy", "Agriculture", "Biomedical Sciences", "Environmental Science"],
  chemistry: ["Pharmacy", "Medicine", "Chemical Engineering", "Metallurgy", "Food Science"],
  physics: ["Engineering", "Mining Engineering", "Architecture", "Physics", "Aviation"],
  mathematics: ["Engineering", "Computer Science", "Actuarial Science", "Accountancy", "Economics", "Statistics"],
  english: ["Law", "Journalism", "Education", "Social Work", "Public Relations"],
  geography: ["Environmental Science", "Urban Planning", "Geology", "Land Economics"],
  history: ["Law", "Political Science", "Education", "Development Studies"],
  commerce: ["Business Administration", "Accountancy", "Banking & Finance", "Marketing"],
  "computer studies": ["Computer Science", "ICT", "Data Science", "Software Engineering"],
  "religious education": ["Theology", "Social Work", "Education", "Counselling"],
  "civic education": ["Law", "Public Administration", "Political Science"],
  "agricultural science": ["Agriculture", "Animal Science", "Agribusiness", "Forestry"],
};

export const INTERVIEW_QS = [
  ["Tell us about yourself.", "Give a 60-second story: where you're from, what you study, one achievement, and why you want this scholarship."],
  ["Why do you deserve this scholarship?", "Link your results, your need and your goals. Show how the scholarship multiplies your impact on your community."],
  ["Why did you choose this course?", "Mention a real moment that sparked your interest, then the problem you want to solve with it."],
  ["What are your career goals?", "Give a 5-year and 10-year goal, and connect them to Zambia's development."],
  ["Describe a challenge you overcame.", "Use STAR: Situation, Task, Action, Result. End with what you learned."],
  ["What are your strengths and weaknesses?", "Pick a real weakness and show the steps you're taking to improve it."],
  ["How will you give back to your community?", "Be specific: a club, mentorship, project or business idea with a target group."],
  ["Tell us about a leadership experience.", "Prefect, club, church or family responsibility — focus on what you changed."],
  ["What will you do if you don't get this scholarship?", "Show resilience: other applications, work, or a plan to reapply stronger."],
  ["Do you have any questions for us?", "Ask about mentorship, alumni networks or how scholars are supported."],
];

export const INTERNSHIPS = [
  { title: "School Tutoring Assistant", org: "Local secondary schools", place: "Any town", pay: "K800 – K1,500 / month", type: "Part-time" },
  { title: "Data Entry Clerk (gap year)", org: "ZAMSTATS field projects", place: "Lusaka / provinces", pay: "Daily allowance", type: "Contract" },
  { title: "Customer Service Intern", org: "Mobile network shops", place: "Lusaka, Kitwe, Ndola", pay: "K1,500 / month", type: "Internship" },
  { title: "Farm Assistant", org: "Commercial farms", place: "Mkushi, Chisamba", pay: "K1,200 / month", type: "Seasonal" },
  { title: "Volunteer — Health Outreach", org: "NGOs & clinics", place: "Countrywide", pay: "Certificate + transport", type: "Volunteer" },
  { title: "Junior Web Helper", org: "Freelance / small businesses", place: "Remote", pay: "Per project", type: "Freelance" },
];

export const STORIES = [
  { name: "Mwila C.", from: "Kasama", award: "Mastercard Foundation Scholar", advice: "Start your essay early and ask a teacher to read it three times. Tell your real story, not what you think they want." },
  { name: "Thandiwe B.", from: "Chipata", award: "Girls in STEM — Engineering", advice: "Get your NRC and certified results ready before deadlines open. Most people lose out on paperwork, not grades." },
  { name: "Joseph M.", from: "Kitwe", award: "Chinese Government Scholarship", advice: "Apply to several scholarships at once. I got rejected twice before I got China." },
];
export const STORIES_NOTE = "Illustrative stories based on common Zambian scholar experiences (demo).";

export const DOCS = ["NRC", "Grade 12 Results", "Passport Photo", "Recommendation Letter", "Personal Statement"] as const;
export const STAGES = ["To Apply", "Documents Ready", "Submitted", "Interview", "Accepted", "Rejected"] as const;

export const ZMW_PER_USD = 26; // estimate
export const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
