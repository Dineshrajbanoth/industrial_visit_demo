const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');
const connectDB = require('./config/db');

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 5000;

function handleListenError(error) {
  if (error && error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other backend instance or set a different PORT value.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error.message);
  process.exit(1);
}

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });

    server.on('error', handleListenError);
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
