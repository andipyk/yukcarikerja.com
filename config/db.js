const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB conected... ^^");
  } catch (error) {
    console.log(`Error during connect db : ${error.message}`);

    // Exit process if failure
    process.exit(1);
  }
};

module.exports = connectDB;
