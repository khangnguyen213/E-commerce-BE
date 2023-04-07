const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
// const helmet = require("helmet");
// const compression = require("compression");
const MongoDBStore = require("connect-mongodb-session")(session);
const port = process.env.PORT || 5000;
const mongodbURL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.btdla2l.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
const app = express();
const store = new MongoDBStore({
  uri: mongodbURL,
  collection: "sessions",
});

const userControllers = require("./controller/userControllers");
const productControllers = require("./controller/productControllers");
const cartControllers = require("./controller/cartControllers");
app.use(
  cors({
    origin: process.env.COR_ORIGIN.split(","),
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
// app.use(helmet());
// app.use(compression());
// app.use((req, res, next) => {
//   res.send("Server on");
//   next();
// });
app.use(express.json());
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: "none", secure: true, maxAge: 1000 * 60 * 60 },
    store: store,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(multer().array("images", 5));

app.get("/check-session", userControllers.checkSession);

//Sign up
app.post("/users/signup", userControllers.postSignUp);

//Sign in
app.post("/users/signin", userControllers.postSignIn);

//add-product
app.post(
  "/add-product",
  userControllers.checkAdmin,
  productControllers.postAddProduct
);

//edit-product
app.post(
  "/edit-product",
  userControllers.checkAdmin,
  productControllers.postEditProduct
);

//delete product
app.post(
  "/delete-product",
  userControllers.checkAdmin,
  productControllers.postDeleteProduct
);

//Fetch all product
app.get("/products", productControllers.getProducts);

app.get("/products/pagination", productControllers.getFilteredProducts);

//Fetch product detail
app.get("/products/:productId", productControllers.getProductDetail);

app.get("/cart", cartControllers.getCart);

app.post("/cart/update", cartControllers.postUpdateCart);

app.post("/cart/delete", cartControllers.postDeleteCartItem);

app.get("/users/logout", userControllers.postLogOut);
app.post("/users/send-mail", userControllers.postSendMail);

//get user cart
app.get("/users/cart", cartControllers.getHistory);

app.get("/users/cart/:cartId", cartControllers.getDetailHistory);

//get all cart (admin only)
app.get("/admin/carts", userControllers.checkAdmin, cartControllers.getAllCart);

app.use(express.static("images"));

mongoose
  .connect(mongodbURL)
  .then((result) => {
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
