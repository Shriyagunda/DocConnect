import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import logo from './logo.svg'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'


export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
}

export const handleImageError = (event) => {
    event.currentTarget.onerror = null
    event.currentTarget.src = profile_pic
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS, MD',
        experience: '4 Years',
        about: 'Dr. Richard James is dedicated to delivering comprehensive adult medical care, early illness diagnosis, and proactive chronic disease prevention with patient-centered treatment plans.',
        fees: 50,
        available: true,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS, MS',
        experience: '3 Years',
        about: 'Dr. Emily Larson specializes in comprehensive women’s healthcare, prenatal guidance, gynecological screenings, and postnatal support with empathetic bedside care.',
        fees: 60,
        available: true,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc3',
        name: 'Dr. Sarah Patel',
        image: doc3,
        speciality: 'Dermatologist',
        degree: 'MBBS, DVD',
        experience: '5 Years',
        about: 'Dr. Sarah Patel provides personalized dermatological care for acne, eczema, psoriasis, hair restoration, and diagnostic skin allergy evaluations.',
        fees: 45,
        available: true,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc4',
        name: 'Dr. Christopher Lee',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS, DCH',
        experience: '6 Years',
        about: 'Dr. Christopher Lee provides compassionate care for infants and children, milestone evaluations, nutrition plans, and vaccination management.',
        fees: 40,
        available: true,
        address: {
            line1: '47th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc5',
        name: 'Dr. Jennifer Garcia',
        image: doc5,
        speciality: 'Neurologist',
        degree: 'MBBS, DM',
        experience: '7 Years',
        about: 'Dr. Jennifer Garcia focuses on clinical neuro-diagnostics, chronic migraines, sleep medicine, neuropathy, and multidisciplinary spine health therapies.',
        fees: 80,
        available: true,
        address: {
            line1: '57th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc6',
        name: 'Dr. Andrew Williams',
        image: doc6,
        speciality: 'Gastroenterologist',
        degree: 'MBBS, MD',
        experience: '6 Years',
        about: 'Dr. Andrew Williams specializes in digestive tract health, acid reflux treatment, liver screenings, and evidence-based dietary gastro-rehabilitation.',
        fees: 70,
        available: true,
        address: {
            line1: '67th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc7',
        name: 'Dr. Christopher Davis',
        image: doc7,
        speciality: 'General physician',
        degree: 'MBBS, FACP',
        experience: '6 Years',
        about: 'Dr. Christopher Davis offers thorough diagnostic checkups, hypertension control, seasonal viral care, and long-term preventative health planning.',
        fees: 50,
        available: true,
        address: {
            line1: '14th Avenue, Richmond Hill',
            line2: 'Central Plaza, London'
        }
    },
    {
        _id: 'doc8',
        name: 'Dr. Timothy White',
        image: doc8,
        speciality: 'Gynecologist',
        degree: 'MBBS, MS',
        experience: '7 Years',
        about: 'Dr. Timothy White delivers expert obstetrical guidance, reproductive endocrinology counseling, and preventative maternal screenings.',
        fees: 70,
        available: true,
        address: {
            line1: '55 Harley Street',
            line2: 'Women’s Wellness Wing, London'
        }
    },
    {
        _id: 'doc9',
        name: 'Dr. Ava Mitchell',
        image: doc9,
        speciality: 'Dermatologist',
        degree: 'MBBS, MD',
        experience: '5 Years',
        about: 'Dr. Ava Mitchell combines clinical dermatology with restorative skincare regimens, cosmetic mole removal, and allergy testing.',
        fees: 45,
        available: true,
        address: {
            line1: '32 St John’s Wood High St',
            line2: 'Dermal Care Pavilion, London'
        }
    },
    {
        _id: 'doc10',
        name: 'Dr. Jeffrey King',
        image: doc10,
        speciality: 'Pediatricians',
        degree: 'MBBS, MD',
        experience: '5 Years',
        about: 'Dr. Jeffrey King is loved by children and parents for his gentle manner, pediatric wellness checkups, allergy guidance, and emergency triage.',
        fees: 45,
        available: true,
        address: {
            line1: '12 Camden High Street',
            line2: 'Children’s Health Hub, London'
        }
    },
    {
        _id: 'doc11',
        name: 'Dr. Zoe Kelly',
        image: doc11,
        speciality: 'Neurologist',
        degree: 'MBBS, DM',
        experience: '8 Years',
        about: 'Dr. Zoe Kelly specializes in complex neurological evaluations, headache treatments, post-stroke recovery, and neuro-muscular conditions.',
        fees: 90,
        available: true,
        address: {
            line1: '14 Bloomsbury Square',
            line2: 'Brain & Spine Institute, London'
        }
    },
    {
        _id: 'doc12',
        name: 'Dr. Patrick Harris',
        image: doc12,
        speciality: 'Neurologist',
        degree: 'MBBS, MD',
        experience: '9 Years',
        about: 'Dr. Patrick Harris provides specialized evaluation for cognitive disorders, peripheral neuropathy, movement disorders, and vestibular balance care.',
        fees: 85,
        available: true,
        address: {
            line1: '60 Queen Square',
            line2: 'Neuroscience Center, London'
        }
    },
    {
        _id: 'doc13',
        name: 'Dr. Chloe Evans',
        image: doc13,
        speciality: 'General physician',
        degree: 'MBBS, MRCGP',
        experience: '5 Years',
        about: 'Dr. Chloe Evans is a trusted primary care doctor focusing on family health, preventative screenings, diabetic management, and lifestyle medicine.',
        fees: 55,
        available: true,
        address: {
            line1: '88 Baker Street',
            line2: 'Marylebone Medical Suites, London'
        }
    },
    {
        _id: 'doc14',
        name: 'Dr. Ryan Martinez',
        image: doc14,
        speciality: 'Gynecologist',
        degree: 'MBBS, DGO',
        experience: '4 Years',
        about: 'Dr. Ryan Martinez provides patient-friendly gynecological exams, prenatal milestone monitoring, and post-delivery maternal well-being support.',
        fees: 60,
        available: true,
        address: {
            line1: '40 Westbourne Grove',
            line2: 'Notting Hill Clinic, London'
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Amelia Hill',
        image: doc15,
        speciality: 'Dermatologist',
        degree: 'MBBS, DVD',
        experience: '6 Years',
        about: 'Dr. Amelia Hill specializes in pediatric and adult dermatology, sun damage correction, eczema therapies, and therapeutic skincare guidance.',
        fees: 50,
        available: true,
        address: {
            line1: '18 Chelsea Square',
            line2: 'King’s Road Medical Centre, London'
        }
    },
    {
        _id: 'doc16',
        name: 'Dr. Boston Scott',
        image: doc1,
        speciality: 'Gastroenterologist',
        degree: 'MBBS, DM',
        experience: '7 Years',
        about: 'Dr. Boston Scott delivers advanced gastroenterological care, inflammatory bowel disease management, diagnostic endoscopies, and liver care.',
        fees: 75,
        available: true,
        address: {
            line1: '25 Devonshire Place',
            line2: 'Digestive Health Clinic, London'
        }
    },
    {
        _id: 'doc17',
        name: 'Dr. Marcus Vance',
        image: doc7,
        speciality: 'General physician',
        degree: 'MBBS, MD',
        experience: '8 Years',
        about: 'Dr. Marcus Vance focuses on executive health checkups, chronic respiratory disease oversight, and integrated preventative wellness routines.',
        fees: 65,
        available: true,
        address: {
            line1: '22 Kensington High St',
            line2: 'Suite 401, London'
        }
    },
    {
        _id: 'doc18',
        name: 'Dr. Elena Rostova',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS, MRCOG',
        experience: '9 Years',
        about: 'Dr. Elena Rostova is a senior consultant in reproductive endocrinology, advanced obstetric diagnostics, and minimally invasive treatments.',
        fees: 85,
        available: true,
        address: {
            line1: '10 Queensway',
            line2: 'Regent Medical Park, London'
        }
    },
    {
        _id: 'doc19',
        name: 'Dr. Lucas Gray',
        image: doc8,
        speciality: 'Dermatologist',
        degree: 'MBBS, FAAD',
        experience: '10 Years',
        about: 'Dr. Lucas Gray has over a decade of clinical experience in advanced dermatological laser surgery, chronic psoriasis therapy, and mole evaluations.',
        fees: 75,
        available: true,
        address: {
            line1: '71 Victoria Street',
            line2: 'Westminster Skin Clinic, London'
        }
    },
    {
        _id: 'doc20',
        name: 'Dr. Maya Lin',
        image: doc4,
        speciality: 'Pediatricians',
        degree: 'MBBS, MRCPCH',
        experience: '6 Years',
        about: 'Dr. Maya Lin provides attentive pediatric consultations, childhood asthma monitoring, developmental assessments, and immunization schedules.',
        fees: 50,
        available: true,
        address: {
            line1: '95 Hampstead Way',
            line2: 'Family & Child Health Center, London'
        }
    },
    {
        _id: 'doc21',
        name: 'Dr. Hannah Abbott',
        image: doc6,
        speciality: 'Gastroenterologist',
        degree: 'MBBS, MD',
        experience: '5 Years',
        about: 'Dr. Hannah Abbott treats acid reflux, GERD, functional bowel disorders, and food sensitivities with personalized integrative care.',
        fees: 65,
        available: true,
        address: {
            line1: '103 Wimpole Street',
            line2: 'London Gastro Suite, London'
        }
    }
]