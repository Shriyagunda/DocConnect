import 'dotenv/config';
import bcrypt from 'bcrypt';
import doctorModel from '../models/doctorModel.js';

const additionalDoctors = [
  {
    name: 'Dr. Christopher Davis',
    email: 'christopher.davis@mediconnect.com',
    speciality: 'General physician',
    degree: 'MBBS, MD (Internal Medicine)',
    experience: '6 Years',
    about: 'Dr. Christopher Davis specializes in adult health, preventative diagnostics, chronic disease management, and metabolic health with patient-focused empathetic care.',
    fees: 50,
    available: true,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '14th Avenue, Richmond Hill',
      line2: 'Central Plaza, London',
    },
  },
  {
    name: 'Dr. Chloe Evans',
    email: 'chloe.evans@mediconnect.com',
    speciality: 'General physician',
    degree: 'MBBS, FACP',
    experience: '5 Years',
    about: 'Dr. Chloe Evans provides comprehensive outpatient primary care with special clinical interests in geriatric care, preventive screenings, and cardiovascular risk reduction.',
    fees: 55,
    available: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '88 Baker Street',
      line2: 'Marylebone Medical Suites, London',
    },
  },
  {
    name: 'Dr. Marcus Vance',
    email: 'marcus.vance@mediconnect.com',
    speciality: 'General physician',
    degree: 'MBBS, MRCGP',
    experience: '8 Years',
    about: 'Dr. Marcus Vance is an experienced family physician focusing on lifestyle medicine, early detection of hypertension, and holistic health plans for busy professionals.',
    fees: 65,
    available: true,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '22 Kensington High St',
      line2: 'Suite 401, London',
    },
  },
  {
    name: 'Dr. Timothy White',
    email: 'timothy.white@mediconnect.com',
    speciality: 'Gynecologist',
    degree: 'MBBS, MS (Obstetrics & Gynaecology)',
    experience: '7 Years',
    about: 'Dr. Timothy White is dedicated to evidence-based obstetric and gynecological care, high-risk pregnancy management, and minimally invasive reproductive health procedures.',
    fees: 70,
    available: true,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '55 Harley Street',
      line2: 'Women’s Wellness Wing, London',
    },
  },
  {
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@mediconnect.com',
    speciality: 'Gynecologist',
    degree: 'MBBS, MD, MRCOG',
    experience: '9 Years',
    about: 'Dr. Elena Rostova specializes in maternal-fetal medicine, adolescent gynecology, and hormonal therapies, recognized for high patient satisfaction and attentive consultations.',
    fees: 85,
    available: true,
    image: 'https://images.unsplash.com/photo-1594824813576-96b63d76e469?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '10 Queensway',
      line2: 'Regent Medical Park, London',
    },
  },
  {
    name: 'Dr. Ryan Martinez',
    email: 'ryan.martinez@mediconnect.com',
    speciality: 'Gynecologist',
    degree: 'MBBS, DGO',
    experience: '4 Years',
    about: 'Dr. Ryan Martinez provides supportive prenatal care, routine gynecological exams, fertility counseling, and postpartum recovery guidance.',
    fees: 60,
    available: true,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '40 Westbourne Grove',
      line2: 'Notting Hill Clinic, London',
    },
  },
  {
    name: 'Dr. Ava Mitchell',
    email: 'ava.mitchell@mediconnect.com',
    speciality: 'Dermatologist',
    degree: 'MBBS, MD (Dermatology)',
    experience: '5 Years',
    about: 'Dr. Ava Mitchell specializes in medical and aesthetic dermatology, treating chronic eczema, acne, psoriasis, and performing full-body skin cancer screenings.',
    fees: 45,
    available: true,
    image: 'https://images.unsplash.com/photo-1594824813631-0cfd68f6bf79?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '32 St John’s Wood High St',
      line2: 'Dermal Care Pavilion, London',
    },
  },
  {
    name: 'Dr. Amelia Hill',
    email: 'amelia.hill@mediconnect.com',
    speciality: 'Dermatologist',
    degree: 'MBBS, DVD',
    experience: '6 Years',
    about: 'Dr. Amelia Hill is an expert in allergic skin conditions, pediatric dermatology, and cosmetic therapies, offering tailored skincare regimens for lasting clinical outcomes.',
    fees: 50,
    available: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '18 Chelsea Square',
      line2: 'King’s Road Medical Centre, London',
    },
  },
  {
    name: 'Dr. Lucas Gray',
    email: 'lucas.gray@mediconnect.com',
    speciality: 'Dermatologist',
    degree: 'MBBS, FAAD',
    experience: '10 Years',
    about: 'Dr. Lucas Gray is an internationally trained dermatologist with over a decade of clinical experience in advanced phototherapy, laser surgery, and complex dermatoses.',
    fees: 75,
    available: true,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '71 Victoria Street',
      line2: 'Westminster Skin Clinic, London',
    },
  },
  {
    name: 'Dr. Jeffrey King',
    email: 'jeffrey.king@mediconnect.com',
    speciality: 'Pediatricians',
    degree: 'MBBS, MD (Pediatrics)',
    experience: '5 Years',
    about: 'Dr. Jeffrey King provides compassionate newborn care, childhood developmental milestones tracking, immunizations, and pediatric urgent care with a warm bedside manner.',
    fees: 45,
    available: true,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '12 Camden High Street',
      line2: 'Children’s Health Hub, London',
    },
  },
  {
    name: 'Dr. Maya Lin',
    email: 'maya.lin@mediconnect.com',
    speciality: 'Pediatricians',
    degree: 'MBBS, DCH, MRCPCH',
    experience: '6 Years',
    about: 'Dr. Maya Lin specializes in pediatric respiratory illnesses, childhood allergies, and growth assessment, dedicated to putting young patients and parents at ease.',
    fees: 50,
    available: true,
    image: 'https://images.unsplash.com/photo-1594824813576-96b63d76e469?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '95 Hampstead Way',
      line2: 'Family & Child Health Center, London',
    },
  },
  {
    name: 'Dr. Zoe Kelly',
    email: 'zoe.kelly@mediconnect.com',
    speciality: 'Neurologist',
    degree: 'MBBS, DM (Neurology)',
    experience: '8 Years',
    about: 'Dr. Zoe Kelly is a clinical neurologist focused on headache disorders, epilepsy, neuromuscular conditions, and post-concussion care with advanced neuro-diagnostic protocols.',
    fees: 90,
    available: true,
    image: 'https://images.unsplash.com/photo-1594824813631-0cfd68f6bf79?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '14 Bloomsbury Square',
      line2: 'Brain & Spine Institute, London',
    },
  },
  {
    name: 'Dr. Patrick Harris',
    email: 'patrick.harris@mediconnect.com',
    speciality: 'Neurologist',
    degree: 'MBBS, MD, DNB (Neurology)',
    experience: '9 Years',
    about: 'Dr. Patrick Harris provides specialized evaluation for memory disorders, peripheral neuropathy, movement disorders, and sleep neurological conditions.',
    fees: 85,
    available: true,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '60 Queen Square',
      line2: 'Neuroscience Center, London',
    },
  },
  {
    name: 'Dr. Boston Scott',
    email: 'boston.scott@mediconnect.com',
    speciality: 'Gastroenterologist',
    degree: 'MBBS, DM (Gastroenterology)',
    experience: '7 Years',
    about: 'Dr. Boston Scott specializes in digestive wellness, IBS management, diagnostic endoscopy, liver health, and inflammatory bowel diseases with personalized nutritional guidance.',
    fees: 75,
    available: true,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '25 Devonshire Place',
      line2: 'Digestive Health Clinic, London',
    },
  },
  {
    name: 'Dr. Hannah Abbott',
    email: 'hannah.abbott@mediconnect.com',
    speciality: 'Gastroenterologist',
    degree: 'MBBS, MD (Gastroenterology)',
    experience: '5 Years',
    about: 'Dr. Hannah Abbott treats acid reflux, GERD, celiac disease, and intestinal motility disorders, combining modern therapeutics with preventative digestive health strategies.',
    fees: 65,
    available: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
    address: {
      line1: '103 Wimpole Street',
      line2: 'London Gastro Suite, London',
    },
  },
];

async function seedDoctors() {
  console.log('Seeding doctors into database...');
  const defaultPasswordHash = await bcrypt.hash('doctor123', 10);
  let added = 0;
  let skipped = 0;

  for (const doc of additionalDoctors) {
    const existing = await doctorModel.findOne({ email: doc.email });
    if (existing) {
      console.log(`- Doctor already exists: ${doc.name} (${doc.email})`);
      skipped++;
      continue;
    }

    await doctorModel.create({
      ...doc,
      password: defaultPasswordHash,
      date: Date.now(),
      slots_booked: {},
    });
    console.log(`+ Inserted: ${doc.name} - ${doc.speciality}`);
    added++;
  }

  console.log(`\nSeed Complete! Added: ${added}, Skipped: ${skipped}`);
  process.exit(0);
}

seedDoctors().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
