import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedProduct {
  title?: string;
  description?: string;
  price?: string;
  rating?: string;
  reviews?: number;
  image?: string;
  images?: string[];
  amazonUrl?: string;
  asin?: string;
}

export function extractASINFromUrl(urlOrAsin: string): string {
  if (/^[A-Z0-9]{10}$/i.test(urlOrAsin)) {
    return urlOrAsin.toUpperCase();
  }
  
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
  ];
  
  for (const pattern of patterns) {
    const match = urlOrAsin.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }
  
  throw new Error("Could not extract ASIN from URL");
}

async function scrapeDirectly(asin: string, imageCount: number): Promise<ScrapedProduct> {
  const url = `https://www.amazon.com/dp/${asin}`;
  
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  
  const images: string[] = [];
  
  const mainImage = $("#landingImage").attr("src") || $("#imgBlkFront").attr("src");
  if (mainImage) {
    images.push(mainImage);
  }
  
  $("#altImages .a-button-thumbnail img").each((i, el) => {
    if (images.length >= imageCount) return false;
    const thumbSrc = $(el).attr("src");
    if (thumbSrc) {
      const largeSrc = thumbSrc.replace(/\._[^.]+_\./, "._SL1500_.");
      if (!images.includes(largeSrc)) {
        images.push(largeSrc);
      }
    }
  });
  
  const priceWhole = $(".a-price .a-price-whole").first().text().trim();
  const priceFraction = $(".a-price .a-price-fraction").first().text().trim();
  let price: string | undefined;
  if (priceWhole) {
    price = `${priceWhole.replace(/[,$]/g, "")}${priceFraction || "00"}`;
  }
  
  const ratingText = $("span.a-icon-alt").first().text();
  const ratingMatch = ratingText.match(/(\d\.?\d?)/);
  const rating = ratingMatch ? ratingMatch[1] : undefined;
  
  const reviewText = $("#acrCustomerReviewText").first().text();
  const reviewMatch = reviewText.match(/([\d,]+)/);
  const reviews = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ""), 10) : 0;
  
  const features: string[] = [];
  $("#feature-bullets .a-list-item").each((i, el) => {
    if (i < 3) {
      features.push($(el).text().trim());
    }
  });

  return {
    asin,
    title: $("#productTitle").text().trim() || undefined,
    description: features.join(" ") || undefined,
    price,
    rating,
    reviews,
    image: images[0],
    images: images.slice(0, imageCount),
    amazonUrl: url,
  };
}

async function scrapeWithScraperAPI(asin: string, imageCount: number): Promise<ScrapedProduct> {
  const apiKey = process.env.SCRAPER_API_KEY;
  
  if (!apiKey) {
    throw new Error("SCRAPER_API_KEY not configured");
  }
  
  const targetUrl = `https://www.amazon.com/dp/${asin}`;
  const apiUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&render=true`;
  
  const response = await axios.get(apiUrl, { timeout: 60000 });
  const $ = cheerio.load(response.data);
  
  const images: string[] = [];
  const mainImage = $("#landingImage").attr("src") || $("#imgBlkFront").attr("src");
  if (mainImage) {
    images.push(mainImage);
  }
  
  $("#altImages .a-button-thumbnail img").each((i, el) => {
    if (images.length >= imageCount) return false;
    const thumbSrc = $(el).attr("src");
    if (thumbSrc) {
      const largeSrc = thumbSrc.replace(/\._[^.]+_\./, "._SL1500_.");
      if (!images.includes(largeSrc)) {
        images.push(largeSrc);
      }
    }
  });
  
  const priceWhole = $(".a-price .a-price-whole").first().text().trim();
  const priceFraction = $(".a-price .a-price-fraction").first().text().trim();
  let price: string | undefined;
  if (priceWhole) {
    price = `${priceWhole.replace(/[,$]/g, "")}${priceFraction || "00"}`;
  }
  
  const ratingText = $("span.a-icon-alt").first().text();
  const ratingMatch = ratingText.match(/(\d\.?\d?)/);
  const rating = ratingMatch ? ratingMatch[1] : undefined;
  
  const reviewText = $("#acrCustomerReviewText").first().text();
  const reviewMatch = reviewText.match(/([\d,]+)/);
  const reviews = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, ""), 10) : 0;
  
  const features: string[] = [];
  $("#feature-bullets .a-list-item").each((i, el) => {
    if (i < 3) {
      features.push($(el).text().trim());
    }
  });

  return {
    asin,
    title: $("#productTitle").text().trim() || undefined,
    description: features.join(" ") || undefined,
    price,
    rating,
    reviews,
    image: images[0],
    images: images.slice(0, imageCount),
    amazonUrl: targetUrl,
  };
}

export async function scrapeAmazonProduct(urlOrAsin: string, imageCount: number = 1): Promise<ScrapedProduct> {
  const asin = extractASINFromUrl(urlOrAsin);
  
  try {
    console.log(`Attempting direct scrape for ASIN: ${asin}`);
    return await scrapeDirectly(asin, imageCount);
  } catch (directError) {
    console.log("Direct scraping failed, trying ScraperAPI fallback...", directError);
    
    if (process.env.SCRAPER_API_KEY) {
      try {
        return await scrapeWithScraperAPI(asin, imageCount);
      } catch (scraperError) {
        console.error("ScraperAPI also failed:", scraperError);
        throw new Error("Both direct scraping and ScraperAPI failed. Amazon may be blocking requests.");
      }
    }
    
    throw new Error("Direct scraping failed and no SCRAPER_API_KEY configured for fallback. Please add a ScraperAPI key or try the PA-API method.");
  }
}
