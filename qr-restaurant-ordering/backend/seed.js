import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "./src/models/MenuItem.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding ✅");

    // Clear old data
    await MenuItem.deleteMany();
    console.log("Old menu cleared 🗑️");

    // Insert all 25 items matching your frontend menuData.js
    await MenuItem.insertMany([

      // 🍔 Burgers
      {
        name: "Classic Veg Burger",
        price: 120,
        category: "Burgers",
        image: "/images/Classic%20Veg%20Burger.jpg",
        available: true,
      },
      {
        name: "Cheese Burger",
        price: 150,
        category: "Burgers",
        image: "/images/Cheese%20Burger.jpg",
        available: true,
      },
      {
        name: "Chicken Burger",
        price: 180,
        category: "Burgers",
        image: "/images/Chicken%20Burger.jpg",
        available: true,
      },

      // 🍕 Pizza
      {
        name: "Margherita Pizza",
        price: 250,
        category: "Pizza",
        image: "/images/Margherita%20Pizza.jpg",
        available: true,
      },
      {
        name: "Pepperoni Pizza",
        price: 300,
        category: "Pizza",
        image: "/images/Pepperoni%20Pizza.jpg",
        available: true,
      },
      {
        name: "Veggie Supreme Pizza",
        price: 280,
        category: "Pizza",
        image: "/images/Veggie%20Supreme%20Pizza.jpg",
        available: true,
      },
      {
        name: "BBQ Chicken Pizza",
        price: 320,
        category: "Pizza",
        image: "/images/BBQ%20Chicken%20Pizza.jpg",
        available: true,
      },

      // 🍟 Snacks
      {
        name: "French Fries",
        price: 90,
        category: "Snacks",
        image: "/images/Nachos%20with%20Cheese.jpg",
        available: true,
      },
      {
        name: "Onion Rings",
        price: 100,
        category: "Snacks",
        image: "/images/Onion%20Rings.jpg",
        available: true,
      },
      {
        name: "Nachos with Cheese",
        price: 150,
        category: "Snacks",
        image: "/images/Nachos%20with%20Cheese.jpg",
        available: true,
      },
      {
        name: "Grilled Sandwich",
        price: 130,
        category: "Snacks",
        image: "/images/Grilled%20Sandwich.jpg",
        available: true,
      },

      // 🍝 Pasta
      {
        name: "Pasta Alfredo",
        price: 220,
        category: "Pasta",
        image: "/images/Pasta%20Alfredo.jpg",
        available: true,
      },
      {
        name: "Pasta Arrabiata",
        price: 210,
        category: "Pasta",
        image: "/images/Pasta%20Arrabiata.jpg",
        available: true,
      },
      {
        name: "Pasta Pesto",
        price: 230,
        category: "Pasta",
        image: "/images/Pasta%20Pesto.jpg",
        available: true,
      },

      // 🥗 Salads
      {
        name: "Caesar Salad",
        price: 180,
        category: "Salads",
        image: "/images/Caesar%20Salad.jpg",
        available: true,
      },
      {
        name: "Greek Salad",
        price: 190,
        category: "Salads",
        image: "/images/Greek%20Salad.jpg",
        available: true,
      },
      {
        name: "Garden Fresh Salad",
        price: 170,
        category: "Salads",
        image: "/images/Garden%20Fresh%20Salad.jpg",
        available: true,
      },

      // 🌯 Wraps
      {
        name: "Veggie Wrap",
        price: 140,
        category: "Wraps",
        image: "/images/Veggie%20Wrap.jpg",
        available: true,
      },
      {
        name: "Chicken Wrap",
        price: 180,
        category: "Wraps",
        image: "/images/Chicken%20Wrap.jpg",
        available: true,
      },

      // 🥤 Beverages
      {
        name: "Fresh Lemonade",
        price: 80,
        category: "Beverages",
        image: "/images/Fresh%20Lemonade.jpg",
        available: true,
      },
      {
        name: "Iced Coffee",
        price: 120,
        category: "Beverages",
        image: "/images/Iced%20Coffee.jpg",
        available: true,
      },
      {
        name: "Mango Smoothie",
        price: 150,
        category: "Beverages",
        image: "/images/Mango%20Smoothie.jpg",
        available: true,
      },

      // 🍰 Desserts
      {
        name: "Chocolate Brownie",
        price: 120,
        category: "Desserts",
        image: "/images/Chocolate%20Brownie.jpg",
        available: true,
      },
      {
        name: "Vanilla Ice Cream",
        price: 100,
        category: "Desserts",
        image: "/images/Vanilla%20Ice%20Cream.jpg",
        available: true,
      },
      {
        name: "Cheesecake Slice",
        price: 180,
        category: "Desserts",
        image: "/images/Cheesecake%20Slice.jpg",
        available: true,
      },
    ]);

    console.log("✅ 25 Menu Items Seeded Successfully! 🍔🍕🥗🍰");
    process.exit();
  } catch (error) {
    console.error("Seeding Error ❌", error);
    process.exit(1);
  }
};

seedData();