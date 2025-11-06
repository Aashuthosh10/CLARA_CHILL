// Staff profiles demo data
export interface StaffProfile {
  name: string;
  email: string;
  password: string;
  department: string;
  shortName: string;
  subjects: string[];
}

export const staffProfiles: StaffProfile[] = [
  {
    name: "Prof. Lakshmi Durga N",
    email: "lakshmidurgan@gmail.com",
    password: "lakshmidurgan",
    department: "Computer Science Engineering",
    shortName: "LDN",
    subjects: ["Software Engineering & Project Management", "Data Visualization Lab", "Computer Networks Lab"]
  },
  {
    name: "Prof. Anitha C S",
    email: "anithacs@gmail.com",
    password: "anithacs",
    department: "Computer Science Engineering",
    shortName: "ACS",
    subjects: ["Research Methodology and IPR", "Computer Networks Lab"]
  },
  {
    name: "Dr. G Dhivyasri",
    email: "gdhivyasri@gmail.com",
    password: "gdhivyasri",
    department: "Computer Science Engineering",
    shortName: "GD",
    subjects: ["Computer Networks"]
  },
  {
    name: "Prof. Nisha S K",
    email: "nishask@gmail.com",
    password: "nishask",
    department: "Computer Science Engineering",
    shortName: "NSK",
    subjects: ["NOSQL Databases"]
  },
  {
    name: "Prof. Amarnath B Patil",
    email: "amarnathbpatil@gmail.com",
    password: "amarnathbpatil",
    department: "Computer Science Engineering",
    shortName: "ABP",
    subjects: ["Mini Project"]
  },
  {
    name: "Dr. Nagashree N",
    email: "nagashreen@gmail.com",
    password: "nagashreen",
    department: "Computer Science Engineering",
    shortName: "NN",
    subjects: ["Theory of Computation", "Yoga"]
  },
  {
    name: "Prof. Anil Kumar K V",
    email: "anilkumarkv@gmail.com",
    password: "anilkumarkv",
    department: "Computer Science Engineering",
    shortName: "AKV",
    subjects: ["Environmental Studies"]
  },
  {
    name: "Prof. Jyoti Kumari",
    email: "jyotikumari@gmail.com",
    password: "jyotikumari",
    department: "Computer Science Engineering",
    shortName: "JK",
    subjects: ["Computer Networks Lab", "Physical Education (PE)"]
  },
  {
    name: "Prof. Vidyashree R",
    email: "vidyashreer@gmail.com",
    password: "vidyashreer",
    department: "Computer Science Engineering",
    shortName: "VR",
    subjects: ["Data Visualization Lab"]
  },
  {
    name: "Dr. Bhavana A",
    email: "bhavanaa@gmail.com",
    password: "bhavanaa",
    department: "Computer Science Engineering",
    shortName: "BA",
    subjects: ["Mini Project"]
  },
  {
    name: "Prof. Bhavya T N",
    email: "bhavyatn@gmail.com",
    password: "bhavyatn",
    department: "Computer Science Engineering",
    shortName: "BTN",
    subjects: ["National Service Scheme (NSS)"]
  }
];

