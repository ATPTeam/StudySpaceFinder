// backend/utils/seedData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudySpace from '../models/StudySpace.js';
import Student from '../models/Student.js';
import CheckInLog from '../models/CheckInLog.js';

dotenv.config();

const sampleSpaces = [
  {
    name: 'D Block Library',
    building: 'Block D',
    floor: '1st Floor',
    vibe: 'Silent',
    facilities: ['Wi-Fi', 'Power', 'AC'],
    totalSeats: 40,
    occupiedSeats: 22,
    status: 'Available',
    hourlyTrends: [0, 0, 0, 0, 0, 10, 25, 45, 70, 85, 90, 85, 75, 80, 88, 92, 70, 50, 30, 10, 0, 0, 0, 0]
  },
  {
    name: 'Seminar Hall 1',
    building: 'Block D',
    floor: 'Ground Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi', 'Power'],
    totalSeats: 40,
    occupiedSeats: 32,
    status: 'Filling Up',
    hourlyTrends: [0, 0, 0, 0, 0, 5, 15, 30, 60, 75, 80, 85, 90, 95, 85, 80, 60, 40, 20, 5, 0, 0, 0, 0]
  },
  {
    name: 'Seminar Hall 2',
    building: 'Block D',
    floor: 'Ground Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi', 'Whiteboard'],
    totalSeats: 40,
    occupiedSeats: 16,
    status: 'Available',
    hourlyTrends: [0, 0, 0, 0, 0, 0, 10, 20, 50, 70, 75, 80, 80, 85, 90, 75, 50, 30, 10, 0, 0, 0, 0, 0]
  },
  {
    name: 'E Block Library',
    building: 'Block E',
    floor: '1st Floor',
    vibe: 'Silent',
    facilities: ['Wi-Fi', 'Power', 'AC'],
    totalSeats: 45,
    occupiedSeats: 19,
    status: 'Available',
    hourlyTrends: [0, 0, 0, 0, 0, 15, 30, 50, 80, 85, 95, 90, 80, 85, 90, 95, 80, 60, 40, 15, 0, 0, 0, 0]
  },
  {
    name: 'E Seminar Hall',
    building: 'Block E',
    floor: 'Ground Floor',
    vibe: 'Discussion',
    facilities: ['Projector', 'Whiteboard'],
    totalSeats: 40,
    occupiedSeats: 32,
    status: 'Filling Up',
    hourlyTrends: [0, 0, 0, 0, 0, 10, 20, 35, 60, 75, 85, 80, 75, 85, 80, 75, 60, 40, 20, 0, 0, 0, 0, 0]
  },
  {
    name: 'G Block Library 1st Floor',
    building: 'Block G',
    floor: '1st Floor',
    vibe: 'Silent',
    facilities: ['Wi-Fi', 'Power', 'AC'],
    totalSeats: 50,
    occupiedSeats: 19,
    status: 'Available',
    hourlyTrends: [0, 0, 0, 0, 0, 5, 10, 25, 45, 60, 70, 75, 70, 65, 75, 60, 40, 20, 10, 0, 0, 0, 0, 0]
  },
  {
    name: 'G Block Library 2nd Floor',
    building: 'Block G',
    floor: '2nd Floor',
    vibe: 'Silent', // <-- changed from 'Quiet' to 'Silent'
    facilities: ['Wi-Fi', 'Power'],
    totalSeats: 45,
    occupiedSeats: 33,
    status: 'Filling Up',
    hourlyTrends: [0, 0, 0, 0, 0, 5, 15, 30, 60, 75, 80, 85, 90, 95, 85, 80, 60, 40, 20, 5, 0, 0, 0, 0]
  },
  {
    name: 'H Seminar Hall 1',
    building: 'Block H',
    floor: '1st Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi', 'Projector'],
    totalSeats: 60,
    occupiedSeats: 18,
    status: 'Available',
    hourlyTrends: [0, 0, 0, 0, 0, 10, 25, 45, 70, 85, 90, 85, 75, 80, 88, 92, 70, 50, 30, 10, 0, 0, 0, 0]
  },
  {
    name: 'H Seminar Hall 2',
    building: 'Block H',
    floor: '2nd Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi', 'Whiteboard'],
    totalSeats: 60,
    occupiedSeats: 42,
    status: 'Filling Up',
    hourlyTrends: [0, 0, 0, 0, 0, 5, 15, 30, 60, 75, 80, 85, 90, 95, 85, 80, 60, 40, 20, 5, 0, 0, 0, 0]
  },
  {
    name: 'H Seminar Hall 3',
    building: 'Block H',
    floor: '3rd Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi', 'Projector'],
    totalSeats: 60,
    occupiedSeats: 9,
    status: 'Available',
    hourlyTrends: [0, 0, 0, 0, 0, 0, 10, 20, 50, 70, 75, 80, 80, 85, 90, 75, 50, 30, 10, 0, 0, 0, 0, 0]
  },
  {
    name: 'H Seminar Hall 4',
    building: 'Block H',
    floor: '4th Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi'],
    totalSeats: 60,
    occupiedSeats: 52,
    status: 'Full',
    hourlyTrends: [0, 0, 0, 0, 0, 15, 30, 50, 80, 85, 95, 90, 80, 85, 90, 95, 80, 60, 40, 15, 0, 0, 0, 0]
  },
  {
    name: 'H Seminar Hall 5',
    building: 'Block H',
    floor: '5th Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi', 'Projector'],
    totalSeats: 60,
    occupiedSeats: 24,
    status: 'Available',
    hourlyTrends: [0, 0, 0, 0, 0, 10, 20, 35, 60, 75, 85, 80, 75, 85, 80, 75, 60, 40, 20, 0, 0, 0, 0, 0]
  },
  {
    name: 'H Seminar Hall 6',
    building: 'Block H',
    floor: '6th Floor',
    vibe: 'Discussion',
    facilities: ['Wi-Fi', 'Whiteboard'],
    totalSeats: 60,
    occupiedSeats: 39,
    status: 'Filling Up',
    hourlyTrends: [0, 0, 0, 0, 0, 5, 10, 25, 45, 60, 70, 75, 70, 65, 75, 60, 40, 20, 10, 0, 0, 0, 0, 0]
  }
];

const sampleStudents = [
  { studentId: 'STU101', name: 'Alex Kumar', department: 'Computer Science' },
  { studentId: 'STU102', name: 'Priya Sharma', department: 'Information Technology' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await StudySpace.deleteMany();
    await Student.deleteMany();
    await CheckInLog.deleteMany();

    await StudySpace.insertMany(sampleSpaces);
    await Student.insertMany(sampleStudents);

    console.log('✅ MongoDB populated with Anurag University rooms matching frontend!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();