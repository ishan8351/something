import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';
import { Counter } from './src/models/Counter.js';
import connectDB from './src/db/index.js';

// Load environment variables
dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();
        console.log('📦 Connected to Database...');

        // 1. Clear existing users and counters to start fresh
        console.log('🧹 Clearing old users and counters...');
        await User.deleteMany({});
        await Counter.deleteMany({ _id: 'customerId' });

        // Initialize the Counter for future organic signups
        await Counter.create({ _id: 'customerId', seq: 4 }); 

        // 2. Define our perfect test accounts
        const usersToSeed = [
            {
                name: 'System Admin',
                email: 'admin@wukusy.com',
                phoneNumber: '9999999999',
                passwordHash: 'Admin123!', // The pre-save hook will hash this
                role: 'ADMIN',
                accountType: 'B2B',
                customerId: 'CUST00001',
                isActive: true
            },
            {
                name: 'John B2C',
                email: 'customer@test.com',
                phoneNumber: '8888888888',
                passwordHash: 'Pass123!',
                role: 'CUSTOMER',
                accountType: 'B2C',
                customerId: 'CUST00002',
                isActive: true
            },
            {
                name: 'Acme Dropshipping (Approved)',
                email: 'b2b_approved@test.com',
                phoneNumber: '7777777777',
                passwordHash: 'Pass123!',
                role: 'RESELLER',
                accountType: 'B2B',
                companyName: 'Acme Corp',
                gstin: '22AAAAA0000A1Z5',
                kycStatus: 'APPROVED', // Ready to use wallet/wholesale!
                isVerifiedB2B: true,
                customerId: 'CUST00003',
                walletBalance: 5000, // Give them some starting cash
                billingAddress: {
                    street: '123 Wholesale St',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400001'
                },
                isActive: true
            },
            {
                name: 'Pending Dropshipper',
                email: 'b2b_pending@test.com',
                phoneNumber: '6666666666',
                passwordHash: 'Pass123!',
                role: 'RESELLER',
                accountType: 'B2B',
                companyName: 'Pending LLC',
                kycStatus: 'PENDING', // Will hit the KYC wall
                isVerifiedB2B: false,
                customerId: 'CUST00004',
                isActive: true
            }
        ];

        console.log('🌱 Planting new users...');

        // We use a for...of loop with .create() to ensure the Mongoose pre('save') 
        // middleware runs and actually hashes the passwords!
        for (const userData of usersToSeed) {
            await User.create(userData);
            console.log(`✅ Created ${userData.role}: ${userData.email}`);
        }

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    }
};

seedUsers();
