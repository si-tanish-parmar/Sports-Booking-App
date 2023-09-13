const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'postgres',
  database: 'your_database_name',
  username: 'your_database_user',
  password: 'your_database_password',
  host: 'localhost', // Change this to your database host
  port: 5432, // Change this to your database port
});

// Define the Venue model
const Venue = sequelize.define('Venue', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

// Synchronize the model with the database (create the table if it doesn't exist)
sequelize.sync()
  .then(() => {
    console.log('Venue table created successfully');
  })
  .catch((err) => {
    console.error('Error creating Venue table:', err);
  });

module.exports = Venue;
