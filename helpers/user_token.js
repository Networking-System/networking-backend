const jwt = require('jsonwebtoken')

const UserToken = require('../models/UserToken')


const verifyRefreshToken = (refreshToken) => {
    const privateKey = "secret"

    return new Promise((resolve, reject) => {
        UserToken.findOne({ token: refreshToken }, (err, doc) => {
            if (!doc)
            return reject({ error: true, message: "Invalid refresh token" });

            jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
                if (err)
                    return reject({ error: true, message: "Invalid refresh token" })
                
                resolve({
                    tokenDetails,
                    error: false,
                    message: "Valid refresh token",
                });
            })
        })
    })
}

async function generateTokens(user) {
    try {
        const payload = { _id: user._id, roles: user.roles };
        const accessToken = jwt.sign(
            payload,
            "secret",
            { expiresIn: "14m" }
        )

        const refreshToken = jwt.sign(
            payload,
            "secret",
            { expiresIn: "30d" }
        )

        const userToken = await UserToken.findOne({ user_id: user._id });
        if (userToken) await UserToken.findOneAndRemove()
        
        await new UserToken({ user_id: user._id, token: refreshToken }).save()
        return Promise.resolve({ accessToken, refreshToken })
    } catch (error) {
        return Promise.reject(error);
    }
}

module.exports = {
    verifyRefreshToken,
    generateTokens
}