const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: Schema.Types.String,
    required: true,
  },
  fullname: {
    type: Schema.Types.String,
    required: true,
  },
  phone: {
    type: Schema.Types.String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
