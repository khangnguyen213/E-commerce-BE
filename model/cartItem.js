const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  quantity: Schema.Types.Number,
  cartId: { type: Schema.Types.ObjectId, ref: "Cart" },
});

module.exports = mongoose.model("CartItem", cartItemSchema);
