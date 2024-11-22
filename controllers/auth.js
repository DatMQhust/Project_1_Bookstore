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
        const [role] = await db.query("INSERT INTO role (userID,roleID) VALUES (?,?)",[userID,"user"]);
    if (result.affectedRows === 1 && role.affectedRows === 1) {
            return  res.status(201).redirect('/login');
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
        const [user] = await db.query("select user.*,role.roleID from user,role where user.username = ? and user.userID = role.userID",[username]);
        if (user.length === 0) {
            return  res.status(400).json({ message: "Invalid username or password" });
        }
        const isMatch = await bcrypt.compare(password, user[0].password);
        
        if (!isMatch) {
            return  res.status(400).json({message: "Wrong Password"});
        }
        const payload = {
            id: user[0].userID,
            role: user[0].roleID,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        if (user[0].roleID =="admin"){
            return res.status(200).cookie("session", token).json({message:"Logined as Admin"});
        }
        else{
            return res.status(200).cookie("session", token).json({message:"Login sucessful"})
        }
    }
    catch (error) {
        return  res.status(500).redirect("/login");
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
          res.status(200).json({ message: "Authorized", user: user[0] });
    } catch (error) {
          res.status(401).json({ message: "Unauthorized" });
    }
}