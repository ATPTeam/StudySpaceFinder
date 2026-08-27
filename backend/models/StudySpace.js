import mongoose from 'mongoose';

const studySpaceSchema = new mongoose.Schema(
  {
    // Name of the space, e.g., "Central Library - 2nd Floor Reading Room"
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true
    },

    // Campus building name, e.g., "Central Library", "Tech Block"
    building: {
      type: String,
      required: [true, 'Building is required'],
      trim: true
    },

    // Floor identifier, e.g., "Floor 1", "Floor 2"
    floor: {
      type: String,
      required: [true, 'Floor level is required'],
      trim: true
    },

    // Study environment type
    vibe: {
      type: String,
      enum: ['Silent', 'Discussion', 'Group Work'],
      default: 'Silent'
    },

    // Array of amenities available in the space
    facilities: [
      {
        type: String // e.g., "Power Outlets", "High-Speed WiFi", "AC", "Whiteboard"
      }
    ],

    // Total maximum seats in this study area
    totalSeats: {
      type: Number,
      required: true,
      default: 20
    },

    // Number of currently occupied seats
    occupiedSeats: {
      type: Number,
      required: true,
      default: 0
    },

    // Live occupancy status category
    status: {
      type: String,
      enum: ['Available', 'Filling Up', 'Full'],
      default: 'Available'
    },

    // Timestamp when the last seat status update or check-in occurred
    lastUpdated: {
      type: Date,
      default: Date.now
    },

    // 24-hour baseline occupancy percentage (0-100) for AI peak trend prediction
    hourlyTrends: {
      type: [Number],
      default: [0, 0, 0, 0, 0, 10, 25, 45, 70, 85, 90, 85, 75, 80, 88, 92, 70, 50, 30, 10, 0, 0, 0, 0]
    }
  },
  {
    // Automatically adds createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Mongoose method to automatically update the status based on seat numbers
studySpaceSchema.methods.calculateStatus = function () {
  const ratio = this.occupiedSeats / this.totalSeats;
  if (ratio >= 0.9) {
    this.status = 'Full';
  } else if (ratio >= 0.5) {
    this.status = 'Filling Up';
  } else {
    this.status = 'Available';
  }
};

const StudySpace = mongoose.model('StudySpace', studySpaceSchema);

export default StudySpace;