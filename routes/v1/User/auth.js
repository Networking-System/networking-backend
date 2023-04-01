const bcrypt = require("bcryptjs/dist/bcrypt");
const {
  registerUser,
  loginUser,
  forgotPassword,
  recoverPassword
} = require("../../../controllers/authController");
const { generateTokens } = require("../../../helpers/user_token");
const User = require("../../../models/User");
const { registerValidation } = require("./validation/authValidation");

const router = require("express").Router();

//REGISTRATION
router.post('/register', async (req, res, next) => {
  try {
    const result = await registerUser(req);
    if (result.status === 'success') {
      return res.status(200).json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    next(error);
  }
});

//LOGIN
router.post('/login', async (req, res) => {
  var email = req.body.email
  var password = req.body.password

  //simple validation of the email and password
  const {
    error
  } = registerValidation(req.body)
  if (error) return {
    message: error.details[0].message
  }

  //check if email exists & comparing passwords
  const user = await User.findOne({
    email: email
  })

  const validPass = await bcrypt.compareSync(password, user.password)

  if (!user || !validPass) return {
    message: "Invalid credentials"
  }

  //create and assign a token
  // const token = jwt.sign({_id: user._id}, process.env.SECRET)
  const {
    accessToken,
    refreshToken
  } = await generateTokens(user)

  res.header('auth-token', accessToken).json({
    email,
    // token,
    accessToken,
    refreshToken,
    'accessTokenExpiresAt': 840,
    'refreshTokenExpireAt': 2592000,
    "id": user._id,
    "email": user.email
  })
})

//FORGOT PASSWORD
router.post('/forgot-password', async (req, res, next) => {
  try {
    const result = await forgotPassword(req);
    if (result.status === 'success') {
      return res.status(200).json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    next(error);
  }
})

//FORGOT PASSWORD
router.post('/recover-password', async (req, res, next) => {
  try {
    const result = await recoverPassword(req);
    if (result.status === 200) {
      return res.status(200).json(result);
    }
    return res.status(400).json(result);
  } catch (error) {
    next(error);
  }
})
module.exports = router;