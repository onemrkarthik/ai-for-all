const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * NOTE: Schema is centrally managed in /lib/db/schema.ts
 *
 * This script inlines the schema SQL for simplicity since it uses CommonJS.
 * DO NOT edit the SQL here - modify /lib/db/schema.ts instead.
 *
 * To run with TypeScript imports: npx tsx scripts/init-db.ts
 * Current approach: Inline SQL from schema (updated 2026-01-09)
 */

// Schema SQL (source: /lib/db/schema.ts)
const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS professionals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        source TEXT NOT NULL,
        image_url TEXT NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS photo_attributes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        photo_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS photos_professionals (
        photo_id INTEGER NOT NULL,
        professional_id INTEGER NOT NULL,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
        PRIMARY KEY (photo_id, professional_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER NOT NULL,
        reviewer_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        professional_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_summary TEXT,
        last_viewed_at DATETIME,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
`;

const dbPath = path.join(process.cwd(), 'local.db');

// Delete existing DB if it exists (for fresh start)
if (fs.existsSync(dbPath)) {
    console.log('Deleting existing database...');
    fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);
console.log('Database created at', dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create Tables
console.log('Creating tables from schema...');
db.exec(SCHEMA_SQL);

console.log('Tables created.');

// Data Generators (migrated from lib/data.ts)
const professionals = [
    { name: 'Sarah Mitchell', company: 'Mitchell Design Studio' },
    { name: 'David Chen', company: 'Urban Living Interiors' },
    { name: 'Emily Rodriguez', company: 'Rodriguez Architecture' },
    { name: 'Michael Thompson', company: 'Thompson & Associates' },
    { name: 'Jessica Park', company: 'Park Design Group' },
    { name: 'Robert Anderson', company: 'Anderson Kitchen & Bath' },
    { name: 'Lisa Wong', company: 'Modern Space Design' },
    { name: 'James Cooper', company: 'Cooper Residential Design' },
];

const styles = ['Modern', 'Contemporary', 'Transitional', 'Farmhouse', 'Traditional', 'Scandinavian'];
const layouts = ['L-Shaped', 'U-Shaped', 'Galley', 'Island', 'Peninsula', 'Open Concept'];
const cabinetFinishes = ['Flat Panel', 'Shaker', 'Glass Front', 'Raised Panel', 'Slab', 'Beadboard'];
const countertops = ['Quartz', 'Granite', 'Marble', 'Butcher Block', 'Concrete', 'Quartzite'];
const backsplashes = ['Ceramic Tile', 'Subway Tile', 'Glass Tile', 'Stone', 'Marble Slab', 'Mosaic'];
const flooring = ['Hardwood', 'Tile', 'Luxury Vinyl', 'Stone', 'Engineered Wood', 'Porcelain'];
const appliances = ['Stainless Steel', 'Panel Ready', 'Black Stainless', 'White', 'Custom Panel'];
const colorPalettes = ['White & Gray', 'Navy & White', 'Black & Wood', 'Beige & Cream', 'Green & Natural', 'Blue & White'];
const lighting = ['Pendant & Recessed', 'Chandelier & Under Cabinet', 'Track & Pendant', 'Recessed Only', 'Mixed Fixtures'];

// Prepare Statements
const insertProfessional = db.prepare('INSERT INTO professionals (name, company) VALUES (@name, @company)');
const insertPhoto = db.prepare('INSERT INTO photos (id, title, source, image_url, description) VALUES (@id, @title, @source, @image, @description)');
const insertPhotoAttribute = db.prepare('INSERT INTO photo_attributes (photo_id, label, value) VALUES (@photoId, @label, @value)');
const insertPhotoProfessional = db.prepare('INSERT INTO photos_professionals (photo_id, professional_id) VALUES (@photoId, @professionalId)');

const runTransaction = db.transaction((items: any[]) => {
    // 1. Insert Professionals
    const proIds = [];
    for (const pro of professionals) {
        const result = insertProfessional.run(pro);
        proIds.push(result.lastInsertRowid);
    }

    // 2. Insert Photos and Attributes
    for (const item of items) {
        insertPhoto.run(item);

        // Link Professional
        const proId = proIds[item.id % proIds.length]; // Simple deterministic assignment
        insertPhotoProfessional.run({ photoId: item.id, professionalId: proId });

        // Insert Attributes
        for (const attr of item.attributes) {
            insertPhotoAttribute.run({ photoId: item.id, label: attr.label, value: attr.value });
        }
    }
});

// Curated Unsplash kitchen images (reliable, high-quality kitchen photos)
const kitchenImages = [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', // White modern kitchen
    'https://images.unsplash.com/photo-1556909172-8c2f041fdc1e?w=800&h=600&fit=crop', // Kitchen with pendant lights
    'https://images.unsplash.com/photo-1556909211-36987daf7b4d?w=800&h=600&fit=crop', // Kitchen island
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop', // Modern kitchen
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop', // Kitchen counter
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=600&fit=crop', // Elegant kitchen
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop', // Kitchen design
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop', // Modern white kitchen
    'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=800&h=600&fit=crop', // Kitchen details
    'https://images.unsplash.com/photo-1556909190-eccf4a8bf97a?w=800&h=600&fit=crop', // Contemporary kitchen
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', // Luxury kitchen
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop', // Kitchen interior
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop', // Kitchen with island
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop', // Minimalist kitchen
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop', // Kitchen appliances
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=600&fit=crop', // Kitchen cabinets
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop', // Kitchen living
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop', // Kitchen dining
    'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop', // Modern design
    'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&h=600&fit=crop', // Kitchen space
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop', // Interior design
    'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=800&h=600&fit=crop', // Home kitchen
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800&h=600&fit=crop', // Kitchen view
    'https://images.unsplash.com/photo-1556909114-a9a073aede51?w=800&h=600&fit=crop', // White kitchen
    'https://images.unsplash.com/photo-1570739365376-26e49de30e3e?w=800&h=600&fit=crop', // Chef kitchen
    'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&h=600&fit=crop', // Kitchen stove
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&h=600&fit=crop', // Bright kitchen
    'https://images.unsplash.com/photo-1556909114-5e33c7d0f6f4?w=800&h=600&fit=crop', // Kitchen backsplash
    'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&h=600&fit=crop', // Rustic kitchen
    'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&h=600&fit=crop', // Open kitchen
    'https://images.unsplash.com/photo-1600566752734-64da76e65320?w=800&h=600&fit=crop', // Kitchen marble
    'https://images.unsplash.com/photo-1556909114-d88b61e57dc1?w=800&h=600&fit=crop', // Kitchen sink
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop', // Kitchen lighting
    'https://images.unsplash.com/photo-1556909190-6f13d97a4f5a?w=800&h=600&fit=crop', // Gray kitchen
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop', // Kitchen window
    'https://images.unsplash.com/photo-1556909115-5e8c00cef8c2?w=800&h=600&fit=crop', // Kitchen wood
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', // House kitchen
    'https://images.unsplash.com/photo-1556909190-ac37bb4dd4bc?w=800&h=600&fit=crop', // Clean kitchen
    'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop', // Traditional kitchen
    'https://images.unsplash.com/photo-1556909114-bd0e1f23e8c3?w=800&h=600&fit=crop', // Kitchen counter top
];

// Kitchen-specific titles
const kitchenTitlePrefixes = [
    'Modern', 'Contemporary', 'Transitional', 'Traditional', 'Farmhouse',
    'Industrial', 'Coastal', 'Mediterranean', 'Scandinavian', 'Mid-Century',
    'Rustic', 'Luxury', 'Minimalist', 'French Country', 'Colonial'
];

const kitchenTitleSuffixes = [
    'Kitchen with Island', 'Kitchen Remodel', 'Open Kitchen Design',
    'Gourmet Kitchen', 'Chef\'s Kitchen', 'Family Kitchen',
    'Kitchen with Breakfast Nook', 'Kitchen Renovation', 'Kitchen Makeover',
    'Dream Kitchen'
];

// Kitchen-specific descriptions
const kitchenDescriptions = [
    'This stunning kitchen design showcases a perfect blend of functionality and aesthetics. The space features high-end finishes, custom cabinetry, and premium appliances that create an inviting atmosphere for both cooking and entertaining.',
    'A beautifully designed kitchen that combines timeless elegance with modern convenience. Custom cabinets and premium countertops create a sophisticated space perfect for family gatherings.',
    'This chef-inspired kitchen features professional-grade appliances and ample counter space. The thoughtful layout maximizes workflow efficiency while maintaining a welcoming aesthetic.',
    'Experience the perfect balance of style and function in this expertly designed kitchen. Quality craftsmanship and attention to detail are evident throughout the space.',
    'A stunning transformation featuring custom cabinetry, elegant lighting, and premium materials. This kitchen is designed for both everyday cooking and special occasions.',
    'This modern kitchen design emphasizes clean lines and efficient use of space. High-quality finishes and smart storage solutions make it both beautiful and practical.',
    'An inviting kitchen that serves as the heart of the home. Premium materials and thoughtful design create a space where memories are made.',
    'This sophisticated kitchen combines classic design principles with contemporary amenities. Every detail has been carefully considered for maximum impact.',
    'A masterfully designed kitchen featuring top-of-the-line appliances and custom details. The space seamlessly blends style with everyday functionality.',
    'Transform your cooking experience in this beautifully appointed kitchen. Premium finishes and intelligent design create an inspiring culinary workspace.'
];

// Generate 100 items
const items = [];
const limit = 100;
for (let i = 0; i < limit; i++) {
    const id = i + 1;
    const hasIsland = id % 3 !== 0; // Simple logic
    const style = styles[id % styles.length];

    const attributes = [
        { label: 'Style', value: style },
        { label: 'Layout', value: layouts[id % layouts.length] },
        { label: 'Cabinet Finish', value: cabinetFinishes[id % cabinetFinishes.length] },
        { label: 'Countertop Material', value: countertops[id % countertops.length] },
        { label: 'Backsplash', value: backsplashes[id % backsplashes.length] },
        { label: 'Flooring', value: flooring[id % flooring.length] },
        { label: 'Appliances', value: appliances[id % appliances.length] },
        { label: 'Island', value: hasIsland ? 'Yes' : 'No' },
        { label: 'Color Palette', value: colorPalettes[id % colorPalettes.length] },
        { label: 'Lighting', value: lighting[id % lighting.length] },
    ];

    // Generate varied kitchen titles
    const titlePrefix = kitchenTitlePrefixes[id % kitchenTitlePrefixes.length];
    const titleSuffix = kitchenTitleSuffixes[id % kitchenTitleSuffixes.length];
    const title = `${titlePrefix} ${titleSuffix}`;

    items.push({
        id,
        title,
        source: `Stream Batch`, // Simplified source logic
        image: kitchenImages[id % kitchenImages.length], // Use curated Unsplash kitchen images
        description: kitchenDescriptions[id % kitchenDescriptions.length],
        attributes
    });
}

console.log('Seeding data...');
runTransaction(items);
console.log('Seeding complete. 100 photos inserted.');

// Seed Reviews
console.log('Seeding reviews...');
const reviewComments = [
    'Excellent work! Very professional and delivered exactly what we wanted.',
    'Great experience working with this team. Highly recommend!',
    'Quality work and great attention to detail. Would hire again.',
    'Professional service from start to finish. Very satisfied.',
    'Amazing transformation! Exceeded our expectations.',
    'Responsive and easy to work with. Beautiful results.',
    'Top-notch craftsmanship and design expertise.',
    'Wonderful experience. They made the process stress-free.',
    'Outstanding quality and service. Worth every penny.',
    'Creative solutions and excellent execution. Loved the final result!',
];

const reviewerNames = [
    'Jennifer S.', 'Michael T.', 'Sarah L.', 'David W.', 'Emily R.',
    'John K.', 'Lisa M.', 'Robert P.', 'Amanda H.', 'Christopher B.',
    'Michelle G.', 'Daniel F.', 'Jessica N.', 'Matthew C.', 'Ashley D.',
];

const insertReview = db.prepare('INSERT INTO reviews (professional_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)');
const seedReviews = db.transaction(() => {
    // Generate 5 reviews for each professional
    for (let profId = 1; profId <= professionals.length; profId++) {
        for (let i = 0; i < 5; i++) {
            const rating = 4 + (profId % 2); // Ratings between 4-5
            const reviewerName = reviewerNames[(profId * 5 + i) % reviewerNames.length];
            const comment = reviewComments[(profId * 5 + i) % reviewComments.length];

            insertReview.run(profId, reviewerName, rating, comment);
        }
    }
});

seedReviews();
console.log(`Seeding complete. ${professionals.length * 5} reviews inserted.`);
