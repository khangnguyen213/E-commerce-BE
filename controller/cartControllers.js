const Cart = require("../model/cart");
const CartItem = require("../model/cartItem");

const convertMoney = (money) => {
  const str = money + "";
  let output = "";

  let count = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    count++;
    output = str[i] + output;

    if (count % 3 === 0 && i !== 0) {
      output = "." + output;
      count = 0;
    }
  }

  return output;
};

exports.getCart = (req, res, next) => {
  if (!req.session.cart) {
    return res.status(401).json("Login required");
  }
  const cartId = req.session.cart;
  CartItem.find({ cartId: cartId })
    .populate("productId")
    .then((cartItems) => res.status(200).json(cartItems));
};

exports.postUpdateCart = (req, res, next) => {
  const productUpdatedId = req.body.productId;
  const method = req.body.method;
  const updatedQuantity = req.body.quantity;
  if (!req.session.cart) {
    return res.status(401).json("Login required");
  }
  const cartId = req.session.cart;

  CartItem.findOne({
    cartId: cartId,
    productId: productUpdatedId,
  }).then((item) => {
    if (!item) {
      if (method === "delete") {
        return res.status(400).json("No cart found");
      }
      const cartItem = new CartItem({
        cartId: cartId,
        productId: productUpdatedId,
        quantity: updatedQuantity,
      });
      cartItem
        .save()
        .then((item) => res.status(200).json("Cart Updated"))
        .catch((err) => res.status(400).json(err.toString()));
    } else {
      if (method === "delete") {
        item.quantity -= updatedQuantity;
      } else if (method === "add") {
        item.quantity += updatedQuantity;
      }
      item
        .save()
        .then((i) => res.status(200).json("Cart Updated"))
        .catch((err) => res.status(400).json(err.toString()));
    }
  });
};

exports.postDeleteCartItem = (req, res, next) => {
  const productDeletedId = req.body.productId;
  if (!req.session.cart) {
    return res.status(401).json("Login required");
  }
  const cartId = req.session.cart;
  CartItem.findOneAndRemove({ cartId: cartId, productId: productDeletedId })
    .then(() => {
      return res.status(200).json("Cart item Deleted");
    })
    .catch((err) => console.log(err.toString()));
};

exports.getHistory = (req, res, next) => {
  const userId = req.session.user;
  Cart.find({ user: userId }).then((carts) => {
    return res.status(200).json(carts);
  });
};

exports.getDetailHistory = async (req, res, next) => {
  const cartId = req.params.cartId;
  const cart = await Cart.findById(cartId);
  const cartItems = await CartItem.find({ cartId: cartId }).populate(
    "productId"
  );
  const response = { cart, cartItems };
  return res.status(200).json(response);
};

exports.getAllCart = (req, res, next) => {
  Cart.find({ status: "Confirmed" }).then((carts) => {
    return res.status(200).json(carts);
  });
};
