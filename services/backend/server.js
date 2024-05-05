require('dotenv').config();
const app = require('./app'); // Import the express app we defined
const db = require('./models'); // Import your Sequelize setup from index.js

// Function to start the server
const startServer = async () => {
  try {
    // Sync database
    await db.syncAll({ force: false }); // Change to { force: true } only if you understand the consequences
    console.log('Database synchronized successfully.');

    // Start listening for requests
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
};

startServer();
