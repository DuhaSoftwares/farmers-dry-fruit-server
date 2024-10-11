const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const categoryRoutes = require("./routes/category-routes");
const productRoutes = require("./routes/product-routes");
const cartRoutes = require("./routes/cart-routes");
dotenv.config();
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');

app.use(express.json());
app.use(cookieParser()); 
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
// Enable CORS for all localhost requests
app.use(
  cors({
    origin: true, 
    credentials: true,
    methods: "POST,GET,PUT,OPTIONS,DELETE", // Make sure you're not blocking
    // pre-flight OPTIONS requests
  })
);

// MongoDB Connection
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI );
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process on connection error
  }
};

// Initialize the database connection
connectToDatabase();

// Routes
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// Start Server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err); // Log error if server fails to start
    process.exit(1); // Exit process on server start error
  }
};

// Start the server
startServer();
