const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API);
const bcrypt = require("bcryptjs");
const User = require("../model/user");
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

exports.checkSession = (req, res, next) => {
  if (!req.session.isLogged) {
    console.log("No session");
    return res.sendStatus(401);
  } else {
    const response = {
      isLogged: req.session.isLogged,
      fullname: req.session.user.fullname,
      id: req.session.user._id,
      role: req.session.user.role,
    };
    return res.status(200).json(response);
  }
};

exports.postSignUp = (req, res, next) => {
  const userData = {
    email: req.body.email,
    fullname: req.body.fullname,
    phone: req.body.phone,
    role: req.body.role,
    password: bcrypt.hashSync(req.body.password, 12),
  };
  User.findOne({ email: userData.email }).then((data) => {
    if (!data) {
      const user = new User(userData);
      user
        .save()
        .then((user) => {
          const cart = new Cart({ user: user, status: "Pending" });
          cart.save();
          const response = { id: user._id, fullname: user.fullname };
          return res.status(200).json(response);
        })
        .catch((err) => res.sendStatus(500));
    } else {
      res.statusCode = 402;
      res.statusMessage = "Email already exist";
      return res.end();
    }
  });
};

exports.postSignIn = (req, res, next) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      res.statusCode = 401;
      res.statusMessage = "Email not exist";
      return res.end();
    }
    if (req.body.reqAdmin && user.role === "user") {
      res.statusCode = 401;
      res.statusMessage = "Prohibited";
      return res.end();
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      res.statusCode = 402;
      res.statusMessage = "Password not correct";
      return res.end();
    }

    Cart.findOne({ user: user, status: "Pending" })
      .then((cart) => {
        req.session.isLogged = true;
        req.session.user = user;
        req.session.cart = cart;
        const response = {
          id: user._id,
          fullname: user.fullname,
          role: user.role,
        };
        console.log("Login success");
        return res.status(200).json(response);
      })
      .catch((err) => console.log(err));
  });
};

exports.checkAdmin = (req, res, next) => {
  if (req.session.user?.role === "admin") {
    next();
  } else {
    return res.sendStatus(403);
  }
};

exports.postLogOut = (req, res, next) => {
  console.log("Destroy session");
  req.session.destroy((err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
};

exports.postSendMail = async (req, res, next) => {
  const cartId = req.session?.cart;
  const originalItemArr = await CartItem.find({
    cartId: cartId,
  }).populate("productId");
  const formattedItemArr = originalItemArr.map((item) => {
    const data = {
      text: item.productId.name,
      img1: item.productId.img1,
      type1: item.productId.type1,
      price: convertMoney(item.productId.price),
      quantity: item.quantity,
    };
    console.log(item.productId.type1);
    return data;
  });
  const total = originalItemArr.reduce((sum, value) => {
    let price = value.productId.price * value.quantity;
    return (sum += price);
  }, 0);

  const template_data = {
    total: convertMoney(total),
    items: formattedItemArr,
    receipt: true,
    name: req.body.fullname,
    address: req.body.address,
    phone: req.body.phone,
    // address02: "Apt. 123",
    // city: "Place",
    // state: "CO",
    // zip: "80202",
  };
  // console.log(JSON.stringify(template_data));
  await Cart.findByIdAndUpdate(cartId, {
    status: "Confirmed",
    name: req.body.fullname,
    phone: req.body.phone,
    address: req.body.address,
    total: convertMoney(total),
  });
  const newCart = new Cart({
    user: req.session.user,
    status: "Pending",
  });
  newCart.save().then(() => {
    req.session.cart = newCart._id;
  });

  sgMail
    .send({
      to: req.body.email,
      from: "khangnguyeniz1010@gmail.com",
      subject: "E-Shopping Receipt",
      // text: "and easy to do anywhere, even with Node.js",
      templateId: "d-60c5cb82cd6d4e34a5796f851c571186",
      dynamicTemplateData: template_data,
    })
    .then(() => {
      console.log("Email sent");
      return res.status(200).end();
    })
    .catch((error) => {
      return res.status(401).send(error.toString());
    });
  // console.log(req.body);
  // return res.status(200).end();
};
