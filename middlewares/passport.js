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
            const [admin] = await db.query('select * from user,role where user.userID = ? and user.userID = role.userID',[id]);
            if (!admin || !(admin[0].roleID === "admin")) {
                return done(null, false);
            }
            req.user = admin[0];
            return done(null, admin[0]);
        } catch (error) {
            return done(error, false);
        }
    })
);

passport.use(
    "jwt",
    new jwtStrategy(options, async (req, jwtPayload, done) => {
        try {
            const { id } = jwtPayload; // Trích xuất `id` từ payload của JWT
            const [user] = await db.query('SELECT `userID` FROM `user` WHERE `userID` = ?', [id]);

            // Kiểm tra nếu user tồn tại
            if (user.length > 0) {
                req.user = user[0]; // Gán user vào req.user
                return done(null, user[0]); // Thành công, truyền user vào callback
            }

            // Không tìm thấy user
            return done(null, false);
        } catch (error) {
            return done(error, false); // Trả về lỗi nếu xảy ra lỗi
        }
    })
);

module.exports = passport;
