import crypto from "crypto";
import axios from "axios";

interface PAAPICredentials {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  host: string;
  region: string;
}

interface ProductData {
  title?: string;
  description?: string;
  price?: string;
  rating?: string;
  reviews?: number;
  images?: string[];
  amazonUrl?: string;
  asin?: string;
}

function getAWSSignature(
  secretKey: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Buffer {
  const kDate = crypto.createHmac("sha256", `AWS4${secretKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(regionName).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(serviceName).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
  return kSigning;
}

function createAuthHeaders(
  credentials: PAAPICredentials,
  payload: string,
  operation: string
): Record<string, string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  
  const service = "ProductAdvertisingAPI";
  const endpoint = `webservices.amazon.com`;
  const path = `/paapi5/${operation.toLowerCase()}`;
  
  const canonicalHeaders = [
    `content-encoding:amz-1.0`,
    `content-type:application/json; charset=utf-8`,
    `host:${endpoint}`,
    `x-amz-date:${amzDate}`,
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
  ].join("\n") + "\n";
  
  const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";
  const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");
  
  const canonicalRequest = [
    "POST",
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${credentials.region}/${service}/aws4_request`;
  const canonicalRequestHash = crypto.createHash("sha256").update(canonicalRequest).digest("hex");
  
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join("\n");
  
  const signingKey = getAWSSignature(credentials.secretKey, dateStamp, credentials.region, service);
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  
  const authorizationHeader = `${algorithm} Credential=${credentials.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Encoding": "amz-1.0",
    "Host": endpoint,
    "X-Amz-Date": amzDate,
    "X-Amz-Target": `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
    "Authorization": authorizationHeader,
  };
}

export async function fetchFromPAAPI(
  asin: string,
  imageCount: number = 1
): Promise<ProductData> {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;
  
  if (!accessKey || !secretKey || !partnerTag) {
    throw new Error("Amazon PA-API credentials not configured. Please add AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_PARTNER_TAG to your environment variables.");
  }
  
  const credentials: PAAPICredentials = {
    accessKey,
    secretKey,
    partnerTag,
    host: "webservices.amazon.com",
    region: "us-east-1",
  };
  
  const payload = JSON.stringify({
    ItemIds: [asin],
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.com",
    Resources: [
      "ItemInfo.Title",
      "ItemInfo.Features",
      "ItemInfo.ProductInfo",
      "Offers.Listings.Price",
      "Images.Primary.Large",
      "Images.Variants.Large",
      "CustomerReviews.StarRating",
      "CustomerReviews.Count",
    ],
  });
  
  const headers = createAuthHeaders(credentials, payload, "GetItems");
  
  try {
    const response = await axios.post(
      `https://${credentials.host}/paapi5/getitems`,
      payload,
      { headers, timeout: 10000 }
    );
    
    const item = response.data?.ItemsResult?.Items?.[0];
    
    if (!item) {
      throw new Error("Product not found in Amazon catalog");
    }
    
    const images: string[] = [];
    
    if (item.Images?.Primary?.Large?.URL) {
      images.push(item.Images.Primary.Large.URL);
    }
    
    if (item.Images?.Variants) {
      for (const variant of item.Images.Variants.slice(0, imageCount - 1)) {
        if (variant.Large?.URL) {
          images.push(variant.Large.URL);
        }
      }
    }
    
    const features = item.ItemInfo?.Features?.DisplayValues || [];
    const description = features.slice(0, 2).join(" ");
    
    return {
      title: item.ItemInfo?.Title?.DisplayValue,
      description: description || "No description available",
      price: item.Offers?.Listings?.[0]?.Price?.Amount?.toString(),
      rating: item.CustomerReviews?.StarRating?.Value?.toString(),
      reviews: parseInt(item.CustomerReviews?.Count?.DisplayValue?.replace(/,/g, "") || "0"),
      images: images.slice(0, imageCount),
      amazonUrl: item.DetailPageURL || `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`,
      asin,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.Errors?.[0]?.Message || error.message;
      throw new Error(`PA-API Error: ${errorMessage}`);
    }
    throw error;
  }
}

export function extractASIN(urlOrAsin: string): string {
  if (/^[A-Z0-9]{10}$/i.test(urlOrAsin)) {
    return urlOrAsin.toUpperCase();
  }
  
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /amazon\.com.*?([A-Z0-9]{10})/i,
  ];
  
  for (const pattern of patterns) {
    const match = urlOrAsin.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }
  
  throw new Error("Could not extract ASIN from URL. Please provide a valid Amazon product URL or ASIN.");
}
