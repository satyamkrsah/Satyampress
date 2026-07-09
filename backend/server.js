const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { startWorker } = require('./utils/notifier');
const logger = require('./utils/logger');

// Route files
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const auth = require('./routes/userRoutes');
const categories = require('./routes/categoryRoutes');
const products = require('./routes/productRoutes');
const cart = require('./routes/cartRoutes');
const addresses = require('./routes/addressRoutes');
const orders = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const payments = require('./routes/paymentRoutes');
const notifications = require('./routes/notificationRoutes');

// Load env vars
// dotenv.config();

// Connect to database
// Connect to database
connectDB();

const app = express();

// Middleware
// Body parser
app.use(express.json());

// Compress responses
app.use(compression());

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com/"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.razorpay.com/"]
    }
  }
}));
app.use(mongoSanitize());
app.use(xss());

// Enable CORS
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000 // 1000 requests per 15 mins
});
app.use(limiter);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Memory Usage Monitor
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  logger.info('Memory Usage', {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
  });
}, 15 * 60 * 1000); // Log every 15 minutes

// Swagger Documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/categories', categories);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/addresses', addresses);
app.use('/api/orders', orders);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', payments);
app.use('/api/notifications', notifications);

// Error handler middleware (Should be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start background workers
startWorker();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
