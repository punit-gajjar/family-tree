import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:5173', // Vite default
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public'))); // Serve public assets if any
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded/seeded images

// Health check
app.get('/', (req, res) => {
    res.send('Family Tree API is running');
});

// Routes (to be imported)
import authRoutes from './routes/auth.routes';
import memberRoutes from './routes/members.routes';
import relationRoutes from './routes/relations.routes';
import treeRoutes from './routes/tree.routes';
import dashboardRoutes from './routes/dashboard.routes';
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/relations', relationRoutes);
app.use('/api/v1/tree', treeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
