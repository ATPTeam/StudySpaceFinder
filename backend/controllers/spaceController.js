import Space from "../models/Space.js";

// GET /api/spaces
export const getSpaces = async (req, res) => {
  try {
    const spaces = await Space.find().sort({ building: 1, name: 1 });
    res.status(200).json({ success: true, data: spaces });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch spaces", error: error.message });
  }
};

// GET /api/spaces/:id
export const getSpaceById = async (req, res) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    res.status(200).json({ success: true, data: space });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};