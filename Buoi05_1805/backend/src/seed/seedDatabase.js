import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { Cart, Otp, Product, User } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  await connectDB();

  const filePath = path.join(__dirname, "sampleData.json");
  const sampleData = JSON.parse(await fs.readFile(filePath, "utf8"));

  const users = await Promise.all(
    sampleData.users.map(async (user) => ({
      ...user,
      email: user.email.toLowerCase().trim(),
      password: await bcrypt.hash(user.password, 10),
      refreshTokens: [],
    })),
  );

  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    Otp.deleteMany({}),
  ]);
  await User.insertMany(users);
  await Product.insertMany(sampleData.products);

  console.log(
    `Seeded ${users.length} users and ${sampleData.products.length} products.`,
  );
}

seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
