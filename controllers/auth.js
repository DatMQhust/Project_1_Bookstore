const db = require("../config/databaseMySQL");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");

module.exports.register = async (req,res) =>{
    const {username, password, fullname, email,phone} = req.body;
    if (!username || !password || !fullname || !email || !phone) {
        return  res.status(400).json({ message: "Missing required fields" });
    }
    const phoneNumberRegex = /^\d{10}$/;
    if (!phoneNumberRegex.test(phone)) {
        return  res.status(400).json({ success: false, message: "Invalid phone number" });
    }
    // check email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return  res.status(400).json({ success: false, message: "Invalid email" });
    }
    try{
        const [users] = await db.query("SELECT * FROM user WHERE username = ?", [username]);
        console.log(users);
        if (users.length > 0) {
            return  res.status(400).json({ message: "Username already exists" });
        }
        const [emails] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
        if (emails.length > 0) {
            return  res.status(400).json({ message: "Email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userID = username+Date.now();
        const [result] = await db.query("INSERT INTO user (userID,username, password, fullname, email, phone) VALUES (?,?, ?, ?, ?, ?)", [userID,username, hashedPassword, fullname, email, phone]);
        
    if (result.affectedRows === 1) {
            return  res.status(201).json({ message: "User created" });
        }
    }
    catch (error) {
        return  res.status(500).json({ message: "Internal server error" });
    }
}
 
module.exports.login = async (req,res)=>{
    const {username, password} = req.body;
    if (!username || !password) {
        return  res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const [user] = await db.query("select * from user where username = ?",[username]);
        console.log(user.length);
        if (user.length === 0) {
            return  res.status(400).json({ message: "Invalid username or password" });
        }
        const isMatch = await bcrypt.compare(password, user[0].password);
        console.log(isMatch);
        if (!isMatch) {
            return  res.status(400).json({ message: "Wrong password" });
        }
        const payload = {
            id: user[0].userID,
            role: user[0].role,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).cookie("session", token).json({ message: "Login success" });
    }
    catch (error) {
        return  res.status(500).json({ message: "Internal server error" });
    }

}
module.exports.isLoggedIn = async (req,res)=>{
    const token = req.cookies["session"];
    if(!token){
        return  res.status(401).json({message: "Unauthorized"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [user] = await db.query("select * from user where userID = ?",[decoded.id]);
        if (user.length === 0) {
            return  res.status(401).json({ message: "Unauthorized" });
        }
          res.status(200).json({ message: "Authorized" });
    } catch (error) {
          res.status(401).json({ message: "Unauthorized" });
    }
}