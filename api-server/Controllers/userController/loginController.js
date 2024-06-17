const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUserByEmail } = require("./userRepository");

const userSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const loginController = async(req, res, next)=>{

    try {
        const parsedResult = userSchema.safeParse(await req.body);

        if (parsedResult.error) {
            return res.json({
                success: false,
                message: "Please check your input details",
            });
        }

        const { email, password } = parsedResult.data;

        const user = await getUserByEmail(email)

        if(!user){
            return res.json({
                success: false,
                message: "Email not registered!"
            })
        }

        const verifyPass = await bcrypt.compare(password, user.password)

        if(!verifyPass){
            return res.json({
                success: false,
                message:"Please check your password again"
            })
        }
        // console.log(user);
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            project: user.Project
        }

        const token = jwt.sign(user, "valarmorghulis")

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: userData
        })

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: "Something went wrong"
        })
    }
}

module.exports = loginController