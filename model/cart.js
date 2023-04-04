const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: Schema.Types.String,
    required: true,
  },
  name: String,
  phone: String,
  address: String,
  total: String,
});

module.exports = mongoose.model("Cart", cartSchema);
