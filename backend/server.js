import express from 'express';
import cors from 'cors';    
import 'dotenv/config';
import { verifySupabaseConnection } from './config/supabase.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';

const app = express();
const port= process.env.PORT || 5000;
verifySupabaseConnection().catch((error) => {
    console.error('Unable to reach Supabase. Confirm the SQL schema has been applied.');
    console.error(error.message);
});
app.use(cors());//frontend and backend communication
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
