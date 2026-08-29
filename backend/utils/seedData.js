import mongoose from "mongoose";
import dotenv from "dotenv";
import Space from "../models/Space.js";

dotenv.config({ path: "./.env" });

const seedSpaces = [
  {
    name: "D Block Library",
    floor: "1st Floor",
    building: "Block D",
    type: "Library",
    occupiedSeats: 22,
    totalSeats: 40,
    vibe: "Silent",
    facilities: ["Wi-Fi", "Power", "AC"],
    x: 17,
    y: 35,
  },
  {
    name: "Seminar Hall 1",
    floor: "Ground Floor",
    building: "Block D",
    type: "Seminar Hall",
    occupiedSeats: 32,
    totalSeats: 40,
    vibe: "Discussion",
    facilities: ["Wi-Fi", "Power"],
    x: 20,
    y: 35,
  },
  {
    name: "Seminar Hall 2",
    floor: "Ground Floor",
    building: "Block D",
    type: "Seminar Hall",
    occupiedSeats: 16,
    totalSeats: 40,
    vibe: "Discussion",
    facilities: ["Wi-Fi", "Whiteboard"],
    x: 23,
    y: 35,
  },
  {
    name: "E Block Library",
    floor: "1st Floor",
    building: "Block E",
    type: "Library",
    occupiedSeats: 19,
    totalSeats: 45,
    vibe: "Silent",
    facilities: ["Wi-Fi", "Power", "AC"],
    x: 65,
    y: 35,
  },
  {
    name: "E Seminar Hall",
    floor: "Ground Floor",
    building: "Block E",
    type: "Seminar Hall",
    occupiedSeats: 32,
    totalSeats: 40,
    vibe: "Discussion",
    facilities: ["Projector", "Whiteboard"],
    x: 69,
    y: 35,
  },
  {
    name: "G Block Library",
    floor: "1st Floor",
    building: "Block G",
    type: "Library",
    occupiedSeats: 19,
    totalSeats: 50,
    vibe: "Silent",
    facilities: ["Wi-Fi", "Power", "AC"],
    x: 78,
    y: 71,
  },
  {
    name: "G Block Library",
    floor: "2nd Floor",
    building: "Block G",
    type: "Library",
    occupiedSeats: 33,
    totalSeats: 45,
    vibe: "Quiet",
    facilities: ["Wi-Fi", "Power"],
    x: 82,
    y: 71,
  },
  {
    name: "H Seminar Hall 1",
    floor: "1st Floor",
    building: "Block H",
    type: "Seminar Hall",
    occupiedSeats: 18,
    totalSeats: 60,
    vibe: "Discussion",
    facilities: ["Wi-Fi", "Projector"],
    x: 31,
    y: 34,
  },
  {
    name: "H Seminar Hall 2",
    floor: "2nd Floor",
    building: "Block H",
    type: "Seminar Hall",
    occupiedSeats: 42,
    totalSeats: 60,
    vibe: "Discussion",
    facilities: ["Wi-Fi", "Whiteboard"],
    x: 34,
    y: 34,
  },
  {
    name: "H Seminar Hall 3",
    floor: "3rd Floor",
    building: "Block H",
    type: "Seminar Hall",
    occupiedSeats: 9,
    totalSeats: 60,
    vibe: "Discussion",
    facilities: ["Wi-Fi", "Projector"],
    x: 37,
    y: 34,
  },
  {
    name: "H Seminar Hall 4",
    floor: "4th Floor",
    building: "Block H",
    type: "Seminar Hall",
    occupiedSeats: 52,
    totalSeats: 60,
    vibe: "Discussion",
    facilities: ["Wi-Fi"],
    x: 40,
    y: 34,
  },
  {
    name: "H Seminar Hall 5",
    floor: "5th Floor",
    building: "Block H",
    type: "Seminar Hall",
    occupiedSeats: 24,
    totalSeats: 60,
    vibe: "Discussion",
    facilities: ["Wi-Fi", "Projector"],
    x: 43,
    y: 34,
  },
  {
    name: "H Seminar Hall 6",
    floor: "6th Floor",
    building: "Block H",
    type: "Seminar Hall",
    occupiedSeats: 39,
    totalSeats: 60,
    vibe: "Discussion",
    facilities: ["Wi-Fi", "Whiteboard"],
    x: 46,
    y: 34,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Drop whole collection to clean legacy indexes completely
    try {
      await mongoose.connection.collection("spaces").drop();
    } catch (e) {
      // Collection didn't exist yet, proceed safely
    }

    await Space.insertMany(seedSpaces);
    console.log("🌱 All 13 campus spaces seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();