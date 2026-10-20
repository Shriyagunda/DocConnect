import doctorModel from '../models/doctorModel.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from '../models/userModel.js';
import { DEFAULT_USER_IMAGE } from "../models/defaultUserImage.js";
import { getJwtSecret } from "../config/jwt.js";

const addDoctor = async (req, res) => {
    try{

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }
        let parsedAddress;
        try {
            parsedAddress = typeof address === "string" ? JSON.parse(address) : address
        } catch {
            return res.status(400).json({ success: false, message: "Please enter a valid address" })
        }
        if (!parsedAddress || typeof parsedAddress !== "object" || Array.isArray(parsedAddress)) {
            return res.status(400).json({ success: false, message: "Please enter a valid address" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const doctorData = {
            name,
            email,
            image: DEFAULT_USER_IMAGE,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: parsedAddress,
            date: Date.now()
        }

        await doctorModel.create(doctorData)
        res.json({ success: true, message: 'Doctor Added' })

    }catch(error){
          console.log(error)
        res.json({ success: false, message: error.message })
    }
} 



const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, getJwtSecret())
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}, { exclude: ["password"] })
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const appoinmentsAdmin=async(req,res)=>{
     try{
          const appointments=await appointmentModel.find({}); 
          res.json({success:true,appointments})
     }catch(error){
        res.json({success:false,message:error.message})
     }
}
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        if (typeof appointmentId !== "string" || !appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" })
        }
        const result = await appointmentModel.cancelAtomically(appointmentId, null, "admin")
        if (!result.success) {
            const messages = {
                appointment_not_found: "Appointment not found",
                appointment_completed: "A completed appointment cannot be cancelled",
                payment_in_progress: "Payment has been started. Resolve it before cancelling.",
                payment_received: "This appointment has been paid. Refund handling is required before cancellation.",
            }
            return res.status(result.code === "appointment_not_found" ? 404 : 409)
                .json({ success: false, message: messages[result.code] || "Unable to cancel appointment" })
        }

        res.json({
            success: true,
            message: result.already_cancelled ? "Appointment already cancelled" : "Appointment Cancelled",
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }

}

const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}, { exclude: ["password"] })
        const users = await userModel.find({}, { exclude: ["password"] })
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export {addDoctor, loginAdmin, allDoctors,appoinmentsAdmin,appointmentCancel,adminDashboard};