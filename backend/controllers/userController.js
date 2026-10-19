import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { isValidAppointmentSlot } from "../utils/appointmentMessages.js";




// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, password } = req.body;
        const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
        const normalizedName = typeof name === "string" ? name.trim() : "";

        // checking for all data to register user
        if (!normalizedName || !email || typeof password !== "string" || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name: normalizedName,
            email,
            password: hashedPassword,
        }

        const user = await userModel.create(userData)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
        const { password } = req.body;
        if (!email || typeof password !== "string" || !password) {
            return res.json({ success: false, message: "Email and password are required" });
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;             // <-- changed
    const userData = await userModel.findById(userId, { exclude: ["password"] });
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;             // <-- changed
    const { name, phone, address, dob, gender } = req.body;
    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }
    if (!address || typeof address !== "object" || Array.isArray(address)) {
      return res.status(400).json({ success: false, message: "A valid address is required" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address,
      dob,
      gender,
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};




const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { docId, slotDate, slotTime } = req.body;

    if (typeof docId !== "string" || !docId || !isValidAppointmentSlot(slotDate, slotTime)) {
      return res.status(400).json({ success: false, message: "Please provide a valid doctor and appointment slot" });
    }

    const userData = await userModel.findById(userId, { exclude: ["password"] });
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const result = await appointmentModel.bookAtomically({
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
    });

    if (!result.success) {
      const statusCode = result.code === "doctor_not_found" ? 404 : 409;
      const messages = {
        doctor_not_found: "Doctor not found",
        doctor_unavailable: "Doctor is not available",
        slot_unavailable: "This appointment slot is no longer available",
      };
      return res.status(statusCode).json({
        success: false,
        message: messages[result.code] || "Unable to book this appointment",
      });
    }

    return res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.error("bookAppointment error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("listAppointments error:", error);
    res.json({ success: false, message: error.message });
  }
};
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.userId; // take userId from auth middleware

        if (typeof appointmentId !== "string" || !appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" });
        }
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // verify appointment user
        if (appointmentData.userId.toString() !== userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized action' });
        }

        const result = await appointmentModel.cancelAtomically(appointmentId, userId, "user");
        if (!result.success) {
          const messages = {
            not_owner: "Unauthorized action",
            appointment_completed: "A completed appointment cannot be cancelled",
            payment_in_progress: "Payment has been started. Finish it or contact support before cancelling.",
            payment_received: "This appointment has been paid. Contact support to discuss a cancellation or refund.",
          };
          const statusCode = result.code === "not_owner" ? 401 : 409;
          return res.status(statusCode).json({
            success: false,
            message: messages[result.code] || "Unable to cancel this appointment",
          });
        }

        res.json({
          success: true,
          message: result.already_cancelled ? "Appointment already cancelled" : "Appointment Cancelled",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};







export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,bookAppointment,listAppointment,cancelAppointment}
    