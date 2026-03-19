import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { fakerEN_IN as faker } from '@faker-js/faker'; // Indian locale for realistic data
import connectDB from './src/db/index.js';

// Import Models
import { User } from './src/models/User.js';
import { Category } from './src/models/Category.js';
import { Product } from './src/models/Product.js';
import { Counter } from './src/models/Counter.js';
import { WalletTransaction } from './src/models/WalletTransaction.js';

dotenv.config();

// Configuration for scale
const NUM_RESELLERS = 100;
const NUM_CUSTOMERS = 100;
const NUM_PRODUCTS = 1000;

// Helper: Generate valid Indian GSTIN matching your strict Regex
const generateGSTIN = () => {
    const stateCode = faker.string.numeric(2); // [0-9]{2}
    const panAlpha = faker.string.alpha({ length: 5, casing: 'upper' }); // [A-Z]{5}
    const panNumeric = faker.string.numeric(4); // [0-9]{4}
    const panCheck = faker.string.alpha({ length: 1, casing: 'upper' }); // [A-Z]{1}
    const entity = faker.number.int({ min: 1, max: 9 }).toString(); // [1-9A-Z]{1} (Strictly 1-9 to avoid 0)
    const fourteenth = 'Z'; // [A-Z0-9]{1} (Standard GSTIN format usually has Z here)
    const checksum = faker.string.numeric(1); // [0-9A-Z]{1}

    return `${stateCode}${panAlpha}${panNumeric}${panCheck}${entity}${fourteenth}${checksum}`;
};
const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('🌱 Connected. Purging entire database...');
        await mongoose.connection.db.dropDatabase();
        console.log('💥 Clean slate achieved.');

        console.log('⏳ Seeding Counters...');
        await Counter.create({ _id: 'invoiceNumber', seq: 10000 });

        // --- 1. CATEGORIES ---
        console.log('⏳ Generating Categories...');
        const baseCategories = ['Electronics', 'Apparel', 'Industrial', 'Home & Kitchen', 'Beauty'];
        const categoryDocs = await Category.insertMany(
            baseCategories.map(name => ({ name }))
        );

        // --- 2. USERS (Batching for performance) ---
        console.log(`⏳ Generating ${NUM_RESELLERS + NUM_CUSTOMERS + 1} Users... (Hashing password once for speed)`);
        const defaultPasswordHash = await bcrypt.hash('Pass@123', 10);
        
        const usersToInsert = [];

        // Add Resellers (B2B)
        for (let i = 0; i < NUM_RESELLERS; i++) {
            usersToInsert.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phoneNumber: faker.string.numeric(10),
                passwordHash: defaultPasswordHash,
                role: 'RESELLER',
                accountType: 'B2B',
                isVerifiedB2B: faker.datatype.boolean(0.8), // 80% verified
                companyName: faker.company.name() + ' Enterprises',
                gstin: generateGSTIN(),
                kycStatus: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'APPROVED']),
                walletBalance: faker.number.int({ min: 10000, max: 500000 }), // Huge wallet balances
                billingAddress: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    zip: faker.location.zipCode('######')
                }
            });
        }

        // Add Customers (B2C)
        for (let i = 0; i < NUM_CUSTOMERS; i++) {
            usersToInsert.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phoneNumber: faker.string.numeric(10),
                passwordHash: defaultPasswordHash,
                role: 'CUSTOMER',
                accountType: 'B2C'
            });
        }

        // --- CUSTOM MANUAL USERS FOR TESTING ---
        usersToInsert.push(
            {
                name: 'Test Admin',
                email: 'admin-test@sovely.in',
                phoneNumber: '9999999998',
                passwordHash: defaultPasswordHash, // Pass@123
                role: 'ADMIN',
                accountType: 'B2B',
                kycStatus: 'APPROVED',
                isActive: true
            },
            {
                name: 'Demo Reseller',
                email: 'reseller@sovely.in',
                phoneNumber: '8888888888',
                passwordHash: defaultPasswordHash, // Pass@123
                role: 'RESELLER',
                accountType: 'B2B',
                isVerifiedB2B: true,
                companyName: 'Demo Retailers Pvt Ltd',
                // Hardcoded valid GSTIN matching your regex exactly
                gstin: '27ABCDE1234F1Z9', 
                kycStatus: 'APPROVED',
                walletBalance: 25000,
                billingAddress: {
                    street: '123 Market Road',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400001'
                },
                isActive: true
            },
            {
                name: 'Demo Customer',
                email: 'customer@sovely.in',
                phoneNumber: '7777777777',
                passwordHash: defaultPasswordHash, // Pass@123
                role: 'CUSTOMER',
                accountType: 'B2C',
                isActive: true
            }
        );

        const insertedUsers = await User.insertMany(usersToInsert);
        const resellers = insertedUsers.filter(u => u.role === 'RESELLER');

        // --- 3. PRODUCTS ---
        console.log(`⏳ Generating ${NUM_PRODUCTS} Products...`);
        const productsToInsert = [];
        const gstSlabs = [0, 5, 12, 18, 28];

        for (let i = 0; i < NUM_PRODUCTS; i++) {
            const dropshipBasePrice = faker.number.int({ min: 100, max: 10000 });
            const suggestedRetailPrice = faker.number.int({ min: dropshipBasePrice + 100, max: dropshipBasePrice * 2.5 });
            const estimatedMarginPercent = Math.round(((suggestedRetailPrice - dropshipBasePrice) / suggestedRetailPrice) * 100);
            
            // 1. Pick a random category first so we can use its name for the image
            const randomCategory = faker.helpers.arrayElement(categoryDocs);
            
            // 2. Clean the category name for the image fetcher (e.g., "Home & Kitchen" -> "home,kitchen")
            const imageKeyword = randomCategory.name.toLowerCase().replace(/ & /g, ',');

            // 3. Generate 1 to 3 random images for this product
            const numImages = faker.number.int({ min: 1, max: 3 });
            const productImages = [];
            for(let j = 0; j < numImages; j++) {
                productImages.push({
                    // urlLoremFlickr pulls realistic images based on the keyword
                    url: faker.image.urlLoremFlickr({ category: imageKeyword, width: 640, height: 640 }),
                    position: j + 1,
                    altText: `${faker.commerce.productAdjective()} ${randomCategory.name}`
                });
            }

            productsToInsert.push({
                sku: `SOV-${faker.string.alphanumeric(8).toUpperCase()}`,
                title: faker.commerce.productName(),
                descriptionHTML: `<p>${faker.commerce.productDescription()}</p><ul><li>Feature 1: ${faker.lorem.word()}</li><li>Feature 2: ${faker.lorem.word()}</li></ul>`,
                vendor: faker.company.name(),
                tags: [faker.commerce.productAdjective(), faker.commerce.productMaterial()],
                
                // Use the ID of the category we picked above
                categoryId: randomCategory._id, 
                
                // Drop in our dynamic images array!
                images: productImages,
                
                dropshipBasePrice,
                suggestedRetailPrice,
                estimatedMarginPercent,
                
                tieredPricing: [
                    { minQty: 10, maxQty: 49, pricePerUnit: dropshipBasePrice * 0.95 },
                    { minQty: 50, pricePerUnit: dropshipBasePrice * 0.90 }
                ],
                
                weightGrams: faker.number.int({ min: 50, max: 10000 }),
                dimensions: { 
                    length: faker.number.int({ min: 5, max: 100 }), 
                    width: faker.number.int({ min: 5, max: 100 }), 
                    height: faker.number.int({ min: 5, max: 100 }) 
                },
                hsnCode: faker.string.numeric(4),
                gstSlab: faker.helpers.arrayElement(gstSlabs),
                shippingDays: faker.helpers.arrayElement(['2-3', '3-5', '5-7']),
                returnPolicy: faker.helpers.arrayElement(['NO_RETURNS', '7_DAYS_REPLACEMENT', '7_DAYS_RETURN']),
                
                status: faker.helpers.arrayElement(['active', 'active', 'draft']),
                moq: faker.number.int({ min: 1, max: 50 }),
                inventory: { 
                    stock: faker.number.int({ min: 0, max: 5000 }), 
                    alertThreshold: faker.number.int({ min: 10, max: 100 }) 
                },
                averageRating: faker.number.float({ min: 1, max: 5, multipleOf: 0.1 }),
                reviewCount: faker.number.int({ min: 0, max: 1000 })
            });
        }

        await Product.insertMany(productsToInsert);

        // --- 4. SEED SOME WALLET TRANSACTIONS ---
        console.log(`⏳ Generating Wallet Ledgers for Resellers...`);
        const transactions = resellers.slice(0, 100).map(reseller => ({
            resellerId: reseller._id,
            type: 'CREDIT',
            purpose: 'WALLET_RECHARGE',
            amount: reseller.walletBalance, // Sync initial ledger with user document
            closingBalance: reseller.walletBalance,
            referenceId: `INIT_BAL_${faker.string.alphanumeric(6)}`,
            description: 'Initial Seed Balance',
            status: 'COMPLETED'
        }));

        await WalletTransaction.insertMany(transactions);

        console.log('✅ MASS SEEDING COMPLETE! Database is locked and loaded.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};

seedDatabase();