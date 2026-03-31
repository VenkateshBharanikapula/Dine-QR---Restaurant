// menuData.js
// ✅ All image paths have spaces encoded as %20 so browsers load them instantly

export const CATEGORIES = [
  "Burgers",
  "Pizza",
  "Snacks",
  "Pasta",
  "Salads",
  "Wraps",
  "Beverages",
  "Desserts",
];

const DEFAULT_AVAILABLE = true;

const menuData = [
  // Burgers
  {
    _id: "1",
    name: "Classic Veg Burger",
    price: 120,
    category: CATEGORIES[0],
    image: "/images/Classic%20Veg%20Burger.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "2",
    name: "Cheese Burger",
    price: 150,
    category: CATEGORIES[0],
    image: "/images/Cheese%20Burger.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "3",
    name: "Chicken Burger",
    price: 180,
    category: CATEGORIES[0],
    image: "/images/Chicken%20Burger.jpg",
    available: DEFAULT_AVAILABLE,
  },

  // Pizza
  {
    _id: "4",
    name: "Margherita Pizza",
    price: 250,
    category: CATEGORIES[1],
    image: "/images/Margherita%20Pizza.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "5",
    name: "Pepperoni Pizza",
    price: 300,
    category: CATEGORIES[1],
    image: "/images/Pepperoni%20Pizza.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "6",
    name: "Veggie Supreme Pizza",
    price: 280,
    category: CATEGORIES[1],
    image: "/images/Veggie%20Supreme%20Pizza.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "7",
    name: "BBQ Chicken Pizza",
    price: 320,
    category: CATEGORIES[1],
    image: "/images/BBQ%20Chicken%20Pizza.jpg",
    available: DEFAULT_AVAILABLE,
  },

  // Snacks
  {
    _id: "8",
    name: "French Fries",
    price: 90,
    category: CATEGORIES[2],
    // ✅ Replaced external Unsplash URL with a local placeholder
    // Add a "French Fries.jpg" to your /public/images/ folder
    // or swap this with any local image you have
    image: "/images/French%20Fries.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "9",
    name: "Onion Rings",
    price: 100,
    category: CATEGORIES[2],
    image: "/images/Onion%20Rings.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "10",
    name: "Nachos with Cheese",
    price: 150,
    category: CATEGORIES[2],
    image: "/images/Nachos%20with%20Cheese.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "11",
    name: "Grilled Sandwich",
    price: 130,
    category: CATEGORIES[2],
    image: "/images/Grilled%20Sandwich.jpg",
    available: DEFAULT_AVAILABLE,
  },

  // Pasta
  {
    _id: "12",
    name: "Pasta Alfredo",
    price: 220,
    category: CATEGORIES[3],
    image: "/images/Pasta%20Alfredo.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "13",
    name: "Pasta Arrabiata",
    price: 210,
    category: CATEGORIES[3],
    image: "/images/Pasta%20Arrabiata.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "14",
    name: "Pasta Pesto",
    price: 230,
    category: CATEGORIES[3],
    image: "/images/Pasta%20Pesto.jpg",
    available: DEFAULT_AVAILABLE,
  },

  // Salads
  {
    _id: "15",
    name: "Caesar Salad",
    price: 180,
    category: CATEGORIES[4],
    image: "/images/Caesar%20Salad.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "16",
    name: "Greek Salad",
    price: 190,
    category: CATEGORIES[4],
    image: "/images/Greek%20Salad.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "17",
    name: "Garden Fresh Salad",
    price: 170,
    category: CATEGORIES[4],
    image: "/images/Garden%20Fresh%20Salad.jpg",
    available: DEFAULT_AVAILABLE,
  },

  // Wraps
  {
    _id: "18",
    name: "Veggie Wrap",
    price: 140,
    category: CATEGORIES[5],
    image: "/images/Veggie%20Wrap.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "19",
    name: "Chicken Wrap",
    price: 180,
    category: CATEGORIES[5],
    image: "/images/Chicken%20Wrap.jpg",
    available: DEFAULT_AVAILABLE,
  },

  // Beverages
  {
    _id: "20",
    name: "Fresh Lemonade",
    price: 80,
    category: CATEGORIES[6],
    image: "/images/Fresh%20Lemonade.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "21",
    name: "Iced Coffee",
    price: 120,
    category: CATEGORIES[6],
    image: "/images/Iced%20Coffee.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "22",
    name: "Mango Smoothie",
    price: 150,
    category: CATEGORIES[6],
    image: "/images/Mango%20Smoothie.jpg",
    available: DEFAULT_AVAILABLE,
  },

  // Desserts
  {
    _id: "23",
    name: "Chocolate Brownie",
    price: 120,
    category: CATEGORIES[7],
    image: "/images/Chocolate%20Brownie.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "24",
    name: "Vanilla Ice Cream",
    price: 100,
    category: CATEGORIES[7],
    image: "/images/Vanilla%20Ice%20Cream.jpg",
    available: DEFAULT_AVAILABLE,
  },
  {
    _id: "25",
    name: "Cheesecake Slice",
    price: 180,
    category: CATEGORIES[7],
    image: "/images/Cheesecake%20Slice.jpg",
    available: DEFAULT_AVAILABLE,
  },
];

export default menuData;