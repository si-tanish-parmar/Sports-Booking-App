const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sports_app',
  password: 'postgres',
  port: 5432, // Default PostgreSQL port
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define API routes
app.get("/api/venues", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM venues");
    const venues = result.rows;
    client.release();
    res.json(venues);
  } catch (err) {
    console.error("Error fetching venues", err);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/api/venues", async (req, res) => {
  const {
    name,
    duration,
    selected_sports,
    startTime,
    endTime,
    date,
    equipment,
  } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO venues (name, duration, selected_sports, startTime, endTime, date, equipment) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, duration, selected_sports, startTime, endTime, date, equipment]
    );
    const newVenue = result.rows[0];
    client.release();
    res.json(newVenue);
  } catch (err) {
    console.error("Error adding venue", err);
    res.status(500).json({ error: "An error occurred" });
  }
});


app.get('/api/sports', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sports');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/equipment/:sport', async (req, res) => {
  const { sport } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM equipment WHERE sport = $1',
      [sport]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'An error occurred while fetching equipment' });
  }
});

const sportInventoryTable = `
  CREATE TABLE IF NOT EXISTS sport_inventory (
    id SERIAL PRIMARY KEY,
    venue_id INT,
    sport_id INT,
    quantity INT,
    CONSTRAINT fk_venue FOREIGN KEY (venue_id) REFERENCES venues(id),
    CONSTRAINT fk_sport FOREIGN KEY (sport_id) REFERENCES sports(id)
  )
`;

pool.query(sportInventoryTable, (err, res) => {
  if (err) {
    console.error('Error creating sport_inventory table:', err);
  } else {
    console.log('Sport inventory table created');
  }
});

app.post('/api/inventory', async (req, res) => {
  const { venueId, sportId, quantity } = req.body;

  try {
    const existingInventory = await pool.query(
      'SELECT * FROM sport_inventory WHERE venue_id = $1 AND sport_id = $2',
      [venueId, sportId]
    );

    if (existingInventory.rows.length > 0) {
      await pool.query(
        'UPDATE sport_inventory SET quantity = $1 WHERE venue_id = $2 AND sport_id = $3',
        [quantity, venueId, sportId]
      );
    } else {
      await pool.query(
        'INSERT INTO sport_inventory (venue_id, sport_id, quantity) VALUES ($1, $2, $3)',
        [venueId, sportId, quantity]
      );
    }

    res.status(200).json({ message: 'Sport inventory updated successfully' });
  } catch (error) {
    console.error('Error updating sport inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const { sport } = req.query;
    let query = "SELECT * FROM bookings";

    if (sport) {
      query = `SELECT * FROM bookings WHERE sport = '${sport}'`;
    }

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { sport, equipment, duration } = req.body;
  try {
    const { rows } = await pool.query('INSERT INTO bookings(sport, equipment, duration) VALUES($1, $2, $3) RETURNING *', [sport, equipment, duration]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error making booking:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/employees/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM employees WHERE email = $1', [email]);
    client.release();
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admins/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM admins WHERE email = $1', [email]);
    client.release();
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
