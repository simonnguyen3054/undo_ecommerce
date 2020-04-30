const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = (req, res) => {
  Category.findById(id).exec(err, category) => {
    if(err || !category) {
      return res.status(400).json({
        error: errorHandler(err);
      })
    }
    req.category = this.category;
    next();
  }
};

exports.create = (req, res) => {
  const category = new Category(req.body);
  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }

    res.json({ data });
  });
};

exports.read = (req, res) => {
  return res.json(req.category);
};


