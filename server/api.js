const express = require("express");
const router = express.Router();
const venueController = require("./venueController");

// Define API routes for venues

// Get all venues
router.get("/venues", venueController.getAllVenues);

// Create a new venue
router.post("/venues", venueController.createVenue);

// Update a venue by ID
router.put("/venues/:id", venueController.updateVenue);

// Delete a venue by ID
router.delete("/venues/:id", venueController.deleteVenue);

module.exports = router;
