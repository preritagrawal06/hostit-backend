const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByEmail, createUser } = require("./userRepository");

const userSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  username: z.string(),
});

const signupController = async (req, res, next) => {
  try {
    const parsedResult = userSchema.safeParse(await req.body);

    if (parsedResult.error) {
      return res.json({
        success: false,
        message: "Please check your input details",
      });
    }

    const { email, username, password } = parsedResult.data;

    const temp = await getUserByEmail(email);

    if (temp) {
      return res.json({
        success: false,
        message: "Email already exist",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await createUser(email, username, hashPassword);

    const token = jwt.sign(user, "valarmorghulis");

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      project: user.Project
    };
    console.log(userData);
    res.json({
      success: true,
      message: "Signup Successful",
      token,
      user: userData
    });
  } catch (error) {
    console.log("error cause: ", error.message);
    res.json({
      success: false,
      message: "something went wrong",
    });
  }
};

module.exports = signupController;
