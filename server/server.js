
const express = require('express');
const cors = require('cors');
const stationsRoutes = require('./routes/stations');
const bookingsRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', stationsRoutes);
app.use('/api', bookingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ChargeSmart API is running!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ChargeSmart server running on port ${PORT}`);
});
