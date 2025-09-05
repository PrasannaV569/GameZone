const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); 
console.log(">>> Server.js loaded");

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Atlas connected successfully!"))
    .catch(err => console.error("Could not connect to MongoDB Atlas:", err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const Users = mongoose.model("Users", userSchema);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/register", async (req, res) => {
    const { name, email, password } = req.query;

    const existingUser = await Users.findOne({ email, name, password });
    if (existingUser) {
        return res.send("User already exists! Try logging in.");
    }

    const user = new Users({ name, email, password });
    await user.save();
    console.log("Registered user:", user);
    
    res.send("Registration successful! You can now log in.");
});

app.post("/post", async (req, res) => {
    const { name, password } = req.body;

    const user = await Users.findOne({ name, password });

    if (user) {
        console.log("User logged in:", user);
        res.sendFile(path.join(__dirname, "Page.html"));
    } else {
        res.send("Invalid credentials! Please try again.");
    }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "v.p.infinix@gmail.com",
        pass: "frpf qlje snue kytw"
    }
});

app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: email,
        to: "v.p.infinix@gmail.com",
        subject: `New contact from GameZone: ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong></p>
               <p>${message}</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send("Message sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Failed to send message.");
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});
