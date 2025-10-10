import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tayaima.com' },
    update: {},
    create: {
      email: 'admin@tayaima.com',
      name: 'Admin User',
      passwordHash: await hash('admin123', 12),
      role: 'ADMIN',
    },
  });

  // Create categories with proper metadata
  const categories = [
    { 
      name: 'Vegetables', 
      slug: 'vegetables', 
      description: 'Fresh vegetables and greens',
      icon: '🥬',
      sortOrder: 1
    },
    { 
      name: 'Fruits', 
      slug: 'fruits', 
      description: 'Fresh seasonal fruits',
      icon: '🍎',
      sortOrder: 2
    },
    { 
      name: 'Dairy', 
      slug: 'dairy', 
      description: 'Milk, cheese, and dairy products',
      icon: '🥛',
      sortOrder: 3
    },
    { 
      name: 'Bakery', 
      slug: 'bakery', 
      description: 'Fresh bread and baked goods',
      icon: '🍞',
      sortOrder: 4
    },
    { 
      name: 'Grains & Rice', 
      slug: 'grains-rice', 
      description: 'Rice, wheat, and other grains',
      icon: '🌾',
      sortOrder: 5
    },
    { 
      name: 'Edible Oils', 
      slug: 'edible-oils', 
      description: 'Cooking oils and ghee',
      icon: '🫒',
      sortOrder: 6
    },
    { 
      name: 'Staples & Sugar', 
      slug: 'staples-sugar', 
      description: 'Sugar, salt, and basic staples',
      icon: '🧂',
      sortOrder: 7
    },
    { 
      name: 'Meat & Eggs', 
      slug: 'meat-eggs', 
      description: 'Fresh meat, chicken, and eggs',
      icon: '🥚',
      sortOrder: 8
    },
    { 
      name: 'Home & Garden', 
      slug: 'home-garden', 
      description: 'Home improvement and garden supplies',
      icon: '🏠',
      sortOrder: 9
    },
    { 
      name: 'Other', 
      slug: 'other', 
      description: 'Other miscellaneous items',
      icon: '📦',
      sortOrder: 10
    },
  ];

  const createdCategories: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
    createdCategories[category.name] = created.id;
    console.log(`Created category: ${category.name} (${category.icon})`);
  }

  // Create sample products with categories
  const products = [
    // Vegetables
    {
      name: 'Fresh Tomatoes',
      slug: 'fresh-tomatoes',
      description: 'Fresh, juicy tomatoes perfect for cooking and salads',
      category: 'Vegetables',
      images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1546470427-e9143da7973b?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'KG', amount: 1, price: 8000, originalPrice: 10000, stock: 50, sku: 'TOM-1KG' },
        { unit: 'KG', amount: 0.5, price: 4500, originalPrice: 6000, stock: 30, sku: 'TOM-500G' },
      ],
    },
    {
      name: 'Fresh Onions',
      slug: 'fresh-onions',
      description: 'Premium quality onions for daily cooking',
      category: 'Vegetables',
      images: [
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'KG', amount: 1, price: 6000, stock: 75, sku: 'ONI-1KG' },
        { unit: 'KG', amount: 2, price: 11000, stock: 40, sku: 'ONI-2KG' },
      ],
    },
    {
      name: 'Fresh Potatoes',
      slug: 'fresh-potatoes',
      description: 'High-quality potatoes perfect for all dishes',
      category: 'Vegetables',
      images: [
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'KG', amount: 1, price: 5000, stock: 100, sku: 'POT-1KG' },
        { unit: 'KG', amount: 5, price: 22000, stock: 25, sku: 'POT-5KG' },
      ],
    },
    {
      name: 'Fresh Spinach',
      slug: 'fresh-spinach',
      description: 'Nutritious green leafy spinach',
      category: 'Vegetables',
      images: [
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'G', amount: 250, price: 3000, stock: 60, sku: 'SPI-250G' },
        { unit: 'G', amount: 500, price: 5500, stock: 35, sku: 'SPI-500G' },
      ],
    },

    // Fruits
    {
      name: 'Fresh Bananas',
      slug: 'fresh-bananas',
      description: 'Sweet, ripe bananas rich in potassium',
      category: 'Fruits',
      images: [
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'PIECE', amount: 6, price: 4000, stock: 80, sku: 'BAN-6PC' },
        { unit: 'PIECE', amount: 12, price: 7500, stock: 45, sku: 'BAN-12PC' },
      ],
    },
    {
      name: 'Fresh Apples',
      slug: 'fresh-apples',
      description: 'Crisp and sweet red apples',
      category: 'Fruits',
      images: [
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'Kashmir Apples',
        origin: 'Kashmir, India',
        organic: 'true',
        storage: 'Refrigerate',
        nutritional_info: 'High in fiber and vitamin C'
      },
      variants: [
        { unit: 'KG', amount: 1, price: 15000, stock: 40, sku: 'APP-1KG' },
        { unit: 'KG', amount: 0.5, price: 8000, stock: 25, sku: 'APP-500G' },
      ],
    },

    // Dairy
    {
      name: 'Fresh Milk',
      slug: 'fresh-milk',
      description: 'Pure, fresh milk from local dairy farms',
      category: 'Dairy',
      images: [
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'Amul',
        fat_content: '3.5%',
        pasteurized: 'true',
        storage: 'Refrigerate below 4°C',
        expiry_days: '3'
      },
      variants: [
        { unit: 'LITER', amount: 1, price: 6000, stock: 100, sku: 'MILK-1L' },
        { unit: 'ML', amount: 500, price: 3500, stock: 50, sku: 'MILK-500ML' },
      ],
    },
    {
      name: 'Paneer',
      slug: 'paneer',
      description: 'Fresh cottage cheese made daily',
      category: 'Dairy',
      images: [
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'G', amount: 200, price: 8000, stock: 30, sku: 'PAN-200G' },
        { unit: 'G', amount: 500, price: 18000, stock: 20, sku: 'PAN-500G' },
      ],
    },

    // Bakery
    {
      name: 'White Bread',
      slug: 'white-bread',
      description: 'Soft, fresh white bread perfect for breakfast',
      category: 'Bakery',
      images: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'PIECE', amount: 1, price: 4000, stock: 25, sku: 'BRD-WHT' },
        { unit: 'PIECE', amount: 2, price: 7500, stock: 15, sku: 'BRD-WHT-2' },
      ],
    },
    {
      name: 'Brown Bread',
      slug: 'brown-bread',
      description: 'Healthy whole wheat brown bread',
      category: 'Bakery',
      images: [
        'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'PIECE', amount: 1, price: 5000, stock: 20, sku: 'BRD-BRN' },
      ],
    },

    // Grains & Rice
    {
      name: 'Basmati Rice',
      slug: 'basmati-rice',
      description: 'Premium long-grain basmati rice',
      category: 'Grains & Rice',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'KG', amount: 1, price: 12000, stock: 50, sku: 'RIC-BAS-1KG' },
        { unit: 'KG', amount: 5, price: 55000, stock: 20, sku: 'RIC-BAS-5KG' },
      ],
    },
    {
      name: 'Wheat Flour',
      slug: 'wheat-flour',
      description: 'Fine quality wheat flour for chapatis',
      category: 'Grains & Rice',
      images: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'KG', amount: 1, price: 5000, stock: 60, sku: 'FLR-WHT-1KG' },
        { unit: 'KG', amount: 5, price: 22000, stock: 25, sku: 'FLR-WHT-5KG' },
      ],
    },

    // Edible Oils
    {
      name: 'Sunflower Oil',
      slug: 'sunflower-oil',
      description: 'Pure sunflower cooking oil',
      category: 'Edible Oils',
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'LITER', amount: 1, price: 15000, originalPrice: 18000, stock: 40, sku: 'OIL-SUN-1L' },
        { unit: 'LITER', amount: 5, price: 70000, originalPrice: 85000, stock: 15, sku: 'OIL-SUN-5L' },
      ],
    },

    // Staples & Sugar
    {
      name: 'White Sugar',
      slug: 'white-sugar',
      description: 'Pure white crystal sugar',
      category: 'Staples & Sugar',
      images: [
        'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'KG', amount: 1, price: 5500, stock: 80, sku: 'SUG-WHT-1KG' },
        { unit: 'KG', amount: 5, price: 25000, stock: 30, sku: 'SUG-WHT-5KG' },
      ],
    },
    {
      name: 'Rock Salt',
      slug: 'rock-salt',
      description: 'Natural rock salt for cooking',
      category: 'Staples & Sugar',
      images: [
        'https://images.unsplash.com/photo-1472162314594-a9df6ded7d4e?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'KG', amount: 1, price: 3000, stock: 100, sku: 'SAL-ROC-1KG' },
      ],
    },

    // Meat & Eggs
    {
      name: 'Fresh Eggs',
      slug: 'fresh-eggs',
      description: 'Farm fresh chicken eggs',
      category: 'Meat & Eggs',
      images: [
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&h=500&fit=crop'
      ],
      variants: [
        { unit: 'PIECE', amount: 6, price: 4500, originalPrice: 5500, stock: 60, sku: 'EGG-6PC' },
        { unit: 'PIECE', amount: 12, price: 8500, originalPrice: 10000, stock: 40, sku: 'EGG-12PC' },
        { unit: 'PIECE', amount: 30, price: 20000, stock: 15, sku: 'EGG-30PC' },
      ],
    },

    // Home & Garden - Products with new units (CM, M, INCH)
    {
      name: 'Measuring Tape',
      slug: 'measuring-tape',
      description: 'Flexible measuring tape for accurate measurements',
      category: 'Home & Garden',
      images: [
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'Stanley',
        material: 'Steel',
        color: 'Yellow',
        warranty: '1 year'
      },
      variants: [
        { unit: 'M', amount: 3, price: 15000, stock: 20, sku: 'TAPE-3M' },
        { unit: 'M', amount: 5, price: 22000, stock: 15, sku: 'TAPE-5M' },
        { unit: 'M', amount: 10, price: 40000, stock: 10, sku: 'TAPE-10M' },
      ],
    },
    {
      name: 'Ruler Set',
      slug: 'ruler-set',
      description: 'Set of plastic rulers for school and office use',
      category: 'Home & Garden',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'Faber-Castell',
        material: 'Plastic',
        color: 'Transparent',
        graduation: 'mm and cm'
      },
      variants: [
        { unit: 'CM', amount: 15, price: 5000, stock: 50, sku: 'RULER-15CM' },
        { unit: 'CM', amount: 30, price: 8000, stock: 30, sku: 'RULER-30CM' },
        { unit: 'CM', amount: 50, price: 12000, stock: 20, sku: 'RULER-50CM' },
      ],
    },
    {
      name: 'Extension Cord',
      slug: 'extension-cord',
      description: 'Heavy duty extension cord for electrical appliances',
      category: 'Home & Garden',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'Anchor',
        voltage: '250V',
        current: '16A',
        material: 'PVC',
        safety: 'ISI Certified'
      },
      variants: [
        { unit: 'M', amount: 2, price: 12000, stock: 25, sku: 'CORD-2M' },
        { unit: 'M', amount: 5, price: 25000, stock: 15, sku: 'CORD-5M' },
        { unit: 'M', amount: 10, price: 45000, stock: 8, sku: 'CORD-10M' },
      ],
    },
    {
      name: 'Curtain Rod',
      slug: 'curtain-rod',
      description: 'Adjustable curtain rod for windows',
      category: 'Home & Garden',
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'IKEA',
        material: 'Steel',
        finish: 'Chrome',
        adjustable: 'Yes',
        weight_capacity: '15kg'
      },
      variants: [
        { unit: 'INCH', amount: 36, price: 18000, stock: 20, sku: 'ROD-36IN' },
        { unit: 'INCH', amount: 48, price: 22000, stock: 15, sku: 'ROD-48IN' },
        { unit: 'INCH', amount: 60, price: 28000, stock: 10, sku: 'ROD-60IN' },
        { unit: 'INCH', amount: 72, price: 35000, stock: 8, sku: 'ROD-72IN' },
      ],
    },
    {
      name: 'PVC Pipe',
      slug: 'pvc-pipe',
      description: 'PVC pipe for plumbing and construction',
      category: 'Home & Garden',
      images: [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'Astral',
        diameter: '1 inch',
        material: 'PVC',
        pressure_rating: '10 bar',
        color: 'White'
      },
      variants: [
        { unit: 'M', amount: 1, price: 8000, stock: 40, sku: 'PIPE-1M' },
        { unit: 'M', amount: 2, price: 15000, stock: 25, sku: 'PIPE-2M' },
        { unit: 'M', amount: 3, price: 22000, stock: 15, sku: 'PIPE-3M' },
        { unit: 'M', amount: 6, price: 40000, stock: 10, sku: 'PIPE-6M' },
      ],
    },
    {
      name: 'Fabric by Length',
      slug: 'fabric-by-length',
      description: 'Cotton fabric sold by length',
      category: 'Home & Garden',
      images: [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop'
      ],
      meta: {
        brand: 'Cotton King',
        material: '100% Cotton',
        width: '44 inches',
        weight: '140 GSM',
        care: 'Machine washable'
      },
      variants: [
        { unit: 'M', amount: 1, price: 12000, stock: 30, sku: 'FAB-1M' },
        { unit: 'M', amount: 2, price: 22000, stock: 20, sku: 'FAB-2M' },
        { unit: 'M', amount: 5, price: 50000, stock: 10, sku: 'FAB-5M' },
        { unit: 'M', amount: 10, price: 95000, stock: 5, sku: 'FAB-10M' },
      ],
    },
  ];

  // Create products with category assignment
  for (const productData of products) {
    const { category, variants, meta, ...productInfo } = productData;
    
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...productInfo,
        meta: meta || undefined,
        category: {
          connect: { id: createdCategories[category] }
        },
        variants: {
          create: variants.map((v) => ({
            unit: v.unit as any,
            amount: v.amount,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          })),
        },
      },
    });

    console.log(`Created product: ${product.name} in category: ${category}`);
  }

  // Create a sample customer user
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Doe',
      passwordHash: await hash('customer123', 12),
      role: 'USER',
    },
  });

  // Create sample addresses for the customer
  const addresses = [
    {
      userId: customerUser.id,
      name: 'Home',
      phone: '+91 9876543210',
      line1: '123 Main Street',
      line2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    },
    {
      userId: customerUser.id,
      name: 'Office',
      phone: '+91 9876543210',
      line1: '456 Business Park',
      line2: 'Floor 2, Suite 201',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      isDefault: false,
    },
  ];

  for (const addressData of addresses) {
    await prisma.address.create({
      data: addressData,
    });
  }

  // Create a sample order
  const sampleProducts = await prisma.product.findMany({
    take: 3,
    include: { variants: { take: 1 } }
  });

  if (sampleProducts.length >= 3) {
    const order = await prisma.order.create({
      data: {
        userId: customerUser.id,
        customerName: 'John Doe',
        phone: '+91 9876543210',
        address: '123 Main Street, Apartment 4B, Mumbai, Maharashtra 400001',
        city: 'Mumbai',
        pincode: '400001',
        totalAmount: 0, // Will be calculated
        status: 'PLACED',
        paymentMode: 'COD',
        items: {
          create: [
            {
              variantId: sampleProducts[0].variants[0].id,
              quantity: 2,
              unitPrice: sampleProducts[0].variants[0].price,
              total: sampleProducts[0].variants[0].price * 2,
            },
            {
              variantId: sampleProducts[1].variants[0].id,
              quantity: 1,
              unitPrice: sampleProducts[1].variants[0].price,
              total: sampleProducts[1].variants[0].price * 1,
            },
            {
              variantId: sampleProducts[2].variants[0].id,
              quantity: 3,
              unitPrice: sampleProducts[2].variants[0].price,
              total: sampleProducts[2].variants[0].price * 3,
            },
          ],
        },
      },
    });

    // Update the total amount
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id }
    });
    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
    
    await prisma.order.update({
      where: { id: order.id },
      data: { totalAmount }
    });

    console.log(`Created sample order: ${order.id} with total ₹${totalAmount/100}`);
  }

  console.log('Seeding completed successfully!');
  console.log(`Admin user created: admin@tayaima.com / admin123`);
  console.log(`Customer user created: customer@example.com / customer123`);
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${products.length} products`);
  console.log(`Created ${addresses.length} addresses`);
  console.log(`Created 1 sample order`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });