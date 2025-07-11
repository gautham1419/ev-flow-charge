
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getBookings, addBooking, getStations } = require('../utils/dataHelpers');

// GET /api/bookings - Get all bookings
router.get('/bookings', (req, res) => {
  try {
    const bookings = getBookings();
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// POST /api/bookings - Create a new booking
router.post('/bookings', (req, res) => {
  try {
    const { stationId, duration, timeSlot, customerName, customerEmail } = req.body;
    
    // Validate required fields
    if (!stationId || !duration || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: stationId, duration, and timeSlot are required'
      });
    }
    
    // Check if station exists
    const stations = getStations();
    const station = stations.find(s => s.id === stationId);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }
    
    // Create new booking
    const newBooking = {
      id: uuidv4(),
      stationId,
      stationName: station.name,
      stationType: station.type,
      duration: parseInt(duration),
      timeSlot,
      customerName: customerName || 'Anonymous',
      customerEmail: customerEmail || '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      totalCost: calculateCost(station, duration)
    };
    
    addBooking(newBooking);
    
    res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// GET /api/bookings/:id - Get specific booking
router.get('/bookings/:id', (req, res) => {
  try {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
});

// Helper function to calculate cost
function calculateCost(station, duration) {
  const price = station.price;
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  
  if (station.type === 'swap') {
    return `$${numericPrice.toFixed(2)}`;
  } else {
    // For charging stations, estimate based on duration (rough calculation)
    const estimatedCost = numericPrice * (duration / 60) * 50; // Assuming 50kWh average
    return `$${estimatedCost.toFixed(2)}`;
  }
}

module.exports = router;
