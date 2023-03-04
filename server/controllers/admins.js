const { generateAccessToken } = require("../middleware/RouteProtector");
const { body, param, validationResult } = require("express-validator");
const { Admin } = require("../database/models");

const create = async (req, res) => {
  // TODO:
  req.status(501).json({ detail: "Not Implemented" }).end();
};

const login = [
  body("email")
    .exists()
    .withMessage("User email required")
    .isString()
    .withMessage("User email should be of type string")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Empty user email is not allowed")
    .isEmail()
    .withMessage("User email is not correct"),
  body("password")
    .exists()
    .withMessage("User password required")
    .isString()
    .withMessage("User password should be of type string")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Empty user password is not allowed"),
  async (req, res) => {
    try {
      // Get user input
      const { email, password } = req.body;
      let user = await Admin.findOne({ where: { email, password }, raw: true });

      if (!user)
        return res
          .status(401)
          .json({ detail: "Incorrect user/password pair" })
          .end();

      token = generateAccessToken(user);
      res.status(200).json({ accessToken: token }).end();
    } catch (e) {
      console.log(e);
      res.status(400).end();
    }
  },
];

module.exports = {
  create,
  login,
};
