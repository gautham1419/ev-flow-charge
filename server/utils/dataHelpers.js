
const fs = require('fs');
const path = require('path');

// In-memory storage for bookings
let bookings = [];

// Read stations data from JSON file
function getStations() {
  try {
    const stationsPath = path.join(__dirname, '../data/stations.json');
    const stationsData = fs.readFileSync(stationsPath, 'utf8');
    return JSON.parse(stationsData);
  } catch (error) {
    console.error('Error reading stations data:', error);
    return [];
  }
}

// Get all bookings from memory
function getBookings() {
  return bookings;
}

// Add a new booking to memory
function addBooking(booking) {
  bookings.push(booking);
  return booking;
}

// Clear all bookings (for testing)
function clearBookings() {
  bookings = [];
}

module.exports = {
  getStations,
  getBookings,
  addBooking,
  clearBookings
};
