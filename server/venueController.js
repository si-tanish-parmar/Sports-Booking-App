const Venue = require("./Venue");


// Get all venues
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create a new venue
const createVenue = async (req, res) => {
  const { name, duration } = req.body;

  try {
    const venue = new Venue({ name, duration });
    await venue.save();
    res.status(201).json(venue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update a venue by ID
const updateVenue = async (req, res) => {
  const { id } = req.params;
  const { name, duration } = req.body;

  try {
    const venue = await Venue.findByIdAndUpdate(id, { name, duration }, { new: true });
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete a venue by ID
const deleteVenue = async (req, res) => {
  const { id } = req.params;

  try {
    const venue = await Venue.findByIdAndRemove(id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAllVenues,
  createVenue,
  updateVenue,
  deleteVenue,
};
