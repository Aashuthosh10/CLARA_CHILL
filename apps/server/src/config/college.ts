// College configuration and demo data
export const collegeConfig = {
  // College Information
  college: {
    name: "Sai Vidya Institute of Technology",
    type: "Engineering College",
    location: "Bangalore, Karnataka",
    established: "2001",
    accreditation: "AICTE Approved, NBA Accredited",
    website: "www.saividya.edu.in"
  },

  // Departments
  departments: {
    "CSE": {
      name: "Computer Science & Engineering",
      duration: "4 years",
      seats: 120,
      fees: 180000
    },
    "CSE_DS": {
      name: "CSE (Data Science)",
      duration: "4 years",
      seats: 60,
      fees: 180000
    },
    "CSE_AI_ML": {
      name: "CSE (AI & ML)",
      duration: "4 years",
      seats: 60,
      fees: 180000
    },
    "MECH": {
      name: "Mechanical Engineering",
      duration: "4 years",
      seats: 120,
      fees: 150000
    },
    "CIVIL": {
      name: "Civil Engineering",
      duration: "4 years",
      seats: 60,
      fees: 150000
    },
    "ECE": {
      name: "Electronics & Communication Engineering",
      duration: "4 years",
      seats: 120,
      fees: 150000
    },
    "ISE": {
      name: "Information Science & Engineering",
      duration: "4 years",
      seats: 60,
      fees: 150000
    }
  },

  // Fee Structure
  fees: {
    tuition: {
      "CSE": 180000,
      "CSE_DS": 180000,
      "CSE_AI_ML": 180000,
      "MECH": 150000,
      "CIVIL": 150000,
      "ECE": 150000,
      "ISE": 150000
    },
    hostel: {
      amount: 90000,
      includes: "Food, Accommodation, Basic Amenities"
    },
    transport: {
      amount: 25000,
      includes: "Daily Pickup & Drop"
    },
    other: {
      admission: 5000,
      library: 3000,
      laboratory: 2000
    }
  },

  // Admission Process
  admission: {
    eligibility: "Minimum 50% in PCM (Physics, Chemistry, Mathematics) in 12th standard",
    entrance: ["State CET", "COMEDK", "Direct Admission"],
    documents: [
      "10th Marksheet",
      "12th Marksheet",
      "Transfer Certificate",
      "Migration Certificate",
      "ID Proof (Aadhar/PAN)",
      "Passport Size Photos",
      "Caste Certificate (if applicable)"
    ],
    process: [
      "Enquiry & Counseling",
      "Application Form Submission",
      "Document Verification",
      "Entrance Test/Interview",
      "Seat Allotment",
      "Fee Payment",
      "Admission Confirmation"
    ]
  },

  // API Endpoints (for external integrations)
  api: {
    staffForward: process.env.STAFF_FORWARD_WEBHOOK || "http://localhost:5678/webhook/forward-to-staff",
    getFaculty: process.env.FACULTY_WEBHOOK || "http://localhost:5678/webhook/get-faculty",
    getEvents: process.env.EVENTS_WEBHOOK || "http://localhost:5678/webhook/get-events",
    getPlacements: process.env.PLACEMENTS_WEBHOOK || "http://localhost:5678/webhook/get-placements"
  },

  // Common Queries & Responses
  responses: {
    greeting: "Welcome to Sai Vidya Institute of Technology! I'm Clara, your AI receptionist. How can I assist you today?",
    admission: "I'd be happy to guide you through our admission process. We offer 7 engineering departments with excellent placement records.",
    fees: "Our annual tuition fees range from ₹1,50,000 to ₹1,80,000 depending on the department. Hostel accommodation is ₹90,000 including food.",
    departments: "We offer 7 engineering departments: CSE, CSE (Data Science), CSE (AI & ML), Mechanical, Civil, ECE, and ISE.",
    contact: "You can reach us at +91-80-1234-5678 or email us at admissions@saividya.edu.in"
  }
};

