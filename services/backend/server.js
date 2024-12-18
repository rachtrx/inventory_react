require('dotenv/config');
const app = require('./app.js');
const db = require('./models');
// const connectDB = require('./models/mongo');

const printRoutes = (app) => {
	console.log('Registered routes:');
	app._router.stack.forEach((middleware) => {
	  if (middleware.route) { // Routes registered directly on the app
      Object.keys(middleware.route.methods).forEach((method) => {
        console.log(`${method.toUpperCase()} ${middleware.route.path}`);
      });
	  } else if (middleware.name === 'router') { // Router middleware
      middleware.handle.stack.forEach((handler) => {
        const route = handler.route;
        if (route) {
          Object.keys(route.methods).forEach((method) => {
            console.log(`${method.toUpperCase()} ${route.path}`);
          });
        }
		  });
	  }
	});
};

// Function to start the server
const startServer = async () => {
  try {
    // Sync database
    await db.syncAll({ alter: true }); // Change to { force: true } only if you understand the consequences
    // await connectDB()
    console.log('Database synchronized successfully.');

    // Start listening for requests
    const PORT = process.env.PORT || 3001;
    printRoutes(app);
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
};

startServer();
