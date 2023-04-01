const router = require("express").Router();

// auth related endpoints
router.use("/api/v1/auth", require("./User/auth"));

module.exports = router;
