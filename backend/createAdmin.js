
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("./models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("\n=== EcoPulse Admin Setup ===\n");

    const firstName = (await ask("Admin first name: ")).trim();
    const lastName = (await ask("Admin last name: ")).trim();
    const email = (await ask("Admin email: ")).trim().toLowerCase();
    const password = await ask("New admin password: ");

    if (!firstName || !lastName || !email || password.length < 8) {
      throw new Error(
        "Enter valid details. Password must be at least 8 characters."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.firstName = firstName;
      admin.lastName = lastName;
      admin.passwordHash = passwordHash;
      admin.role = "admin";
      admin.isActive = true;

      await admin.save();

      console.log("\nAdmin account updated successfully!");
    } else {
      await User.create({
        firstName,
        lastName,
        email,
        passwordHash,
        role: "admin",
        isActive: true,
      });

      console.log("\nAdmin account created successfully!");
    }

    console.log("Email:", email);
    console.log("Role: admin");
    console.log("Password: updated successfully");

  } catch (error) {
    console.error("\nAdmin setup failed:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

createAdmin();
