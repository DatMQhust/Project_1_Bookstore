const passport = require("passport");
const jwtStrategy = require("passport-jwt").Strategy;
const db = require("../config/databaseMySQL"); 
const extractJWTFromCookie = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["session"];
    }
    return token;
};

const options = {
    jwtFromRequest: extractJWTFromCookie,
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
};

passport.use(
    "jwt-admin",
    new jwtStrategy(options, async (req, jwtPayload, done) => {
        try {
            const { id } = { ...jwtPayload };
            const [admin] = await db.query('select * from users where userID = ?',[id]);
            if (!admin || !(admin[0].role === "admin")) {
                return done(null, false);
            }
            req.user = admin;
            return done(null, admin);
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    "jwt",
    new jwtStrategy(options, async (req, jwtPayload, done) => {
        try {
            const { id } = { ...jwtPayload };
            const [user] = await db.query('SELECT `userID` FROM `users` WHERE `userID` = ?', [id]);
                    if (user) {
                        req.user = user[0];
                        return done(null, user[0]);
                    }
                
            }
         catch (error) {
            return done(error, false);
        }
    })
);

module.exports = passport;
