import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedProduct {
  title?: string;
  description?: string;
  price?: string;
  rating?: string;
  reviews?: number;
  image?: string;
  asin?: string;
}

export async function scrapeAmazonProduct(urlOrAsin: string): Promise<ScrapedProduct> {
  try {
    // Extract ASIN from URL or use directly if it's an ASIN
    let asin = urlOrAsin;
    
    // Check if it's a URL and extract ASIN
    if (urlOrAsin.includes("amazon.com") || urlOrAsin.includes("amzn")) {
      const asinMatch = urlOrAsin.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/i);
      if (asinMatch) {
        asin = asinMatch[1] || asinMatch[2];
      }
    }

    // Construct Amazon URL
    const url = `https://www.amazon.com/dp/${asin}`;
    
    // Fetch the page with headers to mimic a browser
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      },
      timeout: 10000, // 10 second timeout
    });

    const $ = cheerio.load(response.data);
    
    // Extract product details
    const product: ScrapedProduct = {
      asin,
      title: $("#productTitle").text().trim() || undefined,
      description: $("#feature-bullets .a-list-item").first().text().trim() || undefined,
      image: $("#landingImage").attr("src") || $("#imgBlkFront").attr("src") || undefined,
    };

    // Extract price
    const priceWhole = $(".a-price .a-price-whole").first().text().trim();
    const priceFraction = $(".a-price .a-price-fraction").first().text().trim();
    if (priceWhole) {
      product.price = `${priceWhole.replace(",", "")}${priceFraction || "00"}`.replace("$", "");
    }

    // Extract rating
    const ratingText = $("span.a-icon-alt").first().text();
    const ratingMatch = ratingText.match(/(\d\.\d)/);
    if (ratingMatch) {
      product.rating = ratingMatch[1];
    }

    // Extract number of reviews
    const reviewText = $("#acrCustomerReviewText").first().text();
    const reviewMatch = reviewText.match(/([\d,]+)/);
    if (reviewMatch) {
      product.reviews = parseInt(reviewMatch[1].replace(/,/g, ""), 10);
    }

    return product;
  } catch (error) {
    console.error("Error scraping Amazon product:", error);
    throw new Error("Failed to scrape product. The URL may be invalid or Amazon is blocking the request.");
  }
}
