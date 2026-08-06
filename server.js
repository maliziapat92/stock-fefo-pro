import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import dashboardRoutes from "./routes/dashboardRoutes.js";
import historyRoutes from './routes/historyRoutes.js';
import importExportRoutes from './routes/importExportRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/history', historyRoutes);
app.use('/api', importExportRoutes);
app.get('/', (req, res) => {
  res.send('API Stock FEFO Pro en ligne avec PostgreSQL !');
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
