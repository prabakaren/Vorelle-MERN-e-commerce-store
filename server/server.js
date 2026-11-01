// Local development entry point. On Vercel the app is served from api/index.js instead.
import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Vorelle API running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
