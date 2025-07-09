const mongoose = require("mongoose");

require("dotenv").config();

const connect = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("db connected"))
    .catch((error) => {
      console.log("db not connected");
      console.log(error);
      process.exit(1);
    });
};

module.exports = { connect };
