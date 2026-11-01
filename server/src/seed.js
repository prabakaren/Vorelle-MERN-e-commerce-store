// Fills the database with an admin account and sample products.
//   npm run seed            -> wipes products/users/carts/orders and re-creates sample data
//   npm run seed:destroy    -> wipes everything and stops
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Cart from './models/Cart.js';
import Order from './models/Order.js';

const products = [
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    category: 'Tech',
    price: 24900,
    stock: 30,
    featured: true,
    rating: 4.8,
    tint: '#8f5cff',
    description:
      'Wireless earbuds with active noise cancellation, transparency mode and a MagSafe charging case.',
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Tech',
    price: 29990,
    stock: 18,
    featured: true,
    rating: 4.7,
    tint: '#2c3350',
    description:
      'Over-ear headphones with industry-leading noise cancelling and long battery life for travel and work.',
  },
  {
    name: 'JBL Flip 6 Bluetooth Speaker',
    category: 'Tech',
    price: 9999,
    stock: 40,
    featured: false,
    rating: 4.6,
    tint: '#ff6a4d',
    description:
      'Portable waterproof speaker with punchy sound that keeps going all day.',
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Tech',
    price: 9995,
    stock: 25,
    featured: true,
    rating: 4.8,
    tint: '#3aa0ff',
    description:
      'Ergonomic wireless mouse with quiet clicks and a fast scroll wheel, made for long work days.',
  },
  {
    name: 'Amazon Kindle Paperwhite',
    category: 'Tech',
    price: 14999,
    stock: 22,
    featured: false,
    rating: 4.7,
    tint: '#4fa86b',
    description:
      'Glare-free e-reader with an adjustable warm light. Reads like paper, even in bright sun.',
  },
  {
    name: 'Amazon Echo Dot (5th Gen)',
    category: 'Tech',
    price: 5499,
    stock: 50,
    featured: false,
    rating: 4.4,
    tint: '#14173a',
    description:
      'Compact smart speaker with Alexa. Play music, set timers and control smart home devices by voice.',
  },
  {
    name: 'Anker PowerCore 20000mAh Power Bank',
    category: 'Tech',
    price: 3299,
    stock: 60,
    featured: false,
    rating: 4.5,
    tint: '#2fbf9b',
    description: 'High-capacity power bank that charges a phone several times on one go.',
  },
  {
    name: 'boAt Airdopes 141 Earbuds',
    category: 'Tech',
    price: 1299,
    stock: 120,
    featured: false,
    rating: 4.1,
    tint: '#e0344c',
    description:
      'Budget true wireless earbuds with low-latency mode and a compact charging case.',
  },
  {
    name: 'Xiaomi Smart Band 8',
    category: 'Tech',
    price: 3499,
    stock: 45,
    featured: false,
    rating: 4.3,
    tint: '#ffa62b',
    description:
      'Fitness band with a bright AMOLED display, heart-rate tracking and sleep monitoring.',
  },
  {
    name: 'Samsung Galaxy Buds2 Pro',
    category: 'Tech',
    price: 14999,
    stock: 20,
    featured: false,
    rating: 4.5,
    tint: '#6d5dfc',
    description: 'Compact earbuds with active noise cancellation and clear calls.',
  },
  {
    name: 'Philips Air Fryer HD9200',
    category: 'Kitchen',
    price: 7995,
    stock: 28,
    featured: true,
    rating: 4.5,
    tint: '#1f4e9c',
    description:
      'Cook crispy fries, chicken and snacks with little or no oil. Easy-clean basket.',
  },
  {
    name: 'Hawkins Classic Pressure Cooker 3 L',
    category: 'Kitchen',
    price: 1899,
    stock: 55,
    featured: false,
    rating: 4.6,
    tint: '#9aa3b5',
    description:
      'Heavy-base aluminium pressure cooker that is a staple in Indian kitchens.',
  },
  {
    name: 'Bialetti Moka Express (6 Cup)',
    category: 'Kitchen',
    price: 3290,
    stock: 20,
    featured: true,
    rating: 4.8,
    tint: '#ff7a59',
    description:
      'The classic Italian stovetop coffee maker. Brews rich espresso-style coffee at home.',
  },
  {
    name: 'Lodge Cast Iron Skillet 10.25 inch',
    category: 'Kitchen',
    price: 3499,
    stock: 16,
    featured: false,
    rating: 4.9,
    tint: '#4a4f5c',
    description:
      'Pre-seasoned cast iron pan that sears, bakes and lasts for generations.',
  },
  {
    name: 'Borosil Glass Storage Set (Set of 3)',
    category: 'Kitchen',
    price: 1299,
    stock: 70,
    featured: false,
    rating: 4.4,
    tint: '#7ac7c4',
    description: 'Microwave-safe borosilicate glass containers with airtight lids.',
  },
  {
    name: 'Prestige PIC 20 Induction Cooktop',
    category: 'Kitchen',
    price: 2699,
    stock: 35,
    featured: false,
    rating: 4.3,
    tint: '#c4262e',
    description:
      '1200 W induction cooktop with preset menus for everyday Indian cooking.',
  },
  {
    name: 'Milton Thermosteel Flask 1 L',
    category: 'Kitchen',
    price: 899,
    stock: 90,
    featured: false,
    rating: 4.5,
    tint: '#3b4b7a',
    description: 'Stainless steel flask that keeps tea hot or water cold for hours.',
  },
  {
    name: 'Pigeon Stovekraft Mixer Grinder',
    category: 'Kitchen',
    price: 2399,
    stock: 40,
    featured: false,
    rating: 4.2,
    tint: '#d4552e',
    description:
      'Powerful mixer grinder with three jars for chutneys, masalas and smoothies.',
  },
  {
    name: 'Cello Opalware Dinner Set (18 Pieces)',
    category: 'Kitchen',
    price: 2799,
    stock: 26,
    featured: false,
    rating: 4.4,
    tint: '#f6c445',
    description: 'Light, durable dinner set that is safe for microwave reheating.',
  },
  {
    name: 'Wakefit Memory Foam Pillow',
    category: 'Home',
    price: 1199,
    stock: 65,
    featured: false,
    rating: 4.3,
    tint: '#6d5dfc',
    description:
      'Contoured memory foam pillow that supports the neck and keeps its shape.',
  },
  {
    name: 'Philips Wiz Smart LED Bulb 9W',
    category: 'Home',
    price: 799,
    stock: 100,
    featured: false,
    rating: 4.4,
    tint: '#ffd75e',
    description:
      'Wi-Fi bulb with millions of colours and warm to cool white. Control it from your phone.',
  },
  {
    name: 'Havells Stealth Air Ceiling Fan',
    category: 'Home',
    price: 4290,
    stock: 24,
    featured: false,
    rating: 4.4,
    tint: '#9aa3b5',
    description: 'Energy-efficient ceiling fan with a sleek design and quiet running.',
  },
  {
    name: 'Bajaj Majesty Room Heater',
    category: 'Home',
    price: 1999,
    stock: 30,
    featured: false,
    rating: 4.1,
    tint: '#ff9d6c',
    description: 'Compact room heater for cold mornings with simple switch controls.',
  },
  {
    name: 'Godrej Aer Smart Matic Air Freshener',
    category: 'Home',
    price: 449,
    stock: 80,
    featured: false,
    rating: 4.3,
    tint: '#2fbf9b',
    description: 'Automatic fragrance spray that keeps rooms fresh through the day.',
  },
  {
    name: 'Solimo Cotton Bedsheet Set (Double)',
    category: 'Home',
    price: 1099,
    stock: 45,
    featured: false,
    rating: 4.2,
    tint: '#e87fb0',
    description:
      'Soft cotton double bedsheet with two pillow covers in a clean printed design.',
  },
  {
    name: 'Wildcraft Wiki Backpack 35 L',
    category: 'Carry',
    price: 1999,
    stock: 38,
    featured: true,
    rating: 4.4,
    tint: '#2fbf9b',
    description:
      'Roomy everyday backpack with padded straps and multiple pockets for college or work.',
  },
  {
    name: 'American Tourister Cabin Trolley 55 cm',
    category: 'Carry',
    price: 4999,
    stock: 20,
    featured: true,
    rating: 4.5,
    tint: '#14173a',
    description:
      'Hard-shell cabin trolley with smooth spinner wheels and a TSA-style lock.',
  },
  {
    name: 'Skybags Brat Laptop Backpack',
    category: 'Carry',
    price: 1499,
    stock: 50,
    featured: false,
    rating: 4.2,
    tint: '#ff5d8f',
    description: 'Lightweight backpack with a padded laptop compartment.',
  },
  {
    name: 'Nike Brasilia Training Duffel Bag',
    category: 'Carry',
    price: 2495,
    stock: 30,
    featured: false,
    rating: 4.4,
    tint: '#f2f3f8',
    description:
      'Durable duffel for the gym or weekend trips, with a roomy main compartment.',
  },
  {
    name: 'Stanley Quencher H2.0 Tumbler',
    category: 'Carry',
    price: 3999,
    stock: 25,
    featured: false,
    rating: 4.6,
    tint: '#4a9d8f',
    description: 'Insulated tumbler with a handle that fits most cup holders.',
  },
  {
    name: 'Cello Puro Steel-X Water Bottle 900 ml',
    category: 'Carry',
    price: 649,
    stock: 85,
    featured: false,
    rating: 4.4,
    tint: '#3aa0ff',
    description: 'Stainless steel bottle for daily use, with a leak-proof lid.',
  },
  {
    name: 'Parker Vector Standard Ball Pen',
    category: 'Stationery',
    price: 350,
    stock: 150,
    featured: false,
    rating: 4.5,
    tint: '#2c4bff',
    description: 'Classic stainless steel pen with a smooth blue ink refill.',
  },
  {
    name: 'Pilot V5 Hi-Tecpoint Pen (Pack of 5)',
    category: 'Stationery',
    price: 475,
    stock: 110,
    featured: false,
    rating: 4.7,
    tint: '#e0344c',
    description: 'Liquid ink rollerball pens with a fine, consistent line.',
  },
  {
    name: 'Moleskine Classic Notebook (Large, Ruled)',
    category: 'Stationery',
    price: 1995,
    stock: 40,
    featured: false,
    rating: 4.7,
    tint: '#14173a',
    description: 'Hardcover notebook with an elastic closure and a ribbon bookmark.',
  },
  {
    name: 'Casio fx-991EX ClassWiz Calculator',
    category: 'Stationery',
    price: 1495,
    stock: 60,
    featured: true,
    rating: 4.8,
    tint: '#4a4f5c',
    description:
      'Scientific calculator with a high-resolution display. A favourite for engineering students.',
  },
  {
    name: 'Faber-Castell Connector Pens (Set of 25)',
    category: 'Stationery',
    price: 699,
    stock: 70,
    featured: false,
    rating: 4.6,
    tint: '#ffa62b',
    description: 'Water-based colouring pens in 25 colours for notes, art and projects.',
  },
  {
    name: 'Classmate Spiral Notebook (Pack of 6)',
    category: 'Stationery',
    price: 420,
    stock: 140,
    featured: false,
    rating: 4.4,
    tint: '#7ab87a',
    description: 'Everyday notebooks with smooth pages that handle pen and pencil well.',
  },
  {
    name: 'Staedtler Noris HB Pencils (Pack of 12)',
    category: 'Stationery',
    price: 240,
    stock: 160,
    featured: false,
    rating: 4.6,
    tint: '#ffd75e',
    description: 'Reliable HB pencils with break-resistant leads for school and exams.',
  },
  {
    name: 'Yonex Astrox 3DG Badminton Racquet',
    category: 'Fitness',
    price: 2999,
    stock: 22,
    featured: false,
    rating: 4.4,
    tint: '#e0344c',
    description: 'Head-heavy racquet that helps power smashes. Comes with a full cover.',
  },
  {
    name: 'Nivia Storm Football (Size 5)',
    category: 'Fitness',
    price: 799,
    stock: 45,
    featured: false,
    rating: 4.2,
    tint: '#3aa0ff',
    description: 'Machine-stitched football for practice and casual matches.',
  },
  {
    name: 'Decathlon Domyos Yoga Mat 8 mm',
    category: 'Fitness',
    price: 1299,
    stock: 50,
    featured: false,
    rating: 4.5,
    tint: '#9b7bff',
    description: 'Thick, comfortable mat with good grip for yoga and floor exercises.',
  },
  {
    name: 'Boldfit Resistance Bands (Set of 5)',
    category: 'Fitness',
    price: 599,
    stock: 80,
    featured: false,
    rating: 4.3,
    tint: '#2fbf9b',
    description:
      'Five levels of resistance for strength work at home, with a carry pouch.',
  },
];

// Each product looks for its photo at client/public/images/<slug>.jpg
// e.g. "Apple AirPods Pro (2nd Generation)" -> /images/apple-airpods-pro-2nd-generation.jpg
// If the file is missing, the site shows a coloured tile instead, so nothing breaks.
const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
products.forEach((p) => {
  p.image = `/images/${slugify(p.name)}.jpg`;
});

async function run() {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Product.deleteMany(),
    Cart.deleteMany(),
    Order.deleteMany(),
  ]);
  console.log('Cleared existing data');

  if (process.argv.includes('--destroy')) return;

  await User.create([
    {
      name: 'Vorelle Admin',
      email: 'admin@vorelle.shop',
      password: 'Admin@123',
      role: 'admin',
    },
    { name: 'Demo Customer', email: 'customer@vorelle.shop', password: 'Customer@123' },
  ]);
  await Product.insertMany(products);
  console.log(`Created 2 users and ${products.length} products`);
  console.log('Admin login:    admin@vorelle.shop / Admin@123');
  console.log('Customer login: customer@vorelle.shop / Customer@123');
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
