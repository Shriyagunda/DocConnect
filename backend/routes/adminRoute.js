import express from 'express';
import { addDoctor,adminDashboard,allDoctors,appointmentCancel,loginAdmin } from '../controllers/adminController.js';
import authAdmin from '../middlewares/authAdmin.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import { appoinmentsAdmin } from '../controllers/adminController.js';

const adminRouter = express.Router();
adminRouter.post("/login", loginAdmin);
adminRouter.post("/add-doctor",authAdmin, addDoctor);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailablity);
adminRouter.get('/appointments',authAdmin,appoinmentsAdmin);
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel);
adminRouter.get('/dashboard',authAdmin,adminDashboard);
export default adminRouter;