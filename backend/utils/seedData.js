import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartstore';

const products = [
  // Electronics
  { name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 149.99, costPrice: 65, stock: 45, description: 'Premium over-ear headphones with ANC and 30hr battery', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' },
  { name: 'Smart Fitness Watch Pro', category: 'Electronics', price: 299.99, costPrice: 120, stock: 30, description: 'Advanced fitness tracking with GPS and heart rate monitor', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300' },
  { name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 79.99, costPrice: 30, stock: 60, description: 'Waterproof speaker with 360° sound and 12hr battery', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300' },
  { name: 'USB-C Fast Charging Hub', category: 'Electronics', price: 49.99, costPrice: 15, stock: 100, description: '7-in-1 multiport adapter with 100W PD charging', imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=300' },
  { name: '4K Webcam with Ring Light', category: 'Electronics', price: 129.99, costPrice: 45, stock: 8, description: 'Ultra HD webcam with built-in studio lighting', imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=300' },

  // Clothing
  { name: 'Premium Cotton Hoodie', category: 'Clothing', price: 59.99, costPrice: 18, stock: 75, description: 'Heavyweight organic cotton hoodie with kangaroo pocket', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300' },
  { name: 'Slim Fit Chino Pants', category: 'Clothing', price: 44.99, costPrice: 14, stock: 50, description: 'Stretch cotton chinos with modern slim fit', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300' },
  { name: 'Merino Wool Crew Neck Sweater', category: 'Clothing', price: 89.99, costPrice: 32, stock: 3, description: 'Ultra-soft merino wool sweater for all seasons', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a2e?w=300' },
  { name: 'Waterproof Running Jacket', category: 'Clothing', price: 119.99, costPrice: 40, stock: 25, description: 'Lightweight, breathable jacket with sealed seams', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300' },
  { name: 'Graphic Designer T-Shirt', category: 'Clothing', price: 29.99, costPrice: 8, stock: 120, description: 'Unique artist-designed tee on premium ring-spun cotton', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300' },

  // Home & Kitchen
  { name: 'Smart Air Purifier', category: 'Home & Kitchen', price: 199.99, costPrice: 80, stock: 20, description: 'HEPA filter with app control and air quality sensor', imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300' },
  { name: 'Bamboo Cutting Board Set', category: 'Home & Kitchen', price: 34.99, costPrice: 10, stock: 65, description: '3-piece organic bamboo board set with juice grooves', imageUrl: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=300' },
  { name: 'Pour-Over Coffee Maker', category: 'Home & Kitchen', price: 42.99, costPrice: 12, stock: 40, description: 'Borosilicate glass dripper with stainless steel filter', imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300' },
  { name: 'Ceramic Plant Pot Collection', category: 'Home & Kitchen', price: 54.99, costPrice: 18, stock: 5, description: 'Set of 4 minimalist ceramic pots with drainage holes', imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300' },
  { name: 'LED Desk Lamp with Wireless Charger', category: 'Home & Kitchen', price: 69.99, costPrice: 25, stock: 35, description: 'Adjustable color temperature lamp with Qi charging base', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=300' },

  // Sports
  { name: 'Yoga Mat Premium 6mm', category: 'Sports', price: 39.99, costPrice: 12, stock: 55, description: 'Non-slip TPE mat with alignment markers and carry strap', imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300' },
  { name: 'Adjustable Dumbbell Set', category: 'Sports', price: 249.99, costPrice: 100, stock: 15, description: '5-50lb adjustable dumbbells with quick-change mechanism', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
  { name: 'Insulated Water Bottle 32oz', category: 'Sports', price: 29.99, costPrice: 8, stock: 90, description: 'Triple-wall vacuum insulation keeps drinks cold 24hrs', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300' },
  { name: 'Resistance Band Set', category: 'Sports', price: 24.99, costPrice: 6, stock: 0, description: '5 bands with handles, door anchor, and carry bag', imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=300' },
  { name: 'Running Shoes UltraBoost', category: 'Sports', price: 159.99, costPrice: 55, stock: 22, description: 'Responsive cushioning with knit upper and continental sole', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },

  // Beauty
  { name: 'Vitamin C Brightening Serum', category: 'Beauty', price: 34.99, costPrice: 8, stock: 70, description: '20% Vitamin C with hyaluronic acid and vitamin E', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300' },
  { name: 'Organic Face Moisturizer', category: 'Beauty', price: 28.99, costPrice: 7, stock: 55, description: 'Lightweight daily moisturizer with SPF 30 protection', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300' },
  { name: 'Professional Hair Dryer', category: 'Beauty', price: 89.99, costPrice: 30, stock: 18, description: '1875W ionic dryer with 3 heat settings and diffuser', imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54571a3f4?w=300' },
  { name: 'Natural Lip Balm Collection', category: 'Beauty', price: 14.99, costPrice: 3, stock: 150, description: 'Set of 6 organic lip balms in assorted flavors', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300' },
  { name: 'Jade Facial Roller Set', category: 'Beauty', price: 19.99, costPrice: 4, stock: 7, description: 'Genuine jade roller and gua sha with velvet pouch', imageUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=300' },
];

// Generate realistic sales data
function generateSalesData(productDocs, userId) {
  const sales = [];
  const now = new Date();
  const channels = ['online', 'in-store', 'marketplace'];

  for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(Math.floor(Math.random() * 14) + 8); // 8 AM - 10 PM

    // More sales on weekends and recent days
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const recencyBoost = Math.max(0, 1 - dayOffset / 90);
    const numSales = Math.floor(Math.random() * (isWeekend ? 8 : 5) + 2 + recencyBoost * 3);

    for (let i = 0; i < numSales; i++) {
      const product = productDocs[Math.floor(Math.random() * productDocs.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;

      sales.push({
        user: userId,
        product: product._id,
        quantity,
        unitPrice: product.price,
        totalAmount: parseFloat((product.price * quantity).toFixed(2)),
        date: new Date(date.getTime() + Math.random() * 3600000 * i),
        channel: channels[Math.floor(Math.random() * channels.length)]
      });
    }
  }

  return sales;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create demo admin user
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@smartstore.com',
      password: 'password123',
      role: 'admin',
      storeName: 'SmartStore Demo'
    });
    console.log(`👤 Created demo admin user: admin@smartstore.com / password123`);

    // Create demo staff user
    const staffUser = await User.create({
      name: 'Staff User',
      email: 'staff@smartstore.com',
      password: 'password123',
      role: 'staff',
      storeName: 'SmartStore Demo'
    });
    console.log(`👤 Created demo staff user: staff@smartstore.com / password123`);

    // Create products (owned by the admin user, so both admin & staff can query them since they share storeName)
    const productDocs = await Product.insertMany(
      products.map(p => ({ ...p, user: user._id }))
    );
    console.log(`📦 Created ${productDocs.length} products`);

    // Create sales
    const salesData = generateSalesData(productDocs, user._id);
    await Sale.insertMany(salesData);
    console.log(`💰 Created ${salesData.length} sales records (last 90 days)`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log('Login credentials:');
    console.log('  [ADMIN USER]');
    console.log('    Email:    admin@smartstore.com');
    console.log('    Password: password123');
    console.log('  [STAFF USER]');
    console.log('    Email:    staff@smartstore.com');
    console.log('    Password: password123');
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
