const mongoose = require('mongoose');
const Admin = require('./models/admin'); // Adjust path to your model
const bcrypt = require('bcrypt');
require('dotenv').config();

const createAdmin = async () => {
    try {
        // 1. Connect to your Database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/your_db_name');
        console.log("Connected to MongoDB...");

        const email = "admin@example.com";
        const password = "password";
        const name = "Super Admin";

        // 2. Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log("Admin with this email already exists!");
            process.exit();
        }

        // 3. Hash the password manually
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Create and Save
        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassword
        });

        await newAdmin.save();
        console.log("---------------------------------");
        console.log("Admin created successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("---------------------------------");

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        mongoose.disconnect();
    }
};

createAdmin();