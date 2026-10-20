import doctorModel from "../models/doctorModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import appointmentModel from "../models/appointmentModel.js";
import { formatConfirmationMessage } from "../utils/appointmentMessages.js";
import { sendConfirmationSms } from "../services/smsWebhook.js";
import { getJwtSecret } from "../config/jwt.js";
const changeAvailablity = async (req, res) => {
    console.log('changeAvailablity controller called');
    try {

        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
const doctorList=async(req,res)=>{
    try{
        const doctors = await doctorModel.find({}, { exclude: ["password", "email"] });
        res.json( { success: true, doctors });
    }catch(error){
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}
const loginDoctor=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const doctor=await doctorModel.findOne({email});
        if(!doctor){
            return res.json({success:false,message:'Invalid Credentials'});
        }
        const isMatch=await bcrypt.compare(password,doctor.password);
        if(isMatch){
            const token=jwt.sign({id:doctor._id},getJwtSecret());
            res.json({success:true,token});
        }else{
            res.json({success:false,message:'Invalid Credentials'});
        }
        

         
    }catch(error){
        console.log(error)
        res.json({ success: false, message: error.message });

    }

}

const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.user.userId; // get ID from auth middleware
        const appointments = await appointmentModel.find({ docId });

        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentConfirm = async (req, res) => {
    try {
        const docId = req.user.userId;
        const { appointmentId } = req.body;
        if (typeof appointmentId !== "string" || !appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" });
        }
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        const message = formatConfirmationMessage({
            doctorName: appointmentData.docData?.name,
            slotDate: appointmentData.slotDate,
            slotTime: appointmentData.slotTime,
        });
        const result = await appointmentModel.confirmAtomically(appointmentId, docId, message);

        if (!result.success) {
            const messages = {
                not_owner: "You are not authorized to confirm this appointment",
                appointment_not_found: "Appointment not found",
                appointment_not_confirmable: "Cancelled or completed appointments cannot be confirmed",
            };
            const statusCode = result.code === "appointment_not_found" ? 404 : 409;
            return res.status(statusCode).json({
                success: false,
                message: messages[result.code] || "Unable to confirm this appointment",
            });
        }

        let smsStatus = "pending";
        if (!process.env.SMS_WEBHOOK_URL) {
            console.error("Appointment confirmed, but SMS_WEBHOOK_URL is not configured.");
        } else {
            let notification;
            try {
                notification = await appointmentModel.claimNotification(result.notification_id);
                if (notification) {
                    await sendConfirmationSms(notification);
                    const recorded = await appointmentModel.finishNotification(notification.id, true);
                    if (!recorded) {
                        throw new Error("SMS delivery succeeded but could not be recorded");
                    }
                    smsStatus = "sent";
                } else {
                    smsStatus = "already_sent_or_in_progress";
                }
            } catch (error) {
                console.error("Appointment confirmation SMS delivery failed:", error.message);
                if (notification) {
                    try {
                        await appointmentModel.finishNotification(notification.id, false, error.message);
                    } catch (recordError) {
                        console.error("Unable to record SMS delivery failure:", recordError.message);
                    }
                }
                smsStatus = "failed";
            }
        }

        const smsMessage = {
            sent: "Confirmation SMS sent",
            pending: "Confirmation SMS is pending configuration",
            failed: "Confirmation recorded, but SMS delivery failed",
            already_sent_or_in_progress: "Confirmation SMS is already sent or being delivered",
        }[smsStatus];

        return res.json({
            success: true,
            message: `Appointment confirmed. ${smsMessage}.`,
            smsStatus,
        });
    } catch (error) {
        console.error("appointmentConfirm error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const appointmentCancel = async (req, res) => {
    try {
        const docId = req.user.userId;      // ✅ use authenticated doctor ID
        const { appointmentId } = req.body; // only appointment ID comes from client

        if (typeof appointmentId !== "string" || !appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" });
        }
        const result = await appointmentModel.cancelAtomically(appointmentId, docId, "doctor");
        if (!result.success) {
            const messages = {
                appointment_not_found: "Appointment not found",
                not_owner: "Not authorized to cancel this appointment",
                appointment_completed: "A completed appointment cannot be cancelled",
                payment_in_progress: "Patient payment has been started; resolve it before cancelling.",
                payment_received: "This appointment has been paid; contact the patient about a refund before cancelling.",
            };
            return res.status(result.code === "appointment_not_found" ? 404 : 409)
                .json({ success: false, message: messages[result.code] || "Unable to cancel appointment" });
        }
        return res.json({
            success: true,
            message: result.already_cancelled ? "Appointment already cancelled" : "Appointment Cancelled",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const appointmentComplete = async (req, res) => {
    try {
        const docId = req.user.userId;      // ✅ use authenticated doctor ID
        const { appointmentId } = req.body;

        if (typeof appointmentId !== "string" || !appointmentId) {
            return res.status(400).json({ success: false, message: "Appointment ID is required" });
        }
        const result = await appointmentModel.completeAtomically(appointmentId, docId);
        if (!result.success) {
            const messages = {
                appointment_not_found: "Appointment not found",
                not_owner: "Not authorized to complete this appointment",
                appointment_cancelled: "A cancelled appointment cannot be completed",
                payment_in_progress: "An active payment must be resolved before completing this appointment",
            };
            return res.status(result.code === "appointment_not_found" ? 404 : 409)
                .json({ success: false, message: messages[result.code] || "Unable to complete appointment" });
        }

        return res.json({ success: true, message: result.already_completed ? "Appointment already completed" : "Appointment Completed" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


const doctorDashboard = async (req, res) => {
    try {

        const docId = req.user.userId;

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })



        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



const doctorProfile = async (req, res) => {
    try {

       const docId = req.user.userId;
        const profileData = await doctorModel.findById(docId, { exclude: ["password"] })

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update doctor profile data from  Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {
        const docId = req.user.userId;
        const {  fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}




export { changeAvailablity,doctorList,loginDoctor,appointmentsDoctor,appointmentConfirm,appointmentCancel,appointmentComplete,doctorDashboard,doctorProfile,updateDoctorProfile};                          