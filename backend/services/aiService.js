import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const isDemoMode = !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY;

// ─── Gemini API Custom Fetch Call ───────────────────────────────────────
const callGemini = async (systemPrompt, userPrompt, jsonMode = false, temperature = 0.7) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [
      {
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 1000
    }
  };

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  if (jsonMode) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response received from Gemini API');
  }

  return text;
};

// ─── Demo/Mock Responses ───────────────────────────────────────────────

const mockDescriptions = {
  Electronics: (name, price) => `Discover the ${name} — a cutting-edge device engineered for peak performance and seamless integration into your digital lifestyle. Featuring premium build quality and intuitive controls, this product delivers exceptional value at $${price}. Whether you're a tech enthusiast or a casual user, the ${name} combines innovation with reliability, making it the perfect addition to your setup. Backed by our quality guarantee and responsive customer support.`,
  Clothing: (name, price) => `Elevate your wardrobe with the ${name} — a carefully crafted piece that blends contemporary style with everyday comfort. Made from premium materials, this versatile addition transitions effortlessly from casual outings to polished looks. At $${price}, it offers exceptional quality without compromise. Available in multiple sizes to ensure the perfect fit for every body type.`,
  'Home & Kitchen': (name, price) => `Transform your living space with the ${name}. This thoughtfully designed home essential combines functionality with modern aesthetics, making it a standout addition to any room. Built with durable, easy-to-maintain materials, it's priced at $${price} to bring both style and practicality to your daily routine. A must-have for anyone who appreciates quality home products.`,
  Sports: (name, price) => `Take your performance to the next level with the ${name}. Engineered for athletes and fitness enthusiasts alike, this product delivers superior comfort and durability where it matters most. At $${price}, it represents a smart investment in your active lifestyle. Whether you're training, competing, or enjoying recreational activities, the ${name} is built to keep up.`,
  Beauty: (name, price) => `Indulge in the luxury of the ${name} — a premium beauty essential formulated to deliver visible results. Crafted with carefully selected ingredients, this product pampers your skin while providing long-lasting benefits. At $${price}, it's an affordable luxury that elevates your self-care routine to spa-quality standards.`,
  default: (name, price) => `Introducing the ${name} — a premium product designed with quality and customer satisfaction in mind. At $${price}, it delivers outstanding value with superior craftsmanship and attention to detail. Perfect for discerning customers who demand the best, this product stands out in its category with reliable performance and elegant design.`
};

const mockSeoTags = {
  Electronics: (name) => [`${name.toLowerCase()}`, 'electronics', 'tech gadgets', 'smart devices', 'premium tech', 'digital lifestyle', 'innovative technology', 'best electronics', 'tech deals', 'gadget review'],
  Clothing: (name) => [`${name.toLowerCase()}`, 'fashion', 'clothing', 'style', 'wardrobe essentials', 'trendy outfit', 'comfortable wear', 'premium fabric', 'casual fashion', 'online shopping'],
  'Home & Kitchen': (name) => [`${name.toLowerCase()}`, 'home decor', 'kitchen essentials', 'home improvement', 'modern design', 'household items', 'interior design', 'quality homeware', 'kitchen tools', 'home living'],
  Sports: (name) => [`${name.toLowerCase()}`, 'sports gear', 'fitness equipment', 'athletic wear', 'workout essentials', 'outdoor sports', 'training gear', 'performance sports', 'active lifestyle', 'sports accessories'],
  Beauty: (name) => [`${name.toLowerCase()}`, 'beauty products', 'skincare', 'cosmetics', 'self-care', 'beauty essentials', 'premium beauty', 'skin health', 'beauty routine', 'natural beauty'],
  default: (name) => [`${name.toLowerCase()}`, 'best deals', 'premium quality', 'top rated', 'customer favorite', 'value for money', 'online store', 'shop now', 'trending products', 'recommended']
};

const mockCaptions = {
  Electronics: (name) => `🚀 Level up your tech game with ${name}! ⚡ Premium quality meets cutting-edge innovation. Don't miss out on this must-have gadget! 🔥\n\n#TechDeals #SmartLiving #GadgetLovers #Innovation #TechLife`,
  Clothing: (name) => `✨ Style meets comfort! The ${name} is here to transform your wardrobe 👗💫 Look great, feel amazing — every single day.\n\n#FashionForward #OOTD #StyleInspo #Trending #FashionLovers`,
  'Home & Kitchen': (name) => `🏡 Make your home shine with ${name}! Transform your space into something extraordinary ✨🍳 Quality + Style = Perfection!\n\n#HomeDecor #KitchenGoals #HomeSweetHome #InteriorDesign #HomeInspo`,
  Sports: (name) => `💪 Push your limits with ${name}! Built for champions, designed for everyone 🏆🔥 Your next PR starts here!\n\n#FitnessMotivation #SportLife #ActiveLifestyle #TrainHard #FitFam`,
  Beauty: (name) => `💖 Glow up with ${name}! ✨ Pamper yourself with premium beauty that delivers real results 🌟 You deserve to shine!\n\n#BeautyEssentials #SelfCare #GlowUp #SkincareRoutine #BeautyTips`,
  default: (name) => `🌟 Introducing ${name} — your new favorite! Premium quality at an unbeatable value 💎 Shop now before it's gone!\n\n#MustHave #ShopNow #BestDeals #TopRated #TrendingNow`
};

// ─── AI Service Functions ──────────────────────────────────────────────

export const generateDescription = async (product) => {
  if (isDemoMode) {
    const generator = mockDescriptions[product.category] || mockDescriptions.default;
    return generator(product.name, product.price);
  }

  if (process.env.GEMINI_API_KEY) {
    const systemPrompt = 'You are an expert e-commerce copywriter. Write compelling, SEO-optimized product descriptions that drive conversions. Keep descriptions between 100-200 words.';
    const userPrompt = `Write a compelling product description for:\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}\n${product.description ? `Additional details: ${product.description}` : ''}\n\nMake it engaging, highlight benefits, and include a call-to-action.`;
    return await callGemini(systemPrompt, userPrompt, false, 0.7);
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert e-commerce copywriter. Write compelling, SEO-optimized product descriptions that drive conversions. Keep descriptions between 100-200 words.'
      },
      {
        role: 'user',
        content: `Write a compelling product description for:\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}\n${product.description ? `Additional details: ${product.description}` : ''}\n\nMake it engaging, highlight benefits, and include a call-to-action.`
      }
    ],
    temperature: 0.7,
    max_tokens: 400
  });

  return completion.choices[0].message.content;
};

export const generateSEOTags = async (product) => {
  if (isDemoMode) {
    const generator = mockSeoTags[product.category] || mockSeoTags.default;
    return generator(product.name);
  }

  if (process.env.GEMINI_API_KEY) {
    const systemPrompt = 'You are an SEO specialist. Generate relevant, high-traffic SEO keywords and tags. Return ONLY a JSON array of strings, nothing else.';
    const userPrompt = `Generate 8-12 SEO tags/keywords for:\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}\n${product.description ? `Description: ${product.description}` : ''}`;
    const resText = await callGemini(systemPrompt, userPrompt, true, 0.3);
    try {
      return JSON.parse(resText);
    } catch {
      return resText.split(',').map(tag => tag.trim().replace(/["\[\]]/g, ''));
    }
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO specialist. Generate relevant, high-traffic SEO keywords and tags. Return ONLY a JSON array of strings, nothing else.'
      },
      {
        role: 'user',
        content: `Generate 8-12 SEO tags/keywords for:\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}\n${product.description ? `Description: ${product.description}` : ''}`
      }
    ],
    temperature: 0.3,
    max_tokens: 200
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return completion.choices[0].message.content.split(',').map(tag => tag.trim().replace(/["\[\]]/g, ''));
  }
};

export const generateMarketingCaption = async (product) => {
  if (isDemoMode) {
    const generator = mockCaptions[product.category] || mockCaptions.default;
    return generator(product.name);
  }

  if (process.env.GEMINI_API_KEY) {
    const systemPrompt = 'You are a social media marketing expert. Write catchy, engaging captions with emojis and relevant hashtags. Keep it under 280 characters for the main text, then add hashtags.';
    const userPrompt = `Write a catchy social media marketing caption for:\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}`;
    return await callGemini(systemPrompt, userPrompt, false, 0.8);
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a social media marketing expert. Write catchy, engaging captions with emojis and relevant hashtags. Keep it under 280 characters for the main text, then add hashtags.'
      },
      {
        role: 'user',
        content: `Write a catchy social media marketing caption for:\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}`
      }
    ],
    temperature: 0.8,
    max_tokens: 200
  });

  return completion.choices[0].message.content;
};

export const generatePricingSuggestion = async (product, salesData) => {
  if (isDemoMode) {
    const margin = product.costPrice ? ((product.price - product.costPrice) / product.price * 100).toFixed(1) : 'N/A';
    const avgSales = salesData?.length || 0;
    const suggestedPrice = product.costPrice 
      ? (product.costPrice * (avgSales > 10 ? 2.2 : 1.8)).toFixed(2)
      : (product.price * 0.95).toFixed(2);

    return {
      currentPrice: product.price,
      suggestedPrice: parseFloat(suggestedPrice),
      currentMargin: margin,
      reasoning: avgSales > 10 
        ? `Strong demand detected with ${avgSales} sales. Consider a slight price increase to maximize revenue while maintaining competitive positioning.`
        : avgSales > 0 
          ? `Moderate demand with ${avgSales} sales. Current pricing appears appropriate. Consider a small discount to boost volume.`
          : `No recent sales detected. Consider a promotional price reduction to stimulate demand and gather market feedback.`,
      confidence: avgSales > 10 ? 'High' : avgSales > 0 ? 'Medium' : 'Low'
    };
  }

  if (process.env.GEMINI_API_KEY) {
    const systemPrompt = 'You are a pricing strategy expert. Analyze product data and sales performance to provide pricing recommendations. Return a JSON object with: suggestedPrice (number), reasoning (string), confidence (High/Medium/Low).';
    const userPrompt = `Analyze and provide pricing recommendation:\n\nProduct: ${product.name}\nCategory: ${product.category}\nCurrent Price: $${product.price}\nCost Price: $${product.costPrice || 'Unknown'}\nStock: ${product.stock}\nRecent Sales Count: ${salesData?.length || 0}\nTotal Revenue: $${salesData?.reduce((sum, s) => sum + s.totalAmount, 0) || 0}`;
    const resText = await callGemini(systemPrompt, userPrompt, true, 0.3);
    try {
      const result = JSON.parse(resText);
      return { currentPrice: product.price, ...result };
    } catch {
      return {
        currentPrice: product.price,
        suggestedPrice: product.price,
        reasoning: resText,
        confidence: 'Medium'
      };
    }
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a pricing strategy expert. Analyze product data and sales performance to provide pricing recommendations. Return a JSON object with: suggestedPrice (number), reasoning (string), confidence (High/Medium/Low).'
      },
      {
        role: 'user',
        content: `Analyze and provide pricing recommendation:\n\nProduct: ${product.name}\nCategory: ${product.category}\nCurrent Price: $${product.price}\nCost Price: $${product.costPrice || 'Unknown'}\nStock: ${product.stock}\nRecent Sales Count: ${salesData?.length || 0}\nTotal Revenue: $${salesData?.reduce((sum, s) => sum + s.totalAmount, 0) || 0}`
      }
    ],
    temperature: 0.3,
    max_tokens: 300
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content);
    return { currentPrice: product.price, ...result };
  } catch {
    return {
      currentPrice: product.price,
      suggestedPrice: product.price,
      reasoning: completion.choices[0].message.content,
      confidence: 'Medium'
    };
  }
};

export const generateTrendingInsights = async (products, salesData) => {
  if (isDemoMode) {
    const categoryCount = {};
    const categorySales = {};
    
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    salesData.forEach(s => {
      const product = products.find(p => p._id.toString() === s.product.toString());
      if (product) {
        categorySales[product.category] = (categorySales[product.category] || 0) + s.totalAmount;
      }
    });

    const topCategory = Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0];

    return {
      insights: [
        {
          type: 'trending',
          title: 'Top Performing Category',
          description: topCategory 
            ? `${topCategory[0]} is your best-performing category with $${topCategory[1].toFixed(2)} in revenue. Consider expanding your product line in this category.`
            : 'Add more products and generate sales to see trending insights.',
          priority: 'high'
        },
        {
          type: 'opportunity',
          title: 'Growth Opportunity',
          description: `You have ${products.length} products across ${Object.keys(categoryCount).length} categories. Diversifying into underserved categories could capture new market segments.`,
          priority: 'medium'
        },
        {
          type: 'action',
          title: 'Inventory Optimization',
          description: `${products.filter(p => p.stock < 10).length} products have low stock levels. Restocking popular items before they sell out ensures continuous revenue flow.`,
          priority: products.filter(p => p.stock < 10).length > 3 ? 'high' : 'low'
        },
        {
          type: 'suggestion',
          title: 'AI Content Boost',
          description: `${products.filter(p => !p.aiDescription).length} products lack AI-generated descriptions. Products with optimized descriptions typically see 15-30% higher conversion rates.`,
          priority: 'medium'
        }
      ],
      summary: `Based on your ${products.length} products and ${salesData.length} recent sales, your store shows ${salesData.length > 50 ? 'strong' : salesData.length > 10 ? 'moderate' : 'early-stage'} market traction.`
    };
  }

  if (process.env.GEMINI_API_KEY) {
    const systemPrompt = 'You are an e-commerce analytics expert. Analyze store data and provide actionable insights. Return a JSON object with: insights (array of {type, title, description, priority}), summary (string).';
    const userPrompt = `Analyze this store data and provide trending insights:\n\nTotal Products: ${products.length}\nCategories: ${[...new Set(products.map(p => p.category))].join(', ')}\nTotal Sales (last 90 days): ${salesData.length}\nTotal Revenue: $${salesData.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}\nLow Stock Products: ${products.filter(p => p.stock < 10).length}\nProducts without AI content: ${products.filter(p => !p.aiDescription).length}\n\nTop products by price: ${products.sort((a, b) => b.price - a.price).slice(0, 5).map(p => `${p.name} ($${p.price})`).join(', ')}`;
    const resText = await callGemini(systemPrompt, userPrompt, true, 0.5);
    try {
      return JSON.parse(resText);
    } catch {
      return {
        insights: [{
          type: 'info',
          title: 'Analysis Complete',
          description: resText,
          priority: 'medium'
        }],
        summary: 'AI analysis completed.'
      };
    }
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an e-commerce analytics expert. Analyze store data and provide actionable insights. Return a JSON object with: insights (array of {type, title, description, priority}), summary (string).'
      },
      {
        role: 'user',
        content: `Analyze this store data and provide trending insights:\n\nTotal Products: ${products.length}\nCategories: ${[...new Set(products.map(p => p.category))].join(', ')}\nTotal Sales (last 90 days): ${salesData.length}\nTotal Revenue: $${salesData.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}\nLow Stock Products: ${products.filter(p => p.stock < 10).length}\nProducts without AI content: ${products.filter(p => !p.aiDescription).length}\n\nTop products by price: ${products.sort((a, b) => b.price - a.price).slice(0, 5).map(p => `${p.name} ($${p.price})`).join(', ')}`
      }
    ],
    temperature: 0.5,
    max_tokens: 500
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return {
      insights: [{
        type: 'info',
        title: 'Analysis Complete',
        description: completion.choices[0].message.content,
        priority: 'medium'
      }],
      summary: 'AI analysis completed.'
    };
  }
};
