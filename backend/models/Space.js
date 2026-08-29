import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: String,
      required: true,
      default: "1st Floor",
    },
    building: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "Library",
    },
    occupiedSeats: {
      type: Number,
      default: 0,
    },
    totalSeats: {
      type: Number,
      default: 40,
    },
    vibe: {
      type: String,
      default: "Silent",
    },
    facilities: {
      type: [String],
      default: ["Wi-Fi"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: "Available",
    },
    x: {
      type: Number,
      default: 20,
    },
    y: {
      type: Number,
      default: 35,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronous hook for Mongoose 8
spaceSchema.pre("save", function () {
  const total = this.totalSeats || 40;
  const occupied = this.occupiedSeats || 0;
  const free = total - occupied;
  const fillPercentage = (occupied / total) * 100;

  if (fillPercentage >= 85 || free <= 5) {
    this.status = "Busy";
  } else if (fillPercentage >= 55 || free <= 15) {
    this.status = "Filling Up";
  } else {
    this.status = "Available";
  }
});

const Space = mongoose.model("Space", spaceSchema);
export default Space;