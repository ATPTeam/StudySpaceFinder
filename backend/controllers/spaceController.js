import StudySpace from '../models/StudySpace.js';

// 1. GET all spaces with query filters
export const getSpaces = async (req, res) => {
  try {
    const { search, building, vibe, facility } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (building && building !== 'All') {
      query.building = building;
    }

    if (vibe && vibe !== 'All') {
      query.vibe = vibe;
    }

    if (facility && facility !== 'All') {
      query.facilities = { $in: [facility] };
    }

    const spaces = await StudySpace.find(query).sort({ building: 1, floor: 1 });

    res.status(200).json({
      success: true,
      count: spaces.length,
      data: spaces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spaces',
      error: error.message
    });
  }
};

// 2. GET unique metadata for frontend filter pills/dropdowns
export const getSpaceMetadata = async (req, res) => {
  try {
    const buildings = await StudySpace.distinct('building');
    const vibes = await StudySpace.distinct('vibe');
    const allFacilities = await StudySpace.distinct('facilities');

    res.status(200).json({
      success: true,
      data: {
        buildings: ['All', ...buildings],
        vibes: ['All', ...vibes],
        facilities: ['All', ...allFacilities]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metadata',
      error: error.message
    });
  }
};

// 3. GET single space with dynamic AI prediction
export const getSpaceById = async (req, res) => {
  try {
    const space = await StudySpace.findById(req.params.id);

    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    const currentHour = new Date().getHours();
    const predictedLoadCurrent = space.hourlyTrends[currentHour] || 50;
    const predictedLoadNext = space.hourlyTrends[(currentHour + 1) % 24] || 50;

    let predictionText = 'Normal occupancy expected.';
    if (predictedLoadCurrent >= 80) {
      predictionText = `Peak hours right now (~${predictedLoadCurrent}% typical crowd). Best to arrive after ${(currentHour + 2) % 12 || 12}:00.`;
    } else if (predictedLoadNext > 75) {
      predictionText = `Expected to reach ${predictedLoadNext}% capacity in the next hour.`;
    } else {
      predictionText = `Great time to study! Typical crowd is low (~${predictedLoadCurrent}%).`;
    }

    res.status(200).json({
      success: true,
      data: space,
      prediction: {
        currentHour,
        predictedOccupancyPercent: predictedLoadCurrent,
        forecastMessage: predictionText,
        hourlyTrendArray: space.hourlyTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching space details',
      error: error.message
    });
  }
};

// 4. 1-Tap Pulse Verification (Refreshes timestamp without seat count change)
export const pingVerification = async (req, res) => {
  try {
    const space = await StudySpace.findById(req.params.id);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Space not found' });
    }

    space.lastUpdated = new Date();
    await space.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('spaceUpdated', space);
    }

    res.status(200).json({
      success: true,
      message: 'Status freshness confirmed!',
      data: space
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};