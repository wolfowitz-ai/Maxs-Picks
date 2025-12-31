import { storage } from "./storage";

const seedProducts = [
  {
    title: "Indestructible Blue Ball",
    description: "The toughest rubber ball for the most energetic pups. Bounces unpredictably!",
    maxsTake: "This is my absolute favorite! It bounces everywhere and I can chew on it for hours without it breaking. Plus, it's BLUE!",
    price: "12.99",
    rating: "4.8",
    reviews: 1240,
    image: "/attached_assets/generated_images/blue_rubber_dog_ball_toy.png",
    category: "Toys",
    amazonUrl: "https://amazon.com/dp/B08EXAMPLE1",
    asin: "B08EXAMPLE1",
  },
  {
    title: "Gourmet Organic Treats",
    description: "All-natural ingredients, grain-free, and delicious. Perfect for training.",
    maxsTake: "I will do literally anything for one of these. Sit, stay, roll over... you name it. They smell amazing!",
    price: "18.50",
    rating: "4.9",
    reviews: 856,
    image: "/attached_assets/generated_images/gourmet_dog_treats_bag.png",
    category: "Treats",
    amazonUrl: "https://amazon.com/dp/B08EXAMPLE2",
    asin: "B08EXAMPLE2",
  },
  {
    title: "Cloud Nine Plush Bed",
    description: "Orthopedic memory foam with a calming shag cover. Machine washable.",
    maxsTake: "After a long day of chasing squirrels, this is the only place I want to nap. It feels like hugging a cloud.",
    price: "45.99",
    rating: "4.7",
    reviews: 3200,
    image: "/attached_assets/generated_images/cozy_plush_dog_bed.png",
    category: "Gear",
    amazonUrl: "https://amazon.com/dp/B08EXAMPLE3",
    asin: "B08EXAMPLE3",
  },
];

async function seed() {
  console.log("🌱 Seeding database...");
  
  try {
    // Check if products already exist
    const existingProducts = await storage.getAllProducts();
    
    if (existingProducts.length > 0) {
      console.log("✅ Database already seeded. Skipping.");
      return;
    }

    // Seed products
    for (const product of seedProducts) {
      await storage.createProduct(product);
      console.log(`✅ Created product: ${product.title}`);
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
