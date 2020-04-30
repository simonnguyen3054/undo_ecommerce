const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { create, categoryById, read } = require("../controllers/category");

router.get("/category/:categoryId", read);
router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);

//run categoryById middleware whenever there's a categoryId in the route
router.param("categoryId", categoryById);
//run everytime there's a userId param
router.param("userId", userById);

module.exports = router;
