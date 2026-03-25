import connectDB from './db/index.js';
import { app } from './app.js';
import cron from 'node-cron';
import { syncProductRtoRates } from './services/analytics.service.js';

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);

            // --- NEW: Schedule Nightly Jobs ---
            // Runs at 02:00 AM every day
            cron.schedule(
                '0 2 * * *',
                () => {
                    syncProductRtoRates();
                },
                {
                    timezone: 'Asia/Kolkata', // Crucial for Indian dropshipping platforms!
                }
            );
        });
    })
    .catch((err) => {
        console.log('MONGO db connection failed !!! ', err);
    });
