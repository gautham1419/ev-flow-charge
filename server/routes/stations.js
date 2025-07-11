
const express = require('express');
const router = express.Router();
const { getStations } = require('../utils/dataHelpers');

// GET /api/stations - Get all charging stations
router.get('/stations', (req, res) => {
  try {
    const stations = getStations();
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stations'
    });
  }
});

// GET /api/stations/:id - Get specific station
router.get('/stations/:id', (req, res) => {
  try {
    const stations = getStations();
    const station = stations.find(s => s.id === req.params.id);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }
    
    res.json({
      success: true,
      data: station
    });
  } catch (error) {
    console.error('Error fetching station:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch station'
    });
  }
});

module.exports = router;
