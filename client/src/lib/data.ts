import maxHero from "@assets/generated_images/happy_maltipoo_dog_named_max_wearing_a_blue_bandana.png";
import ballToy from "@assets/generated_images/blue_rubber_dog_ball_toy.png";
import treats from "@assets/generated_images/gourmet_dog_treats_bag.png";
import dogBed from "@assets/generated_images/cozy_plush_dog_bed.png";

export interface Product {
  id: string;
  title: string;
  description: string;
  maxsTake: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: "Toys" | "Treats" | "Gear" | "Grooming";
  amazonUrl: string;
}

export const categories = ["All", "Toys", "Treats", "Gear", "Grooming"];

export const products: Product[] = [
  {
    id: "1",
    title: "Indestructible Blue Ball",
    description: "The toughest rubber ball for the most energetic pups. Bounces unpredictably!",
    maxsTake: "This is my absolute favorite! It bounces everywhere and I can chew on it for hours without it breaking. Plus, it's BLUE!",
    price: 12.99,
    rating: 4.8,
    reviews: 1240,
    image: ballToy,
    category: "Toys",
    amazonUrl: "#",
  },
  {
    id: "2",
    title: "Gourmet Organic Treats",
    description: "All-natural ingredients, grain-free, and delicious. Perfect for training.",
    maxsTake: "I will do literally anything for one of these. Sit, stay, roll over... you name it. They smell amazing!",
    price: 18.50,
    rating: 4.9,
    reviews: 856,
    image: treats,
    category: "Treats",
    amazonUrl: "#",
  },
  {
    id: "3",
    title: "Cloud Nine Plush Bed",
    description: "Orthopedic memory foam with a calming shag cover. Machine washable.",
    maxsTake: "After a long day of chasing squirrels, this is the only place I want to nap. It feels like hugging a cloud.",
    price: 45.99,
    rating: 4.7,
    reviews: 3200,
    image: dogBed,
    category: "Gear",
    amazonUrl: "#",
  },
];

export { maxHero };
