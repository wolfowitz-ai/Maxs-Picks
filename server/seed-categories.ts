import { storage } from "./storage";

const defaultCategories = [
  { name: "Toys", icon: "toy-brick" },
  { name: "Treats", icon: "cookie" },
  { name: "Gear", icon: "backpack" },
  { name: "Grooming", icon: "scissors" },
];

async function seedCategories() {
  console.log("🏷️ Seeding categories...");
  
  try {
    const existingCategories = await storage.getAllCategories();
    
    if (existingCategories.length > 0) {
      console.log("✅ Categories already seeded. Skipping.");
      return;
    }

    for (const category of defaultCategories) {
      await storage.createCategory(category);
      console.log(`✅ Created category: ${category.name}`);
    }

    console.log("🎉 Categories seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
