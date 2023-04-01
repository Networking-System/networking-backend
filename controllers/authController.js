const User = require('../models/User');
const bcrypt = require('bcryptjs/dist/bcrypt') //encrypting the password

const {
    registerValidation,
    emailValidation
} = require('../routes/v1/User/validation/authValidation');
const {
    encryptPassword, 
} = require('../helpers/functions');
const {
    generateTokens
} = require('../helpers/user_token');
const { v4: uuid } = require('uuid')
const EMAILBODY = require('../helpers/mail_body')
const sendMail = require('../helpers/send_email')


async function registerUser(req) {
    email = req.body.email
    password = req.body.password
    //simple validation of the email and password
    const {
        error
    } = registerValidation(req.body)
    if (error) return {
        message: error.details[0].message
    }

    //check if user exists
    const emailExists = await User.findOne({
        email: email
    })
    if (emailExists) return {
        message: "User already exists"
    }

    //create new user
    const user = new User({
        email: email,
        password: encryptPassword(password),
    })
    try {
        const saveUser = await user.save()
        if (saveUser) {
            const email_body = BaseTemplate(
                'Welcome to Ecentials',
                'Your account has been created successfully',
                `Login and get access to great healthcare services.`,
                "imgs/logo_ios.png",
                "not-me-password-reset"
            );

            await sendMail(email, email_body);

            return {
                message: "User created successfully"
            }
        }
    } catch (err) {
        return {
            message: err
        }
    }
}


async function forgotPassword(req) {
    var email = req.body.email

    //simple validation of the email and password
    const {
        error
    } = emailValidation(req.body)
    if (error) return {
        status: 400,
        message: error.details[0].message
    }
    const isUserEmail = await User.findOne({
        email: email
    })
    if (!isUserEmail) {
        return {
            status: 400,
            message: "User does not exist. Please create an account instead"
        }
    }
    return {
        status: 200,
        message: "User exists"
    }
}

async function recoverPassword(req) {
    // send email to user to start password reset process
    const {
        email
    } = req.body;
    
    let code = `${uuid()}`.substring(0, 6).toUpperCase()
    // let mail_body = EMAILBODY(code, "imgs/logo_ios.png", "not-me-password-reset")
    let mail_body = EMAILBODY(code, "", "not-me-password-reset")


    if (email === '') {
        return {
            status: 400,
            message: 'user email not provided.'
        }
    }

    sendMail(email, mail_body).then(result => {
        // set the code sent to the user
        // this will be validated against to check if user has permission to change
        // password
        RecoveryCode.create({
            email,
            code
        }, (err, _) => {
            if (err) {
                return {
                    status: 400,
                    message: 'Something went wrong. Try again later'
                }
            }
            return {
                status: 200,
                message: 'A verification has been sent to your email.'
            }
        });
    }).catch(err => {
        return {
            status: 400,
            message: "Could not send verification code. Try again later.",
            data: err
        }
    })
}
module.exports = {
    registerUser,
    forgotPassword, 
    recoverPassword
};