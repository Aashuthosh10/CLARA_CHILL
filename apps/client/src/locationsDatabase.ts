// Location Database for Sai Vidya Institute of Technology
// Contains all locations across 3 floors

export interface Location {
  name: string;
  room_number?: string | null;
  category: string;
  keywords: string[];
  coordinates: { x: number; y: number };
  description: string;
  floor: number;
  floor_name: string;
  key: string;
  is_entry_point?: boolean;
}

export interface FloorData {
  floor_number: number;
  floor_name: string;
  locations: { [key: string]: Omit<Location, 'floor' | 'floor_name' | 'key'> };
}

export const BUILDING_LOCATIONS: { [key: string]: FloorData } = {
  "GROUND_FLOOR": {
    floor_number: 0,
    floor_name: "Ground Floor",
    locations: {
      "library": {
        name: "Library Information Center",
        room_number: "019",
        category: "academic",
        keywords: ["library", "books", "reading room", "study"],
        coordinates: { x: 450, y: 300 },
        description: "Main library with book collection and reading area"
      },
      "computer_center": {
        name: "Computer Center",
        room_number: "021",
        category: "academic",
        keywords: ["computer center", "computers", "lab"],
        coordinates: { x: 380, y: 250 },
        description: "Computer center with multiple workstations"
      },
      "director_room": {
        name: "Director's Room",
        room_number: null,
        category: "administrative",
        keywords: ["director", "director office", "director room"],
        coordinates: { x: 150, y: 400 },
        description: "Director's office"
      },
      "vice_principal": {
        name: "Vice Principal Office",
        room_number: null,
        category: "administrative",
        keywords: ["vice principal", "vp office"],
        coordinates: { x: 180, y: 350 },
        description: "Vice Principal's office"
      },
      "secretary_chamber": {
        name: "Secretary Chamber",
        room_number: null,
        category: "administrative",
        keywords: ["secretary", "secretary office"],
        coordinates: { x: 200, y: 400 },
        description: "Secretary's chamber"
      },
      "administrative_office": {
        name: "Administrative Office",
        room_number: "022",
        category: "administrative",
        keywords: ["admin", "administrative", "office"],
        coordinates: { x: 250, y: 350 },
        description: "Main administrative office"
      },
      "board_room": {
        name: "Board Room",
        room_number: null,
        category: "meeting",
        keywords: ["board room", "meeting room", "conference"],
        coordinates: { x: 220, y: 450 },
        description: "Board room for meetings"
      },
      "geology_lab": {
        name: "Geology Lab",
        room_number: null,
        category: "lab",
        keywords: ["geology", "geology lab"],
        coordinates: { x: 500, y: 350 },
        description: "Geology laboratory"
      },
      "survey_lab": {
        name: "Survey Lab",
        room_number: null,
        category: "lab",
        keywords: ["survey", "survey lab"],
        coordinates: { x: 520, y: 300 },
        description: "Survey laboratory"
      },
      "bmt_lab": {
        name: "BMT Lab",
        room_number: null,
        category: "lab",
        keywords: ["bmt", "bmt lab"],
        coordinates: { x: 540, y: 250 },
        description: "BMT laboratory"
      },
      "relay_high_voltage_lab": {
        name: "Relay and High Voltage Lab",
        room_number: "002",
        category: "lab",
        keywords: ["relay lab", "high voltage", "voltage lab"],
        coordinates: { x: 200, y: 250 },
        description: "Relay and high voltage laboratory"
      },
      "railway_skills": {
        name: "Railway Skills Development",
        room_number: "005",
        category: "training",
        keywords: ["railway", "railway skills", "skills development"],
        coordinates: { x: 350, y: 450 },
        description: "Railway skills development center"
      },
      "language_lab": {
        name: "Language Lab",
        room_number: "007",
        category: "lab",
        keywords: ["language", "language lab"],
        coordinates: { x: 400, y: 450 },
        description: "Language laboratory"
      },
      "swamy_vivekanand_hall": {
        name: "Swamy Vivekanand Seminar Hall",
        room_number: "025",
        category: "seminar",
        keywords: ["seminar hall", "vivekanand", "swamy vivekanand", "hall"],
        coordinates: { x: 550, y: 200 },
        description: "Main seminar hall"
      },
      "gymnasium": {
        name: "Gymnasium & Fitness",
        room_number: null,
        category: "facility",
        keywords: ["gym", "gymnasium", "fitness", "sports"],
        coordinates: { x: 500, y: 400 },
        description: "Gymnasium and fitness center"
      },
      "reception": {
        name: "Reception & Waiting Room",
        room_number: null,
        category: "facility",
        keywords: ["reception", "waiting room", "front desk"],
        coordinates: { x: 120, y: 350 },
        is_entry_point: true,
        description: "Main reception and waiting area"
      },
      "medical_room": {
        name: "Medical Room",
        room_number: null,
        category: "facility",
        keywords: ["medical", "health", "first aid", "clinic"],
        coordinates: { x: 270, y: 400 },
        description: "Medical room for first aid"
      },
      "sports_room": {
        name: "Sports Room",
        room_number: "003",
        category: "facility",
        keywords: ["sports", "sports room"],
        coordinates: { x: 450, y: 450 },
        description: "Sports equipment room"
      },
      "generator_room": {
        name: "Generator Room",
        room_number: null,
        category: "utility",
        keywords: ["generator", "power"],
        coordinates: { x: 100, y: 200 },
        description: "Generator room"
      },
      "ncc_room": {
        name: "NCC Room",
        room_number: null,
        category: "activity",
        keywords: ["ncc", "national cadet corps"],
        coordinates: { x: 120, y: 250 },
        description: "NCC activities room"
      },
      "dept_maths": {
        name: "Department of Mathematics",
        room_number: null,
        category: "department",
        keywords: ["maths", "mathematics", "dept of maths"],
        coordinates: { x: 300, y: 300 },
        description: "Mathematics department"
      },
      "cse_research_center": {
        name: "CSE Dept Research Center",
        room_number: null,
        category: "research",
        keywords: ["cse research", "research center"],
        coordinates: { x: 150, y: 150 },
        description: "CSE department research center"
      },
      "boys_washroom_gf": {
        name: "Boys Washroom (Ground Floor)",
        room_number: null,
        category: "washroom",
        keywords: ["boys washroom", "men's room", "gents toilet"],
        coordinates: { x: 170, y: 100 },
        description: "Boys washroom on ground floor"
      },
      "girls_washroom_gf": {
        name: "Girls Washroom (Ground Floor)",
        room_number: null,
        category: "washroom",
        keywords: ["girls washroom", "ladies room", "women's toilet"],
        coordinates: { x: 190, y: 100 },
        description: "Girls washroom on ground floor"
      }
    }
  },
  "FIRST_FLOOR": {
    floor_number: 1,
    floor_name: "First Floor",
    locations: {
      "hod_cse": {
        name: "HOD CSE Cabin",
        room_number: "108",
        category: "hod",
        keywords: ["hod cse", "cse head", "computer science hod"],
        coordinates: { x: 500, y: 350 },
        description: "Head of Department - Computer Science & Engineering"
      },
      "hod_ece": {
        name: "HOD E&C Room",
        room_number: "108",
        category: "hod",
        keywords: ["hod ece", "hod electronics", "electronics hod"],
        coordinates: { x: 480, y: 350 },
        description: "Head of Department - Electronics & Communication"
      },
      "cse_library": {
        name: "CSE Department Library",
        room_number: "102",
        category: "library",
        keywords: ["cse library", "computer science library"],
        coordinates: { x: 450, y: 300 },
        description: "Computer Science & Engineering department library"
      },
      "ise_library": {
        name: "ISE Library",
        room_number: "103",
        category: "library",
        keywords: ["ise library", "information science library"],
        coordinates: { x: 470, y: 300 },
        description: "Information Science & Engineering library"
      },
      "cyber_signal_lab": {
        name: "Cyber Signal Lab-2",
        room_number: "135",
        category: "lab",
        keywords: ["cyber lab", "signal lab", "cyber signal"],
        coordinates: { x: 150, y: 200 },
        description: "Cyber signal laboratory"
      },
      "aiml_lab_railways": {
        name: "AIML Lab for Railways R&D",
        room_number: "141",
        category: "lab",
        keywords: ["aiml lab", "railways lab", "ai ml lab"],
        coordinates: { x: 250, y: 200 },
        description: "AI/ML lab for railways research & development"
      },
      "vikram_sarabai_lab": {
        name: "Dr. Vikram Sarabai Computer Lab",
        room_number: "133",
        category: "lab",
        keywords: ["vikram sarabai", "computer lab 133"],
        coordinates: { x: 300, y: 350 },
        description: "Dr. Vikram Sarabai computer laboratory"
      },
      "room_104": {
        name: "Room No 104",
        room_number: "104",
        category: "classroom",
        keywords: ["room 104", "classroom 104"],
        coordinates: { x: 420, y: 400 },
        description: "Classroom 104"
      },
      "room_105": {
        name: "Room No 105",
        room_number: "105",
        category: "classroom",
        keywords: ["room 105", "classroom 105"],
        coordinates: { x: 350, y: 450 },
        description: "Classroom 105"
      },
      "room_106": {
        name: "Room No 106",
        room_number: "106",
        category: "classroom",
        keywords: ["room 106", "classroom 106"],
        coordinates: { x: 380, y: 450 },
        description: "Classroom 106"
      },
      "room_107": {
        name: "Room No 107",
        room_number: "107",
        category: "classroom",
        keywords: ["room 107", "classroom 107"],
        coordinates: { x: 410, y: 450 },
        description: "Classroom 107"
      },
      "cse_faculty_room": {
        name: "CS Faculty Room",
        room_number: null,
        category: "faculty",
        keywords: ["cse faculty", "cs faculty", "computer science faculty"],
        coordinates: { x: 320, y: 320 },
        description: "Computer Science faculty room"
      },
      "dept_cse_faculty_room2": {
        name: "Dept CSE Faculty Room - 2",
        room_number: null,
        category: "faculty",
        keywords: ["cse faculty room 2"],
        coordinates: { x: 340, y: 280 },
        description: "CSE faculty room 2"
      },
      "rd_center": {
        name: "Research & Development Center",
        room_number: "103",
        category: "research",
        keywords: ["research center", "r&d", "research and development"],
        coordinates: { x: 490, y: 280 },
        description: "Research & Development center"
      },
      "svit_club": {
        name: "SVIT Club",
        room_number: null,
        category: "activity",
        keywords: ["svit club", "student club"],
        coordinates: { x: 440, y: 480 },
        description: "SVIT student club"
      },
      "sudha_murthi": {
        name: "Sudha Murthi Room",
        room_number: "136",
        category: "classroom",
        keywords: ["sudha murthi", "room 136"],
        coordinates: { x: 180, y: 200 },
        description: "Sudha Murthi classroom"
      },
      "chanakya": {
        name: "Chanakya Room",
        room_number: "137",
        category: "classroom",
        keywords: ["chanakya", "room 137"],
        coordinates: { x: 210, y: 200 },
        description: "Chanakya classroom"
      },
      "ratan_tata": {
        name: "Ratan Tata Room",
        room_number: "138",
        category: "classroom",
        keywords: ["ratan tata", "room 138"],
        coordinates: { x: 240, y: 200 },
        description: "Ratan Tata classroom"
      },
      "cnr_rao": {
        name: "CNR RAO Room",
        room_number: "139",
        category: "classroom",
        keywords: ["cnr rao", "room 139"],
        coordinates: { x: 270, y: 200 },
        description: "CNR RAO classroom"
      },
      "boys_washroom_1f": {
        name: "Boys Washroom (First Floor)",
        room_number: null,
        category: "washroom",
        keywords: ["boys washroom first floor", "gents toilet 1st"],
        coordinates: { x: 280, y: 380 },
        description: "Boys washroom on first floor"
      },
      "girls_washroom_1f": {
        name: "Girls Washroom (First Floor)",
        room_number: null,
        category: "washroom",
        keywords: ["girls washroom first floor", "ladies room 1st"],
        coordinates: { x: 300, y: 380 },
        description: "Girls washroom on first floor"
      }
    }
  },
  "SECOND_FLOOR": {
    floor_number: 2,
    floor_name: "Second Floor",
    locations: {
      "hod_ds": {
        name: "DS HOD Room",
        room_number: "LH-205",
        category: "hod",
        keywords: ["hod ds", "data science hod", "ds head"],
        coordinates: { x: 180, y: 320 },
        description: "Head of Department - Data Science"
      },
      "hod_aiml": {
        name: "AIML HOD Room",
        room_number: null,
        category: "hod",
        keywords: ["hod aiml", "ai ml hod"],
        coordinates: { x: 200, y: 320 },
        description: "Head of Department - AI & ML"
      },
      "hod_mechanical": {
        name: "HOD Mechanical",
        room_number: null,
        category: "hod",
        keywords: ["hod mechanical", "mechanical head"],
        coordinates: { x: 500, y: 450 },
        description: "Head of Department - Mechanical Engineering"
      },
      "hod_civil": {
        name: "CIVIL HOD",
        room_number: null,
        category: "hod",
        keywords: ["hod civil", "civil head"],
        coordinates: { x: 480, y: 450 },
        description: "Head of Department - Civil Engineering"
      },
      "lh_201": {
        name: "Lecture Hall 201",
        room_number: "LH-201",
        category: "classroom",
        keywords: ["lh 201", "lecture hall 201", "room 201"],
        coordinates: { x: 350, y: 200 },
        description: "Lecture hall 201"
      },
      "lh_202": {
        name: "Lecture Hall 202",
        room_number: "LH-202",
        category: "classroom",
        keywords: ["lh 202", "lecture hall 202", "room 202"],
        coordinates: { x: 380, y: 200 },
        description: "Lecture hall 202"
      },
      "lh_203": {
        name: "Lecture Hall 203",
        room_number: "LH-203",
        category: "classroom",
        keywords: ["lh 203", "lecture hall 203", "room 203"],
        coordinates: { x: 410, y: 200 },
        description: "Lecture hall 203"
      },
      "lh_204": {
        name: "Lecture Hall 204",
        room_number: "LH-204",
        category: "classroom",
        keywords: ["lh 204", "lecture hall 204", "room 204"],
        coordinates: { x: 440, y: 200 },
        description: "Lecture hall 204"
      },
      "lh_206": {
        name: "Lecture Hall 206",
        room_number: "LH-206",
        category: "classroom",
        keywords: ["lh 206", "lecture hall 206", "room 206"],
        coordinates: { x: 300, y: 350 },
        description: "Lecture hall 206"
      },
      "lh_207": {
        name: "Lecture Hall 207",
        room_number: "LH-207",
        category: "classroom",
        keywords: ["lh 207", "lecture hall 207", "room 207"],
        coordinates: { x: 150, y: 200 },
        description: "Lecture hall 207"
      },
      "lh_208": {
        name: "Lecture Hall 208",
        room_number: "LH-208",
        category: "classroom",
        keywords: ["lh 208", "lecture hall 208", "room 208"],
        coordinates: { x: 180, y: 200 },
        description: "Lecture hall 208"
      },
      "lh_209": {
        name: "Lecture Hall 209",
        room_number: "LH-209",
        category: "classroom",
        keywords: ["lh 209", "lecture hall 209", "room 209"],
        coordinates: { x: 210, y: 200 },
        description: "Lecture hall 209"
      },
      "lh_210": {
        name: "Lecture Hall 210",
        room_number: "LH-210",
        category: "classroom",
        keywords: ["lh 210", "lecture hall 210", "room 210"],
        coordinates: { x: 240, y: 200 },
        description: "Lecture hall 210"
      },
      "lh_211": {
        name: "Lecture Hall 211",
        room_number: "LH-211",
        category: "classroom",
        keywords: ["lh 211", "lecture hall 211", "room 211"],
        coordinates: { x: 270, y: 200 },
        description: "Lecture hall 211"
      },
      "lh_236": {
        name: "Lecture Hall 236",
        room_number: "LH-236",
        category: "classroom",
        keywords: ["lh 236", "lecture hall 236", "room 236"],
        coordinates: { x: 150, y: 350 },
        description: "Lecture hall 236"
      },
      "lh_237": {
        name: "Lecture Hall 237",
        room_number: "LH-237",
        category: "classroom",
        keywords: ["lh 237", "lecture hall 237", "room 237"],
        coordinates: { x: 180, y: 350 },
        description: "Lecture hall 237"
      },
      "lh_238": {
        name: "Lecture Hall 238",
        room_number: "LH-238",
        category: "classroom",
        keywords: ["lh 238", "lecture hall 238", "room 238"],
        coordinates: { x: 210, y: 350 },
        description: "Lecture hall 238"
      },
      "lh_239": {
        name: "Lecture Hall 239",
        room_number: "LH-239",
        category: "classroom",
        keywords: ["lh 239", "lecture hall 239", "room 239"],
        coordinates: { x: 240, y: 350 },
        description: "Lecture hall 239"
      },
      "lh_240": {
        name: "Lecture Hall 240",
        room_number: "LH-240",
        category: "classroom",
        keywords: ["lh 240", "lecture hall 240", "room 240"],
        coordinates: { x: 270, y: 350 },
        description: "Lecture hall 240"
      },
      "lh_241": {
        name: "Lecture Hall 241",
        room_number: "LH-241",
        category: "classroom",
        keywords: ["lh 241", "lecture hall 241", "room 241"],
        coordinates: { x: 300, y: 350 },
        description: "Lecture hall 241"
      },
      "aiml_lab_2f": {
        name: "AIML Lab",
        room_number: null,
        category: "lab",
        keywords: ["aiml lab second floor", "ai ml lab 2nd"],
        coordinates: { x: 250, y: 450 },
        description: "AI/ML laboratory on second floor"
      },
      "cse_ds_lab": {
        name: "CSE(DS) Dept Lab-1",
        room_number: null,
        category: "lab",
        keywords: ["data science lab", "ds lab", "cse ds lab"],
        coordinates: { x: 280, y: 450 },
        description: "Data Science department lab 1"
      },
      "cse_aiml_lab": {
        name: "Dept of CSE (AIML) Lab",
        room_number: null,
        category: "lab",
        keywords: ["cse aiml lab"],
        coordinates: { x: 310, y: 450 },
        description: "CSE AI/ML department lab"
      },
      "ise_computer_lab": {
        name: "Dept of ISE Computer Lab",
        room_number: null,
        category: "lab",
        keywords: ["ise lab", "information science lab"],
        coordinates: { x: 350, y: 400 },
        description: "Information Science & Engineering computer lab"
      },
      "civil_cad_lab": {
        name: "Civil & Mechanical CAD Lab",
        room_number: null,
        category: "lab",
        keywords: ["cad lab", "civil lab", "mechanical lab"],
        coordinates: { x: 450, y: 400 },
        description: "CAD lab for Civil & Mechanical departments"
      },
      "ise_dept": {
        name: "Department of Information Science & Engineering",
        room_number: null,
        category: "department",
        keywords: ["ise department", "information science department"],
        coordinates: { x: 380, y: 450 },
        description: "Information Science & Engineering department"
      },
      "civil_mechanical_staff": {
        name: "Civil & Mechanical Staff Room",
        room_number: null,
        category: "faculty",
        keywords: ["civil staff", "mechanical staff"],
        coordinates: { x: 420, y: 350 },
        description: "Civil & Mechanical departments staff room"
      },
      "cse_aiml_staff": {
        name: "Dept of CSE (AIML) Staff Room",
        room_number: null,
        category: "faculty",
        keywords: ["aiml staff", "cse aiml staff"],
        coordinates: { x: 380, y: 480 },
        description: "CSE AI/ML staff room"
      },
      "data_science_staff": {
        name: "Dept Data Science Staff Room",
        room_number: null,
        category: "faculty",
        keywords: ["data science staff", "ds staff"],
        coordinates: { x: 410, y: 480 },
        description: "Data Science staff room"
      },
      "ece_faculty_room2": {
        name: "Dept of ECE Faculty Room-2",
        room_number: null,
        category: "faculty",
        keywords: ["ece faculty room 2"],
        coordinates: { x: 320, y: 200 },
        description: "ECE faculty room 2"
      },
      "seminar_hall_2f": {
        name: "Seminar Hall",
        room_number: null,
        category: "seminar",
        keywords: ["seminar hall second floor"],
        coordinates: { x: 200, y: 400 },
        description: "Seminar hall on second floor"
      },
      "library_2f": {
        name: "Library",
        room_number: null,
        category: "library",
        keywords: ["library second floor"],
        coordinates: { x: 250, y: 350 },
        description: "Library on second floor"
      },
      "civil_classroom": {
        name: "Civil Class Room",
        room_number: null,
        category: "classroom",
        keywords: ["civil classroom"],
        coordinates: { x: 520, y: 400 },
        description: "Civil engineering classroom"
      },
      "iqac": {
        name: "Internal Quality Assurance Cell (IQAC)",
        room_number: null,
        category: "administrative",
        keywords: ["iqac", "quality assurance"],
        coordinates: { x: 330, y: 200 },
        description: "Internal Quality Assurance Cell"
      },
      "nss_cell": {
        name: "NSS Cell",
        room_number: null,
        category: "activity",
        keywords: ["nss", "nss cell"],
        coordinates: { x: 280, y: 280 },
        description: "National Service Scheme cell"
      },
      "sangam_cultural": {
        name: "Sangam Cultural",
        room_number: null,
        category: "activity",
        keywords: ["sangam", "cultural", "sangam cultural"],
        coordinates: { x: 310, y: 280 },
        description: "Sangam cultural activities room"
      },
      "career_guidance": {
        name: "Career Guidance Cell",
        room_number: null,
        category: "facility",
        keywords: ["career guidance", "placement", "career cell"],
        coordinates: { x: 550, y: 200 },
        description: "Career guidance and placement cell"
      },
      "ds_faculty_room": {
        name: "Faculty DS Room",
        room_number: null,
        category: "faculty",
        keywords: ["data science faculty room"],
        coordinates: { x: 220, y: 450 },
        description: "Data Science faculty room"
      },
      "boys_common_room_2f": {
        name: "Boys Common Room",
        room_number: null,
        category: "facility",
        keywords: ["boys common room second floor"],
        coordinates: { x: 380, y: 320 },
        description: "Boys common room on second floor"
      },
      "boys_washroom_2f": {
        name: "Boys Wash Room (Second Floor)",
        room_number: null,
        category: "washroom",
        keywords: ["boys washroom second floor", "gents toilet 2nd"],
        coordinates: { x: 400, y: 280 },
        description: "Boys washroom on second floor"
      },
      "girls_washroom_2f": {
        name: "Girls Wash Room (Second Floor)",
        room_number: null,
        category: "washroom",
        keywords: ["girls washroom second floor", "ladies room 2nd"],
        coordinates: { x: 280, y: 250 },
        description: "Girls washroom on second floor"
      }
    }
  }
};

export const FLOOR_CONNECTIONS = {
  stairs: {
    ground_to_first: { x: 320, y: 280 },
    first_to_second: { x: 420, y: 320 }
  },
  lift: {
    all_floors: { x: 340, y: 300 }
  }
};

