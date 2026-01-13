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
        photo_id INTEGER NOT NULL,
        professional_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_summary TEXT,
        last_viewed_at DATETIME,
        FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL
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
        image: `https://loremflickr.com/800/600/kitchen,interior,modern?lock=${id}`,
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
