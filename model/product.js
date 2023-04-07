const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
  },
  category: {
    type: Schema.Types.String,
    required: true,
  },
  price: {
    type: Schema.Types.String,
    required: true,
  },
  img1: {
    type: Schema.Types.String,
    required: true,
  },
  type1: {
    type: Schema.Types.String,
    required: true,
  },
  img2: {
    type: Schema.Types.String,
  },
  type2: {
    type: Schema.Types.String,
  },
  img3: {
    type: Schema.Types.String,
  },
  type3: {
    type: Schema.Types.String,
  },
  img4: {
    type: Schema.Types.String,
  },
  type4: {
    type: Schema.Types.String,
  },
  short_desc: {
    type: Schema.Types.String,
    required: true,
  },
  long_desc: {
    type: Schema.Types.String,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
