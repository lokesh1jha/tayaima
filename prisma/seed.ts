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

  // Create categories
  const categories = [
    { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables and greens' },
    { name: 'Fruits', slug: 'fruits', description: 'Fresh seasonal fruits' },
    { name: 'Dairy', slug: 'dairy', description: 'Milk, cheese, and dairy products' },
    { name: 'Bakery', slug: 'bakery', description: 'Fresh bread and baked goods' },
    { name: 'Grains & Rice', slug: 'grains-rice', description: 'Rice, wheat, and other grains' },
    { name: 'Edible Oils', slug: 'edible-oils', description: 'Cooking oils and ghee' },
    { name: 'Staples & Sugar', slug: 'staples-sugar', description: 'Sugar, salt, and basic staples' },
    { name: 'Meat & Eggs', slug: 'meat-eggs', description: 'Fresh meat, chicken, and eggs' },
    { name: 'Other', slug: 'other', description: 'Other grocery items' },
  ];

  const createdCategories: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories[category.name] = created.id;
    console.log(`Created category: ${category.name}`);
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
        { unit: 'KG', amount: 1, price: 8000, stock: 50, sku: 'TOM-1KG' },
        { unit: 'KG', amount: 0.5, price: 4500, stock: 30, sku: 'TOM-500G' },
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
        { unit: 'LITER', amount: 1, price: 15000, stock: 40, sku: 'OIL-SUN-1L' },
        { unit: 'LITER', amount: 5, price: 70000, stock: 15, sku: 'OIL-SUN-5L' },
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
        { unit: 'PIECE', amount: 6, price: 4500, stock: 60, sku: 'EGG-6PC' },
        { unit: 'PIECE', amount: 12, price: 8500, stock: 40, sku: 'EGG-12PC' },
        { unit: 'PIECE', amount: 30, price: 20000, stock: 15, sku: 'EGG-30PC' },
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

  console.log('Seeding completed successfully!');
  console.log(`Admin user created: admin@tayaima.com / admin123`);
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });