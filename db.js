const mongoose = require("mongoose");

const dbURI = process.env.MONGODB_DB_URI;
const dbName = process.env.MONGODB_DB_NAME || "L2brary-demo"; 

mongoose
  .connect(dbURI, { dbName: dbName })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error: ", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = db;
