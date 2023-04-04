const Product = require("../model/product");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now().toString() + "-" + file.originalname);
  },
});

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

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Only .png, .jpg and .jpeg format allowed!");
      err.name = "ExtensionError";
      return cb(err);
    }
  },
}).array("images[]", 4);

exports.postAddProduct = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res
        .status(500)
        .send({
          error: { message: `Multer uploading error: ${err.message}` },
        })
        .end();
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      if (err.name == "ExtensionError") {
        res
          .status(413)
          .send({ error: { message: err.message } })
          .end();
      } else {
        res
          .status(500)
          .send({
            error: { message: `unknown uploading error: ${err.message}` },
          })
          .end();
      }
      return;
    }

    // Everything went fine.
    // show file `req.files`
    // show body `req.body`
    const name = req.body.name;
    const category = req.body.category;
    const short_desc = req.body.short_desc;
    const long_desc = req.body.long_desc;
    const price = req.body.price;
    const img1 = `http://localhost:5000/${req.files[0].filename}`;
    const infor = {
      name,
      category,
      price,
      short_desc,
      long_desc,
      img1,
    };
    if (req.files[1]) {
      infor.img2 = `http://localhost:5000/${req.files[1].filename}`;
    }
    if (req.files[2]) {
      infor.img3 = `http://localhost:5000/${req.files[2].filename}`;
    }
    if (req.files[3]) {
      infor.img4 = `http://localhost:5000/${req.files[3].filename}`;
    }
    console.log(infor);

    const product = new Product(infor);
    product
      .save()
      .then(() => {
        res.status(200).end("Your files uploaded.");
      })
      .catch((err) => res.sendStatus(500));
  });
};

exports.postEditProduct = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res
        .status(500)
        .send({ error: { message: `Multer uploading error: ${err.message}` } })
        .end();
      return;
    } else if (err) {
      // An unknown error occurred when uploading.
      if (err.name == "ExtensionError") {
        res
          .status(413)
          .send({ error: { message: err.message } })
          .end();
      } else {
        res
          .status(500)
          .send({
            error: { message: `unknown uploading error: ${err.message}` },
          })
          .end();
      }
      return;
    }

    // Everything went fine.
    // show file `req.files`
    // show body `req.body`
    const name = req.body.name;
    const category = req.body.category;
    const short_desc = req.body.short_desc;
    const long_desc = req.body.long_desc;
    const price = req.body.price;

    const updateInfor = {
      name,
      category,
      price,
      short_desc,
      long_desc,
    };

    if (req.files[0]) {
      updateInfor.img1 = `http://localhost:5000/${req.files[0].filename}`;
    }
    if (req.files[1]) {
      updateInfor.img2 = `http://localhost:5000/${req.files[1].filename}`;
    }
    if (req.files[2]) {
      updateInfor.img3 = `http://localhost:5000/${req.files[2].filename}`;
    }
    if (req.files[3]) {
      updateInfor.img4 = `http://localhost:5000/${req.files[3].filename}`;
    }

    console.log(updateInfor);

    Product.findOneAndUpdate({ _id: req.body.productId }, updateInfor)
      .then((product) => {
        console.log(product);
        return res.sendStatus(200);
      })
      .catch((err) => console.log(err));
  });
};

exports.postDeleteProduct = (req, res, next) => {
  Product.deleteOne({ _id: req.body.productId })
    .then((a) => {
      console.log(a);
      return res.sendStatus(200);
    })
    .catch((err) => res.sendStatus(500));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      if (!products || products.length === 0) {
        throw new Error("No database found");
      }
      return res.status(200).json(products);
    })
    .catch((err) => {
      res.statusCode = 401;
      res.statusMessage = err.toString();
      return res.end();
    });
};

exports.getFilteredProducts = (req, res, next) => {
  const category = req.query.category ? req.query.category : null;
  const count = req.query.count ? +req.query.count : 8;
  const page = req.query.page ? +req.query.page : 1;
  const search = req.query.search ? req.query.search : null;

  if (category && category === "all") {
    Product.find().then((products) => {
      const start =
        products.length > page * count - count
          ? page * count - count
          : products.length;
      const end =
        products.length > page * count ? page * count : products.length;
      const result = products.slice(start, end);
      if (result.length > 0) {
        return res.status(200).json(result);
      } else {
        res.statusCode = 401;
        res.statusMessage = "Products not found";
        return res.end();
      }
    });
  }
  if (category && category !== "all") {
    Product.find({ category: category }).then((products) => {
      const start =
        products.length > page * count - count
          ? page * count - count
          : products.length;
      const end =
        products.length > page * count ? page * count : products.length;
      const result = products.slice(start, end);
      if (result.length > 0) {
        return res.status(200).json(result);
      } else {
        res.statusCode = 401;
        res.statusMessage = "Products not found";
        return res.end();
      }
    });
  }
};

exports.getProductDetail = (req, res, next) => {
  Product.findById(req.params.productId)
    .then((product) => res.status(200).json(product))
    .catch((err) => console.log(err));
};
