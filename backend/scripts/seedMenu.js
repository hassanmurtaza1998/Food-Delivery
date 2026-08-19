import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import foodModel from "../models/foodModel.js";

// Cycles through the 32 stock photos already in /uploads as placeholder
// images — swap these out via the admin panel once you have real photos.
const IMAGES = [
  "1722865444288food_1.png", "1722865514626food_2.png", "1722865628915food_3.png", "1722865668073food_4.png",
  "1722865738489food_5.png", "1722865934153food_6.png", "1722865976487food_7.png", "1722866043779food_8.png",
  "1722866109947food_9.png", "1722866148130food_10.png", "1722866329894food_11.png", "1722866385025food_12.png",
  "1722866412882food_13.png", "1722866469319food_14.png", "1722866504992food_15.png", "1722866560218food_16.png",
  "1722866610567food_17.png", "1722866647952food_18.png", "1722866694357food_19.png", "1722866729053food_20.png",
  "1722866777756food_21.png", "1722866830901food_22.png", "1722866871307food_23.png", "1722866909328food_24.png",
  "1722866948105food_25.png", "1722867018540food_26.png", "1722867053413food_27.png", "1722867110108food_28.png",
  "1722867144188food_29.png", "1722867222977food_30.png", "1722867254829food_31.png", "1722867630288food_32.png",
];

const dishes = [
  // Salad
  { name: "Greek Salad", description: "Crisp cucumber, tomato, olives, and feta tossed in olive oil.", price: 12, category: "Salad", isVeg: true, isBestseller: true, spiceLevel: "None", prepTimeMinutes: 10, rating: 4.6 },
  { name: "Veg Garden Salad", description: "A light mix of seasonal vegetables and mixed greens.", price: 10, category: "Salad", isVeg: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.2 },
  { name: "Caesar Salad", description: "Romaine, parmesan, croutons, and a classic Caesar dressing.", price: 13, discountPrice: 10, category: "Salad", isVeg: true, spiceLevel: "None", prepTimeMinutes: 10, rating: 4.4 },
  { name: "Grilled Chicken Caesar Salad", description: "Caesar salad topped with grilled chicken breast.", price: 15, category: "Salad", isVeg: false, isBestseller: true, spiceLevel: "Mild", prepTimeMinutes: 15, rating: 4.7 },
  { name: "Quinoa Power Salad", description: "Quinoa, chickpeas, roasted veggies, and a lemon vinaigrette.", price: 11, category: "Salad", isVeg: true, spiceLevel: "None", prepTimeMinutes: 12, rating: 4.3 },
  { name: "Fruit & Nut Salad", description: "Seasonal fruits tossed with candied walnuts and honey.", price: 9, category: "Salad", isVeg: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.5 },
  { name: "Spicy Thai Salad", description: "Crunchy vegetables in a spicy Thai chili-lime dressing.", price: 12, discountPrice: 9, category: "Salad", isVeg: true, spiceLevel: "Hot", prepTimeMinutes: 12, rating: 4.1 },

  // Rolls
  { name: "Peri Peri Chicken Roll", description: "Smoky grilled chicken wrapped with peri peri sauce and slaw.", price: 12, category: "Rolls", isVeg: false, isBestseller: true, spiceLevel: "Hot", prepTimeMinutes: 15, rating: 4.6 },
  { name: "Paneer Tikka Roll", description: "Spiced paneer tikka wrapped in a soft tortilla.", price: 11, category: "Rolls", isVeg: true, spiceLevel: "Medium", prepTimeMinutes: 14, rating: 4.4 },
  { name: "Veg Spring Roll", description: "Crispy rolls stuffed with mixed vegetables.", price: 8, discountPrice: 6, category: "Rolls", isVeg: true, spiceLevel: "Mild", prepTimeMinutes: 12, rating: 4.2 },
  { name: "Egg Roll", description: "Fluffy egg and onions wrapped in a warm paratha.", price: 9, category: "Rolls", isVeg: false, spiceLevel: "Mild", prepTimeMinutes: 10, rating: 4.0 },
  { name: "Lasagna Roll", description: "Rolled lasagna sheets baked with cheese and marinara.", price: 13, category: "Rolls", isVeg: true, spiceLevel: "None", prepTimeMinutes: 20, rating: 4.5 },
  { name: "Kathi Roll", description: "Classic street-style kathi roll with spiced chicken.", price: 10, discountPrice: 8, category: "Rolls", isVeg: false, spiceLevel: "Medium", prepTimeMinutes: 15, rating: 4.3 },

  // Deserts
  { name: "Chocolate Ice Cream", description: "Rich Belgian chocolate ice cream.", price: 7, category: "Deserts", isVeg: true, spiceLevel: "None", prepTimeMinutes: 5, rating: 4.5 },
  { name: "Vanilla Bean Ice Cream", description: "Classic vanilla ice cream made with real vanilla bean.", price: 6, category: "Deserts", isVeg: true, spiceLevel: "None", prepTimeMinutes: 5, rating: 4.3 },
  { name: "Strawberry Ice Cream", description: "Creamy ice cream loaded with fresh strawberries.", price: 7, category: "Deserts", isVeg: true, spiceLevel: "None", prepTimeMinutes: 5, rating: 4.4 },
  { name: "Classic Cheesecake", description: "Rich and creamy New York style cheesecake with a buttery crust.", price: 9, category: "Deserts", isVeg: true, isBestseller: true, spiceLevel: "None", prepTimeMinutes: 5, rating: 4.8 },
  { name: "Tiramisu", description: "Layers of espresso-soaked sponge and mascarpone cream.", price: 10, category: "Deserts", isVeg: true, isBestseller: true, spiceLevel: "None", prepTimeMinutes: 5, rating: 4.7 },
  { name: "Brownie Sundae", description: "Warm fudge brownie topped with vanilla ice cream.", price: 8, discountPrice: 6, category: "Deserts", isVeg: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.6 },
  { name: "Fruit Parfait", description: "Layered yogurt, granola, and fresh seasonal fruit.", price: 7, category: "Deserts", isVeg: true, spiceLevel: "None", prepTimeMinutes: 6, rating: 4.1 },

  // Sandwich
  { name: "Grilled Chicken Sandwich", description: "Grilled chicken breast with lettuce and mayo on toasted bread.", price: 10, category: "Sandwich", isVeg: false, spiceLevel: "Mild", prepTimeMinutes: 12, rating: 4.4 },
  { name: "Club Sandwich", description: "Triple-decker with chicken, egg, cheese, and veggies.", price: 11, category: "Sandwich", isVeg: false, isBestseller: true, spiceLevel: "None", prepTimeMinutes: 14, rating: 4.6 },
  { name: "Grilled Veg Sandwich", description: "Toasted multigrain bread packed with grilled seasonal vegetables.", price: 9, discountPrice: 7, category: "Sandwich", isVeg: true, spiceLevel: "None", prepTimeMinutes: 12, rating: 4.2 },
  { name: "Egg Mayo Sandwich", description: "Classic egg salad on soft white bread.", price: 8, category: "Sandwich", isVeg: false, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.0, inStock: false },
  { name: "BBQ Chicken Sandwich", description: "Smoky BBQ chicken with cheddar and pickles.", price: 12, category: "Sandwich", isVeg: false, spiceLevel: "Medium", prepTimeMinutes: 15, rating: 4.5 },
  { name: "Vegan Avocado Sandwich", description: "Smashed avocado, tomato, and sprouts on sourdough.", price: 10, category: "Sandwich", isVeg: true, spiceLevel: "None", prepTimeMinutes: 10, rating: 4.3 },

  // Cake
  { name: "Chocolate Fudge Cake", description: "Decadent layered chocolate cake with warm fudge sauce.", price: 15, category: "Cake", isVeg: true, isBestseller: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.9 },
  { name: "Red Velvet Cake", description: "Classic red velvet with cream cheese frosting.", price: 16, category: "Cake", isVeg: true, isBestseller: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.7 },
  { name: "Butterscotch Cake", description: "Soft sponge layered with butterscotch cream and nuts.", price: 14, discountPrice: 11, category: "Cake", isVeg: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.5 },
  { name: "Vanilla Sponge Cake", description: "Light and fluffy classic vanilla sponge.", price: 12, category: "Cake", isVeg: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.2 },
  { name: "Black Forest Cake", description: "Chocolate sponge, cherries, and whipped cream.", price: 15, category: "Cake", isVeg: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.6 },
  { name: "Carrot Cake", description: "Spiced carrot cake with cream cheese frosting.", price: 13, discountPrice: 10, category: "Cake", isVeg: true, spiceLevel: "None", prepTimeMinutes: 8, rating: 4.4 },

  // Pure Veg
  { name: "Garlic Mushroom", description: "Sauteed mushrooms tossed in garlic butter.", price: 11, category: "Pure Veg", isVeg: true, spiceLevel: "Mild", prepTimeMinutes: 12, rating: 4.3 },
  { name: "Fried Cauliflower", description: "Crispy golden cauliflower florets, lightly spiced.", price: 10, category: "Pure Veg", isVeg: true, spiceLevel: "Medium", prepTimeMinutes: 15, rating: 4.2 },
  { name: "Mix Veg Pulao", description: "Fragrant basmati rice cooked with mixed vegetables and whole spices.", price: 12, category: "Pure Veg", isVeg: true, isBestseller: true, spiceLevel: "Mild", prepTimeMinutes: 20, rating: 4.5 },
  { name: "Paneer Butter Masala", description: "Paneer cubes simmered in a creamy tomato gravy.", price: 14, category: "Pure Veg", isVeg: true, isBestseller: true, spiceLevel: "Medium", prepTimeMinutes: 22, rating: 4.7 },
  { name: "Dal Makhani", description: "Slow-cooked black lentils in a rich buttery gravy.", price: 11, discountPrice: 9, category: "Pure Veg", isVeg: true, spiceLevel: "Mild", prepTimeMinutes: 25, rating: 4.6 },
  { name: "Veg Kofta Curry", description: "Vegetable dumplings in a spiced tomato-cashew gravy.", price: 13, category: "Pure Veg", isVeg: true, spiceLevel: "Medium", prepTimeMinutes: 22, rating: 4.4 },

  // Pasta
  { name: "Cheese Pasta", description: "Penne tossed in a rich four-cheese sauce.", price: 13, category: "Pasta", isVeg: true, spiceLevel: "None", prepTimeMinutes: 15, rating: 4.4 },
  { name: "Tomato Basil Pasta", description: "Classic pasta in a fresh tomato and basil sauce.", price: 12, discountPrice: 10, category: "Pasta", isVeg: true, spiceLevel: "Mild", prepTimeMinutes: 15, rating: 4.3 },
  { name: "Creamy Alfredo Pasta", description: "Fettuccine in a silky parmesan cream sauce.", price: 14, category: "Pasta", isVeg: true, isBestseller: true, spiceLevel: "None", prepTimeMinutes: 16, rating: 4.6 },
  { name: "Chicken Pasta", description: "Penne with grilled chicken in a creamy tomato sauce.", price: 15, category: "Pasta", isVeg: false, isBestseller: true, spiceLevel: "Mild", prepTimeMinutes: 18, rating: 4.7 },
  { name: "Pesto Pasta", description: "Pasta tossed in fresh basil pesto and pine nuts.", price: 13, category: "Pasta", isVeg: true, spiceLevel: "None", prepTimeMinutes: 15, rating: 4.4 },
  { name: "Arrabbiata Pasta", description: "Penne in a spicy garlic and chili tomato sauce.", price: 12, category: "Pasta", isVeg: true, spiceLevel: "Hot", prepTimeMinutes: 15, rating: 4.3 },

  // Noodles
  { name: "Butter Noodles", description: "Simple stir-fried noodles tossed in garlic butter.", price: 10, category: "Noodles", isVeg: true, spiceLevel: "None", prepTimeMinutes: 15, rating: 4.1 },
  { name: "Veg Hakka Noodles", description: "Wok-tossed noodles with crunchy mixed vegetables.", price: 9, discountPrice: 7, category: "Noodles", isVeg: true, spiceLevel: "Mild", prepTimeMinutes: 15, rating: 4.3 },
  { name: "Chicken Noodles", description: "Stir-fried noodles with tender chicken and vegetables.", price: 12, category: "Noodles", isVeg: false, isBestseller: true, spiceLevel: "Medium", prepTimeMinutes: 18, rating: 4.6 },
  { name: "Somen Noodles", description: "Light Japanese wheat noodles in a savory broth.", price: 11, category: "Noodles", isVeg: true, spiceLevel: "Mild", prepTimeMinutes: 14, rating: 4.2 },
  { name: "Schezwan Noodles", description: "Fiery Indo-Chinese noodles in spicy schezwan sauce.", price: 10, category: "Noodles", isVeg: true, isBestseller: true, spiceLevel: "Hot", prepTimeMinutes: 16, rating: 4.5, inStock: false },
  { name: "Singapore Noodles", description: "Curry-spiced rice noodles with vegetables and egg.", price: 12, discountPrice: 9, category: "Noodles", isVeg: false, spiceLevel: "Medium", prepTimeMinutes: 17, rating: 4.4 },
];

const run = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL is not set. Copy backend/.env.example to backend/.env and fill it in.");
    process.exit(1);
  }

  await connectDB();

  const docs = dishes.map((dish, index) => ({
    inStock: true,
    rating: 4.0,
    ...dish,
    image: IMAGES[index % IMAGES.length],
  }));

  await foodModel.deleteMany({ name: { $in: docs.map((d) => d.name) } });
  await foodModel.insertMany(docs);
  console.log(`Seeded ${docs.length} menu items across ${new Set(docs.map((d) => d.category)).size} categories.`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Failed to seed menu:", error);
  process.exit(1);
});
