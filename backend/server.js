// server.js — the file that actually starts your API server
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express(); // creates the Express application object

app.use(cors());          // allows requests from the React app's different port (browsers block this by default)
app.use(express.json());  // automatically parses incoming JSON bodies into req.body

app.use('/api/products', productRoutes);   // any URL starting with /api/products goes to this router file
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' })); // quick check that the server is alive

app.use(errorHandler); // must be LAST — catches any error thrown in routes above and sends a clean response

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // starts listening for requests