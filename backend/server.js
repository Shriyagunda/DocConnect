import express from 'express';
import cors from 'cors';    
import 'dotenv/config';
import { verifySupabaseConnection } from './config/supabase.js';
import { getJwtSecret } from './config/jwt.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

try {
    getJwtSecret();
} catch (error) {
    console.warn(`[Startup Warning] ${error.message}`);
}

const app = express();
const port= process.env.PORT || 5000;
verifySupabaseConnection().catch((error) => {
    console.error('Unable to reach Supabase. Confirm the SQL schema has been applied.');
    console.error(error.message);
});

const allowedOrigins = [
    'https://doc-connect-a0i8c8049-shriyagunda.vercel.app',
    'https://doc-connect-weld.vercel.app'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/admin',adminRouter);
app.use('/api/doctor',doctorRouter);
app.use('/api/user',userRouter);
app.get('/', (req, res) => {
    res.send('API is running....');
});

app.listen(port, () => {
    console.log(`Server is running  on port ${port}`);
});
