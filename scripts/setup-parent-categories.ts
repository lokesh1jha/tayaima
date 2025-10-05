import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupParentCategories() {
  try {
    console.log('Setting up parent categories...');

    // Create parent categories
    const parentCategories = [
      {
        name: 'Fresh Produce',
        slug: 'fresh-produce',
        description: 'Fresh fruits and vegetables',
        icon: '🥬',
        sortOrder: 1,
      },
      {
        name: 'Dairy & Eggs',
        slug: 'dairy-eggs',
        description: 'Milk, cheese, eggs and dairy products',
        icon: '🥛',
        sortOrder: 2,
      },
      {
        name: 'Pantry Essentials',
        slug: 'pantry-essentials',
        description: 'Grains, spices, and cooking essentials',
        icon: '🌾',
        sortOrder: 3,
      },
      {
        name: 'Beverages',
        slug: 'beverages',
        description: 'Drinks, juices, and beverages',
        icon: '🥤',
        sortOrder: 4,
      },
      {
        name: 'Snacks & Treats',
        slug: 'snacks-treats',
        description: 'Snacks, sweets, and treats',
        icon: '🍪',
        sortOrder: 5,
      },
      {
        name: 'Household',
        slug: 'household',
        description: 'Cleaning supplies and household items',
        icon: '🧽',
        sortOrder: 6,
      },
    ];

    // Create parent categories
    const createdParents = [];
    for (const parent of parentCategories) {
      const existing = await prisma.category.findUnique({
        where: { slug: parent.slug }
      });

      if (!existing) {
        const created = await prisma.category.create({
          data: parent
        });
        createdParents.push(created);
        console.log(`Created parent category: ${parent.name}`);
      } else {
        createdParents.push(existing);
        console.log(`Parent category already exists: ${parent.name}`);
      }
    }

    // Get all existing categories
    const existingCategories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${existingCategories.length} existing categories to organize`);

    // Map existing categories to parent categories based on name/keywords
    const categoryMappings = {
      'Fresh Produce': ['fruits', 'vegetables', 'fresh', 'organic', 'produce'],
      'Dairy & Eggs': ['dairy', 'milk', 'cheese', 'eggs', 'yogurt', 'butter'],
      'Pantry Essentials': ['grains', 'rice', 'wheat', 'flour', 'spices', 'oil', 'salt', 'sugar', 'pulses', 'lentils'],
      'Beverages': ['drinks', 'juice', 'water', 'tea', 'coffee', 'soda', 'beverage'],
      'Snacks & Treats': ['snacks', 'chips', 'biscuits', 'cookies', 'sweets', 'chocolate', 'candy'],
      'Household': ['cleaning', 'soap', 'detergent', 'tissue', 'paper', 'household', 'hygiene']
    };

    let organizedCount = 0;

    for (const category of existingCategories) {
      const categoryName = category.name.toLowerCase();
      let assignedParent = null;

      // Find matching parent category
      for (const [parentName, keywords] of Object.entries(categoryMappings)) {
        if (keywords.some(keyword => categoryName.includes(keyword))) {
          const parent = createdParents.find(p => p.name === parentName);
          if (parent) {
            assignedParent = parent;
            break;
          }
        }
      }

      // If no specific match found, assign to Pantry Essentials as default
      if (!assignedParent) {
        assignedParent = createdParents.find(p => p.name === 'Pantry Essentials');
      }

      if (assignedParent && category.id !== assignedParent.id) {
        await prisma.category.update({
          where: { id: category.id },
          data: { 
            parentId: assignedParent.id,
            sortOrder: organizedCount + 1
          }
        });
        console.log(`Organized "${category.name}" under "${assignedParent.name}"`);
        organizedCount++;
      }
    }

    console.log(`\n✅ Successfully organized ${organizedCount} categories under parent categories!`);
    
    // Display the hierarchy
    console.log('\n📁 Category Hierarchy:');
    for (const parent of createdParents) {
      const children = await prisma.category.findMany({
        where: { parentId: parent.id },
        orderBy: { sortOrder: 'asc' }
      });
      
      console.log(`\n${parent.icon} ${parent.name} (${children.length} subcategories)`);
      children.forEach(child => {
        console.log(`  └── ${child.name}`);
      });
    }

  } catch (error) {
    console.error('Error setting up parent categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupParentCategories();
