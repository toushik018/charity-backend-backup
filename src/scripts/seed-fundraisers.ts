import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Fundraiser } from '../app/modules/fundraiser/fundraiser.model';

dotenv.config();

// User IDs from your database
const USER_IDS = [
  '692f1cec1dea179d76a8a65c', // Sabbir Mohammad Sami
  '692f1d281dea179d76a8a66a', // Amar Thought
  '692f1d451dea179d76a8a66e', // Private Compass
  '692f1d9a1dea179d76a8a672', // Asia sms
];

const getRandomUser = () =>
  USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
const getRandomAmount = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Fundraiser data by category
const fundraiserData = {
  medical: [
    {
      title: "Support Brandon Buckingham's Medical Recovery",
      location: 'Stephenville, TX',
      coverImage:
        'https://images.gofundme.com/BabkX3ANt1wJtjooY73RwjlOI_I=/720x405/https://d2g8igdw686xgo.cloudfront.net/96987861_1763840447947723_r.png',
      goalAmount: 75000,
      currentAmount: 271683,
      description:
        '<p>Brandon is fighting for his life after a severe medical emergency. Your support will help cover his medical bills and recovery expenses.</p>',
    },
    {
      title: "Support Jacki while she kicks Cancer's Butt",
      location: 'Lawrence, KS',
      coverImage:
        'https://images.gofundme.com/aUrMwTZ-N4EQEOET1cda-m0SxRQ=/720x405/https://d2g8igdw686xgo.cloudfront.net/96739227_1763770238983128_r.jpg',
      goalAmount: 130000,
      currentAmount: 101895,
      description:
        '<p>Jacki has been diagnosed with cancer and needs your help to fight this battle. Every donation brings her closer to recovery.</p>',
    },
    {
      title: 'Help Kiranmai Recover from Severe Brain Injuries',
      location: 'Denton, TX',
      coverImage:
        'https://images.gofundme.com/0NQql6BHF0hPKEypvD__oxGk3Bg=/720x405/https://d2g8igdw686xgo.cloudfront.net/96788587_1763680993598427_r.png',
      goalAmount: 100000,
      currentAmount: 20151,
      description:
        '<p>Kiranmai suffered severe brain injuries and needs extensive medical care. Please help us support her recovery journey.</p>',
    },
    {
      title: "Donate to James Matula's Healing and Hope",
      location: 'Green Brook, NJ',
      coverImage:
        'https://images.gofundme.com/no27w0ykBii0eFWa2DZD0fpEl_A=/720x405/https://d2g8igdw686xgo.cloudfront.net/96888347_1763757213592460_r.png',
      goalAmount: 25000,
      currentAmount: 49542,
      description:
        '<p>James is on a journey to healing and needs your support. Your donation will help cover medical expenses and provide hope.</p>',
    },
    {
      title: "Donate to Ethan Gasteyer's Journey to Health",
      location: 'Wilbraham, MA',
      coverImage:
        'https://images.gofundme.com/E10wOIpZg3Wx_D8Jc4xxDGLhq_4=/720x405/https://d2g8igdw686xgo.cloudfront.net/96867009_1763768885247177_r.png',
      goalAmount: 110000,
      currentAmount: 85522,
      description:
        '<p>Ethan is battling a serious illness and needs your help. Every contribution makes a difference in his journey to health.</p>',
    },
    {
      title: 'Support for Steve Armstrong & Kamala Masters',
      location: 'Kula, HI',
      coverImage:
        'https://images.gofundme.com/VLq40ZpAvUFIfOXr4Hj-4gONkEE=/720x405/https://d2g8igdw686xgo.cloudfront.net/96594103_1763477228891234_r.png',
      goalAmount: 150000,
      currentAmount: 181834,
      description:
        '<p>Steve and Kamala need your support during this difficult time. Your generosity will help them through their medical challenges.</p>',
    },
    {
      title: "Support Miley's Fight Against Retinoblastoma",
      location: 'Massillon, OH',
      coverImage:
        'https://images.gofundme.com/g8DehSiNMLMX-1Dl2EQRNqiTANA=/720x405/https://d2g8igdw686xgo.cloudfront.net/96445787_1762719446333281_r.png',
      goalAmount: 50000,
      currentAmount: 42219,
      description:
        '<p>Little Miley is fighting retinoblastoma, a rare eye cancer. Help us support her treatment and give her a chance at a healthy future.</p>',
    },
    {
      title: 'Stand with Adan: Aid His Recovery',
      location: 'Aptos, CA',
      coverImage:
        'https://images.gofundme.com/dFEQ21NaYrD9wMFCWJu5YFqypQc=/720x405/https://d2g8igdw686xgo.cloudfront.net/96875223_1763750089977138_r.png',
      goalAmount: 35000,
      currentAmount: 24701,
      description:
        '<p>Adan needs your support to recover from his medical condition. Your donation will help cover his treatment and rehabilitation.</p>',
    },
    {
      title: "Support Bernie Kosar's Medical Battle & Road to Recovery",
      location: 'Cleveland, OH',
      coverImage:
        'https://images.gofundme.com/3vLvQkAHrxq6awWJn6cQuhhfCcQ=/720x405/https://d2g8igdw686xgo.cloudfront.net/96572193_1763070941863962_r.png',
      goalAmount: 300000,
      currentAmount: 149860,
      description:
        '<p>Bernie Kosar, former NFL quarterback, is facing a serious medical battle. Help support his road to recovery.</p>',
    },
    {
      title: 'Help Dale Bozzio Heal and Rock Again',
      location: 'Los Angeles, CA',
      coverImage:
        'https://images.gofundme.com/LXyyZr0rboTDtqkLvSWLGwf9M8A=/720x405/https://d2g8igdw686xgo.cloudfront.net/96613975_1763192698424954_r.png',
      goalAmount: 45000,
      currentAmount: 34857,
      description:
        '<p>Dale Bozzio needs your help to heal and get back to doing what she loves - making music. Support her recovery journey.</p>',
    },
    {
      title: 'Support for Matt Wiegers and Family',
      location: 'Lake Orion, MI',
      coverImage:
        'https://images.gofundme.com/EqE8EJn3dmsthBa0KLLlUpvP9Ts=/720x405/https://d2g8igdw686xgo.cloudfront.net/96917047_1763779999364312_r.png',
      goalAmount: 200000,
      currentAmount: 54624,
      description:
        '<p>Matt and his family are facing a medical crisis. Your support will help them through this challenging time.</p>',
    },
    {
      title: 'Give Lydia the Miracle She Deserves!',
      location: 'Madison, WI',
      coverImage:
        'https://images.gofundme.com/oqRZIrbBB941iZrkxE3hWNudniE=/720x405/https://d2g8igdw686xgo.cloudfront.net/94734747_1762693598709710_r.jpg',
      goalAmount: 127000,
      currentAmount: 56200,
      description:
        '<p>Lydia is fighting for her life and needs a miracle. Your donation can help make that miracle happen.</p>',
    },
    {
      title: "Support Emily's Fight Against Guillain-Barre Syndrome",
      location: 'Tuscaloosa, AL',
      coverImage:
        'https://images.gofundme.com/OkTO2PiDceM0_bNMq1bMfLaIPtA=/720x405/https://d2g8igdw686xgo.cloudfront.net/96661877_1763350841464254_r.JPEG',
      goalAmount: 90000,
      currentAmount: 86324,
      description:
        '<p>Emily is battling Guillain-Barre Syndrome and needs your support. Help her fight this rare neurological disorder.</p>',
    },
    {
      title: 'Help Support the Cole Family',
      location: 'Kohler, WI',
      coverImage:
        'https://images.gofundme.com/PrxG0XZuC2IYR77rvhybUk-dIZE=/720x405/https://d2g8igdw686xgo.cloudfront.net/96802927_1763943161545335_r.png',
      goalAmount: 60000,
      currentAmount: 39037,
      description:
        '<p>The Cole family is facing a medical emergency and needs your help. Your generosity will make a difference.</p>',
    },
    {
      title: "Support Urgent Medical Care for Michael's Family",
      location: 'Berrien Springs, MI',
      coverImage:
        'https://images.gofundme.com/ULfGMUCSEV-X4XTRPlpagZOv25A=/720x405/https://d2g8igdw686xgo.cloudfront.net/96753817_1763616916497918_r.png',
      goalAmount: 30000,
      currentAmount: 27906,
      description:
        "<p>Michael's family urgently needs medical care. Your donation will help them access the treatment they need.</p>",
    },
  ],
  education: [
    {
      title: 'Help Students Access Quality Education',
      location: 'New York, NY',
      coverImage:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 32500,
      description:
        '<p>Help underprivileged students access quality education. Your donation provides books, supplies, and tuition assistance.</p>',
    },
    {
      title: 'Build a School Library in Rural Area',
      location: 'Austin, TX',
      coverImage:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 18750,
      description:
        '<p>Help us build a library for children in rural areas who have limited access to books and educational resources.</p>',
    },
    {
      title: 'STEM Education for Girls Initiative',
      location: 'San Francisco, CA',
      coverImage:
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=720&h=405&fit=crop',
      goalAmount: 75000,
      currentAmount: 45000,
      description:
        '<p>Empower girls through STEM education. Your support helps provide coding classes, robotics kits, and mentorship programs.</p>',
    },
    {
      title: 'College Scholarship Fund for First-Gen Students',
      location: 'Chicago, IL',
      coverImage:
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=720&h=405&fit=crop',
      goalAmount: 100000,
      currentAmount: 67000,
      description:
        '<p>Help first-generation college students achieve their dreams. Your donation provides scholarships and support services.</p>',
    },
    {
      title: 'Technology for Classrooms Project',
      location: 'Seattle, WA',
      coverImage:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Bring modern technology to underfunded classrooms. Help us provide computers, tablets, and internet access.</p>',
    },
    {
      title: 'Special Education Resources Fund',
      location: 'Boston, MA',
      coverImage:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=720&h=405&fit=crop',
      goalAmount: 60000,
      currentAmount: 42000,
      description:
        '<p>Support children with special needs by funding specialized educational resources and trained staff.</p>',
    },
    {
      title: 'Music Education Program for Youth',
      location: 'Nashville, TN',
      coverImage:
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=720&h=405&fit=crop',
      goalAmount: 35000,
      currentAmount: 21000,
      description:
        '<p>Give children the gift of music education. Your donation provides instruments, lessons, and performance opportunities.</p>',
    },
    {
      title: 'Adult Literacy Program',
      location: 'Phoenix, AZ',
      coverImage:
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=720&h=405&fit=crop',
      goalAmount: 30000,
      currentAmount: 19500,
      description:
        '<p>Help adults learn to read and write. Your support provides tutoring, materials, and a path to better opportunities.</p>',
    },
    {
      title: 'After-School Tutoring Center',
      location: 'Miami, FL',
      coverImage:
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=720&h=405&fit=crop',
      goalAmount: 45000,
      currentAmount: 31500,
      description:
        '<p>Support our after-school tutoring center that helps struggling students catch up and excel academically.</p>',
    },
    {
      title: 'International Student Support Fund',
      location: 'Los Angeles, CA',
      coverImage:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=720&h=405&fit=crop',
      goalAmount: 80000,
      currentAmount: 52000,
      description:
        '<p>Help international students pursue their education dreams in the US. Your donation covers tuition and living expenses.</p>',
    },
    {
      title: 'Early Childhood Education Initiative',
      location: 'Denver, CO',
      coverImage:
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=720&h=405&fit=crop',
      goalAmount: 55000,
      currentAmount: 38500,
      description:
        '<p>Give young children a strong educational foundation. Support our early childhood education programs.</p>',
    },
    {
      title: 'Vocational Training for Youth',
      location: 'Detroit, MI',
      coverImage:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebb6122?w=720&h=405&fit=crop',
      goalAmount: 65000,
      currentAmount: 45500,
      description:
        '<p>Help young people learn valuable trade skills. Your donation funds vocational training and job placement.</p>',
    },
  ],
  emergency: [
    {
      title: 'Hurricane Relief Fund - Help Families Rebuild',
      location: 'Houston, TX',
      coverImage:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=720&h=405&fit=crop',
      goalAmount: 200000,
      currentAmount: 156000,
      description:
        '<p>Help families devastated by the hurricane rebuild their homes and lives. Every donation makes a difference.</p>',
    },
    {
      title: 'Wildfire Victims Emergency Support',
      location: 'Sacramento, CA',
      coverImage:
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=720&h=405&fit=crop',
      goalAmount: 150000,
      currentAmount: 98000,
      description:
        '<p>Support families who lost everything in the wildfires. Your donation provides shelter, food, and essential supplies.</p>',
    },
    {
      title: 'Flood Relief - Immediate Assistance Needed',
      location: 'New Orleans, LA',
      coverImage:
        'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=720&h=405&fit=crop',
      goalAmount: 100000,
      currentAmount: 72000,
      description:
        '<p>Families are stranded and need immediate help after severe flooding. Your support provides rescue and relief.</p>',
    },
    {
      title: 'Earthquake Emergency Response Fund',
      location: 'San Jose, CA',
      coverImage:
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=720&h=405&fit=crop',
      goalAmount: 250000,
      currentAmount: 175000,
      description:
        '<p>Help earthquake victims receive emergency medical care, shelter, and supplies. Every second counts.</p>',
    },
    {
      title: 'Tornado Disaster Relief',
      location: 'Oklahoma City, OK',
      coverImage:
        'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=720&h=405&fit=crop',
      goalAmount: 120000,
      currentAmount: 84000,
      description:
        '<p>Tornadoes have destroyed homes and businesses. Help affected families get back on their feet.</p>',
    },
    {
      title: 'House Fire Emergency Fund',
      location: 'Portland, OR',
      coverImage:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 35000,
      description:
        '<p>A family lost everything in a house fire. Help them find temporary housing and replace essentials.</p>',
    },
    {
      title: 'Winter Storm Emergency Assistance',
      location: 'Minneapolis, MN',
      coverImage:
        'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=720&h=405&fit=crop',
      goalAmount: 75000,
      currentAmount: 52500,
      description:
        '<p>Severe winter storms have left families without heat and power. Help provide emergency assistance.</p>',
    },
    {
      title: 'Community Emergency Response Team Fund',
      location: 'Atlanta, GA',
      coverImage:
        'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Support our community emergency response team with equipment and training to save lives.</p>',
    },
    {
      title: 'Displaced Family Emergency Housing',
      location: 'Dallas, TX',
      coverImage:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=720&h=405&fit=crop',
      goalAmount: 60000,
      currentAmount: 42000,
      description:
        '<p>Help displaced families find emergency housing after losing their homes to disaster.</p>',
    },
    {
      title: 'Emergency Food Bank Support',
      location: 'Philadelphia, PA',
      coverImage:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=720&h=405&fit=crop',
      goalAmount: 35000,
      currentAmount: 24500,
      description:
        '<p>Our food bank is running low on supplies. Help us feed families in crisis.</p>',
    },
    {
      title: 'Accident Victim Emergency Fund',
      location: 'San Diego, CA',
      coverImage:
        'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=720&h=405&fit=crop',
      goalAmount: 80000,
      currentAmount: 56000,
      description:
        '<p>Help accident victims cover emergency medical expenses and recovery costs.</p>',
    },
    {
      title: 'Natural Disaster Pet Rescue',
      location: 'Tampa, FL',
      coverImage:
        'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Help rescue and care for pets displaced by natural disasters. Your donation saves animal lives.</p>',
    },
  ],
  animals: [
    {
      title: 'Save the Local Animal Shelter',
      location: 'Portland, OR',
      coverImage:
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=720&h=405&fit=crop',
      goalAmount: 75000,
      currentAmount: 52500,
      description:
        '<p>Our local animal shelter is at risk of closing. Help us save hundreds of animals and keep the shelter running.</p>',
    },
    {
      title: 'Wildlife Rehabilitation Center',
      location: 'Denver, CO',
      coverImage:
        'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=720&h=405&fit=crop',
      goalAmount: 100000,
      currentAmount: 70000,
      description:
        '<p>Support our wildlife rehabilitation center that rescues and rehabilitates injured wild animals.</p>',
    },
    {
      title: 'Stray Cat Rescue and Adoption Program',
      location: 'Brooklyn, NY',
      coverImage:
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=720&h=405&fit=crop',
      goalAmount: 30000,
      currentAmount: 21000,
      description:
        '<p>Help us rescue, spay/neuter, and find homes for stray cats in our community.</p>',
    },
    {
      title: 'Senior Dog Sanctuary',
      location: 'Austin, TX',
      coverImage:
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 35000,
      description:
        '<p>Give senior dogs a loving home in their golden years. Your donation provides care and comfort.</p>',
    },
    {
      title: 'Horse Rescue and Rehabilitation',
      location: 'Lexington, KY',
      coverImage:
        'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=720&h=405&fit=crop',
      goalAmount: 80000,
      currentAmount: 56000,
      description:
        '<p>Help rescue abused and neglected horses. Your support provides veterinary care and rehabilitation.</p>',
    },
    {
      title: 'Marine Animal Conservation',
      location: 'San Diego, CA',
      coverImage:
        'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=720&h=405&fit=crop',
      goalAmount: 120000,
      currentAmount: 84000,
      description:
        '<p>Protect marine animals and their habitats. Your donation funds research and conservation efforts.</p>',
    },
    {
      title: 'Puppy Mill Rescue Operation',
      location: 'Columbus, OH',
      coverImage:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=720&h=405&fit=crop',
      goalAmount: 45000,
      currentAmount: 31500,
      description:
        '<p>Help rescue dogs from puppy mills and give them a chance at a better life.</p>',
    },
    {
      title: 'Exotic Bird Sanctuary',
      location: 'Miami, FL',
      coverImage:
        'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=720&h=405&fit=crop',
      goalAmount: 35000,
      currentAmount: 24500,
      description:
        '<p>Support our sanctuary that provides a forever home for exotic birds that can no longer be cared for.</p>',
    },
    {
      title: 'Farm Animal Rescue',
      location: 'Lancaster, PA',
      coverImage:
        'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=720&h=405&fit=crop',
      goalAmount: 60000,
      currentAmount: 42000,
      description:
        '<p>Help rescue farm animals from neglect and abuse. Your donation provides food, shelter, and medical care.</p>',
    },
    {
      title: 'Endangered Species Protection Fund',
      location: 'Washington, DC',
      coverImage:
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=720&h=405&fit=crop',
      goalAmount: 150000,
      currentAmount: 105000,
      description:
        '<p>Protect endangered species from extinction. Your support funds conservation and anti-poaching efforts.</p>',
    },
    {
      title: 'Community Spay/Neuter Program',
      location: 'Phoenix, AZ',
      coverImage:
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Help control pet overpopulation through our community spay/neuter program.</p>',
    },
    {
      title: 'Therapy Animal Training Program',
      location: 'Seattle, WA',
      coverImage:
        'https://images.unsplash.com/photo-1587559070757-f72a388edbba?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Train therapy animals to bring comfort and healing to those in need.</p>',
    },
  ],
  community: [
    {
      title: 'Build a Community Garden',
      location: 'Chicago, IL',
      coverImage:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Help us build a community garden that will provide fresh produce and bring neighbors together.</p>',
    },
    {
      title: 'Youth Sports League Equipment Fund',
      location: 'Atlanta, GA',
      coverImage:
        'https://images.unsplash.com/photo-1461896836934- voices-of-youth?w=720&h=405&fit=crop',
      goalAmount: 15000,
      currentAmount: 10500,
      description:
        '<p>Provide sports equipment for underprivileged youth in our community league.</p>',
    },
    {
      title: 'Community Center Renovation',
      location: 'Detroit, MI',
      coverImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=720&h=405&fit=crop',
      goalAmount: 100000,
      currentAmount: 70000,
      description:
        '<p>Help renovate our aging community center to better serve local families and programs.</p>',
    },
    {
      title: 'Neighborhood Watch Program',
      location: 'Baltimore, MD',
      coverImage:
        'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=720&h=405&fit=crop',
      goalAmount: 10000,
      currentAmount: 7000,
      description:
        '<p>Support our neighborhood watch program to keep our community safe.</p>',
    },
    {
      title: 'Free Community Meals Program',
      location: 'San Antonio, TX',
      coverImage:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=720&h=405&fit=crop',
      goalAmount: 30000,
      currentAmount: 21000,
      description:
        '<p>Provide free meals to community members in need. Your donation feeds families.</p>',
    },
    {
      title: 'Public Park Improvement Project',
      location: 'Minneapolis, MN',
      coverImage:
        'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 35000,
      description:
        '<p>Help improve our local park with new playground equipment, benches, and landscaping.</p>',
    },
    {
      title: 'Senior Citizens Activity Center',
      location: 'Phoenix, AZ',
      coverImage:
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Create a vibrant activity center for senior citizens to socialize and stay active.</p>',
    },
    {
      title: 'Community Art Mural Project',
      location: 'Los Angeles, CA',
      coverImage:
        'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=720&h=405&fit=crop',
      goalAmount: 20000,
      currentAmount: 14000,
      description:
        '<p>Beautify our neighborhood with community art murals created by local artists.</p>',
    },
    {
      title: 'Homeless Shelter Support',
      location: 'New York, NY',
      coverImage:
        'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=720&h=405&fit=crop',
      goalAmount: 75000,
      currentAmount: 52500,
      description:
        '<p>Support our local homeless shelter with beds, meals, and essential services.</p>',
    },
    {
      title: 'Community Library Expansion',
      location: 'Boston, MA',
      coverImage:
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=720&h=405&fit=crop',
      goalAmount: 60000,
      currentAmount: 42000,
      description:
        '<p>Help expand our community library to serve more readers and offer more programs.</p>',
    },
    {
      title: 'Youth Mentorship Program',
      location: 'Philadelphia, PA',
      coverImage:
        'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=720&h=405&fit=crop',
      goalAmount: 35000,
      currentAmount: 24500,
      description:
        '<p>Connect at-risk youth with positive mentors who can guide them toward success.</p>',
    },
    {
      title: 'Community WiFi Initiative',
      location: 'Cleveland, OH',
      coverImage:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=720&h=405&fit=crop',
      goalAmount: 45000,
      currentAmount: 31500,
      description:
        '<p>Bring free WiFi to underserved areas of our community to bridge the digital divide.</p>',
    },
  ],
  environment: [
    {
      title: 'Plant 10,000 Trees Initiative',
      location: 'Portland, OR',
      coverImage:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 35000,
      description:
        '<p>Help us plant 10,000 trees to combat climate change and create green spaces in our community.</p>',
    },
    {
      title: 'Ocean Cleanup Project',
      location: 'San Francisco, CA',
      coverImage:
        'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=720&h=405&fit=crop',
      goalAmount: 100000,
      currentAmount: 70000,
      description:
        '<p>Join our effort to remove plastic and debris from our oceans and protect marine life.</p>',
    },
    {
      title: 'Community Solar Panel Installation',
      location: 'Austin, TX',
      coverImage:
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=720&h=405&fit=crop',
      goalAmount: 150000,
      currentAmount: 105000,
      description:
        '<p>Help install solar panels on community buildings to reduce carbon footprint and energy costs.</p>',
    },
    {
      title: 'River Restoration Project',
      location: 'Denver, CO',
      coverImage:
        'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=720&h=405&fit=crop',
      goalAmount: 80000,
      currentAmount: 56000,
      description:
        '<p>Restore our local river ecosystem by removing pollutants and planting native vegetation.</p>',
    },
    {
      title: 'Sustainable Farming Education',
      location: 'Madison, WI',
      coverImage:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Teach sustainable farming practices to local farmers and community members.</p>',
    },
    {
      title: 'Wildlife Corridor Creation',
      location: 'Seattle, WA',
      coverImage:
        'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=720&h=405&fit=crop',
      goalAmount: 120000,
      currentAmount: 84000,
      description:
        '<p>Create wildlife corridors to help animals safely move between habitats.</p>',
    },
    {
      title: 'Zero Waste Community Program',
      location: 'San Diego, CA',
      coverImage:
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=720&h=405&fit=crop',
      goalAmount: 35000,
      currentAmount: 24500,
      description:
        '<p>Help our community achieve zero waste through education and recycling programs.</p>',
    },
    {
      title: 'Wetland Conservation Project',
      location: 'New Orleans, LA',
      coverImage:
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=720&h=405&fit=crop',
      goalAmount: 90000,
      currentAmount: 63000,
      description:
        '<p>Protect and restore vital wetland ecosystems that provide flood protection and wildlife habitat.</p>',
    },
    {
      title: 'Electric Vehicle Charging Stations',
      location: 'Los Angeles, CA',
      coverImage:
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=720&h=405&fit=crop',
      goalAmount: 75000,
      currentAmount: 52500,
      description:
        '<p>Install electric vehicle charging stations throughout our community to promote clean transportation.</p>',
    },
    {
      title: 'Bee Conservation Initiative',
      location: 'Minneapolis, MN',
      coverImage:
        'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Save the bees! Help us create bee-friendly habitats and educate the community about pollinators.</p>',
    },
    {
      title: 'Urban Green Space Development',
      location: 'Chicago, IL',
      coverImage:
        'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=720&h=405&fit=crop',
      goalAmount: 60000,
      currentAmount: 42000,
      description:
        '<p>Transform vacant lots into beautiful urban green spaces for community enjoyment.</p>',
    },
    {
      title: 'Clean Air Initiative',
      location: 'Houston, TX',
      coverImage:
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=720&h=405&fit=crop',
      goalAmount: 55000,
      currentAmount: 38500,
      description:
        '<p>Monitor and improve air quality in our community through advocacy and action.</p>',
    },
  ],
  sports: [
    {
      title: 'Youth Basketball League Equipment',
      location: 'Chicago, IL',
      coverImage:
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=720&h=405&fit=crop',
      goalAmount: 20000,
      currentAmount: 14000,
      description:
        '<p>Provide basketball equipment and uniforms for underprivileged youth in our community league.</p>',
    },
    {
      title: 'Community Soccer Field Renovation',
      location: 'Dallas, TX',
      coverImage:
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=720&h=405&fit=crop',
      goalAmount: 75000,
      currentAmount: 52500,
      description:
        '<p>Renovate our community soccer field to provide a safe and quality playing surface.</p>',
    },
    {
      title: 'Adaptive Sports Program',
      location: 'Denver, CO',
      coverImage:
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 35000,
      description:
        '<p>Support adaptive sports programs for athletes with disabilities.</p>',
    },
    {
      title: 'Girls Softball Team Sponsorship',
      location: 'Atlanta, GA',
      coverImage:
        'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=720&h=405&fit=crop',
      goalAmount: 15000,
      currentAmount: 10500,
      description:
        '<p>Help sponsor our girls softball team to compete in regional tournaments.</p>',
    },
    {
      title: 'Swimming Pool for Community Center',
      location: 'Phoenix, AZ',
      coverImage:
        'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=720&h=405&fit=crop',
      goalAmount: 200000,
      currentAmount: 140000,
      description:
        '<p>Build a swimming pool at our community center to teach water safety and provide recreation.</p>',
    },
    {
      title: 'Youth Hockey Equipment Drive',
      location: 'Minneapolis, MN',
      coverImage:
        'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=720&h=405&fit=crop',
      goalAmount: 30000,
      currentAmount: 21000,
      description:
        '<p>Provide hockey equipment to young players who cannot afford the high costs of the sport.</p>',
    },
    {
      title: 'Track and Field Program',
      location: 'Los Angeles, CA',
      coverImage:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Support our track and field program that helps young athletes reach their potential.</p>',
    },
    {
      title: 'Tennis Court Construction',
      location: 'Miami, FL',
      coverImage:
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=720&h=405&fit=crop',
      goalAmount: 100000,
      currentAmount: 70000,
      description:
        '<p>Build public tennis courts to make the sport accessible to everyone in our community.</p>',
    },
    {
      title: 'Youth Martial Arts Program',
      location: 'San Francisco, CA',
      coverImage:
        'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Teach discipline and self-defense through our youth martial arts program.</p>',
    },
    {
      title: 'Cycling Club for Kids',
      location: 'Portland, OR',
      coverImage:
        'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=720&h=405&fit=crop',
      goalAmount: 20000,
      currentAmount: 14000,
      description:
        '<p>Provide bikes and safety gear for kids to join our community cycling club.</p>',
    },
    {
      title: 'Gymnastics Equipment Fund',
      location: 'Houston, TX',
      coverImage:
        'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=720&h=405&fit=crop',
      goalAmount: 60000,
      currentAmount: 42000,
      description:
        '<p>Purchase gymnastics equipment for our community program serving young athletes.</p>',
    },
    {
      title: 'Boxing Gym for At-Risk Youth',
      location: 'Philadelphia, PA',
      coverImage:
        'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=720&h=405&fit=crop',
      goalAmount: 45000,
      currentAmount: 31500,
      description:
        '<p>Open a boxing gym to provide at-risk youth with mentorship and a positive outlet.</p>',
    },
  ],
  faith: [
    {
      title: 'Church Building Restoration',
      location: 'Nashville, TN',
      coverImage:
        'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=720&h=405&fit=crop',
      goalAmount: 150000,
      currentAmount: 105000,
      description:
        '<p>Help restore our historic church building to preserve this community landmark.</p>',
    },
    {
      title: 'Mission Trip to Guatemala',
      location: 'Dallas, TX',
      coverImage:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Support our mission trip to Guatemala where we will build homes and provide medical care.</p>',
    },
    {
      title: 'Youth Ministry Program',
      location: 'Atlanta, GA',
      coverImage:
        'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=720&h=405&fit=crop',
      goalAmount: 30000,
      currentAmount: 21000,
      description:
        '<p>Expand our youth ministry program to reach more young people in our community.</p>',
    },
    {
      title: 'Food Pantry Ministry',
      location: 'Chicago, IL',
      coverImage:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=720&h=405&fit=crop',
      goalAmount: 20000,
      currentAmount: 14000,
      description:
        '<p>Support our food pantry ministry that feeds hundreds of families each month.</p>',
    },
    {
      title: 'Interfaith Community Center',
      location: 'Los Angeles, CA',
      coverImage:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=720&h=405&fit=crop',
      goalAmount: 200000,
      currentAmount: 140000,
      description:
        '<p>Build an interfaith community center where people of all faiths can gather and serve.</p>',
    },
    {
      title: 'Worship Music Equipment',
      location: 'Houston, TX',
      coverImage:
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=720&h=405&fit=crop',
      goalAmount: 15000,
      currentAmount: 10500,
      description:
        "<p>Purchase new worship music equipment to enhance our congregation's spiritual experience.</p>",
    },
    {
      title: 'Prison Ministry Outreach',
      location: 'Phoenix, AZ',
      coverImage:
        'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=720&h=405&fit=crop',
      goalAmount: 10000,
      currentAmount: 7000,
      description:
        '<p>Support our prison ministry that brings hope and rehabilitation to incarcerated individuals.</p>',
    },
    {
      title: 'Religious Education Materials',
      location: 'Boston, MA',
      coverImage:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=720&h=405&fit=crop',
      goalAmount: 8000,
      currentAmount: 5600,
      description:
        '<p>Provide religious education materials for children and adults in our congregation.</p>',
    },
    {
      title: 'Homeless Outreach Ministry',
      location: 'San Francisco, CA',
      coverImage:
        'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Support our homeless outreach ministry that provides meals, shelter, and spiritual support.</p>',
    },
    {
      title: 'Retreat Center Development',
      location: 'Denver, CO',
      coverImage:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=720&h=405&fit=crop',
      goalAmount: 300000,
      currentAmount: 210000,
      description:
        '<p>Help develop a retreat center for spiritual renewal and community gatherings.</p>',
    },
    {
      title: 'Disaster Relief Mission',
      location: 'Miami, FL',
      coverImage:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 35000,
      description:
        '<p>Support our disaster relief mission to help communities affected by natural disasters.</p>',
    },
    {
      title: 'Community Prayer Garden',
      location: 'Seattle, WA',
      coverImage:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Create a peaceful prayer garden for meditation and spiritual reflection.</p>',
    },
  ],
  creative: [
    {
      title: 'Independent Film Production',
      location: 'Los Angeles, CA',
      coverImage:
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=720&h=405&fit=crop',
      goalAmount: 100000,
      currentAmount: 70000,
      description:
        '<p>Help fund our independent film that tells an important story about community resilience.</p>',
    },
    {
      title: 'Community Art Studio',
      location: 'Brooklyn, NY',
      coverImage:
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=720&h=405&fit=crop',
      goalAmount: 50000,
      currentAmount: 35000,
      description:
        '<p>Create a community art studio where local artists can create and teach.</p>',
    },
    {
      title: 'Music Album Recording',
      location: 'Nashville, TN',
      coverImage:
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=720&h=405&fit=crop',
      goalAmount: 25000,
      currentAmount: 17500,
      description:
        '<p>Help fund the recording of our debut album featuring original songs about hope and healing.</p>',
    },
    {
      title: 'Theater Production Fund',
      location: 'Chicago, IL',
      coverImage:
        'https://images.unsplash.com/photo-1503095396549-807759245b35?w=720&h=405&fit=crop',
      goalAmount: 40000,
      currentAmount: 28000,
      description:
        '<p>Support our community theater production that brings important stories to life on stage.</p>',
    },
    {
      title: 'Photography Exhibition',
      location: 'San Francisco, CA',
      coverImage:
        'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=720&h=405&fit=crop',
      goalAmount: 15000,
      currentAmount: 10500,
      description:
        '<p>Fund a photography exhibition showcasing the beauty and diversity of our community.</p>',
    },
    {
      title: 'Dance Company Tour',
      location: 'New York, NY',
      coverImage:
        'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=720&h=405&fit=crop',
      goalAmount: 60000,
      currentAmount: 42000,
      description:
        '<p>Help our dance company tour and share their inspiring performances with audiences nationwide.</p>',
    },
    {
      title: 'Podcast Production Equipment',
      location: 'Austin, TX',
      coverImage:
        'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=720&h=405&fit=crop',
      goalAmount: 10000,
      currentAmount: 7000,
      description:
        '<p>Purchase professional podcast equipment to share stories that matter.</p>',
    },
    {
      title: 'Sculpture Garden Installation',
      location: 'Seattle, WA',
      coverImage:
        'https://images.unsplash.com/photo-1544413660-299165566b1d?w=720&h=405&fit=crop',
      goalAmount: 75000,
      currentAmount: 52500,
      description:
        '<p>Create a public sculpture garden featuring works by local artists.</p>',
    },
    {
      title: "Children's Book Illustration",
      location: 'Portland, OR',
      coverImage:
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=720&h=405&fit=crop',
      goalAmount: 8000,
      currentAmount: 5600,
      description:
        "<p>Fund the illustration of a children's book that teaches important life lessons.</p>",
    },
    {
      title: 'Street Art Festival',
      location: 'Miami, FL',
      coverImage:
        'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=720&h=405&fit=crop',
      goalAmount: 35000,
      currentAmount: 24500,
      description:
        '<p>Organize a street art festival that transforms our neighborhood into an outdoor gallery.</p>',
    },
    {
      title: 'Documentary Film Project',
      location: 'Denver, CO',
      coverImage:
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=720&h=405&fit=crop',
      goalAmount: 45000,
      currentAmount: 31500,
      description:
        '<p>Produce a documentary film highlighting environmental conservation efforts in our region.</p>',
    },
    {
      title: 'Ceramic Arts Workshop',
      location: 'Santa Fe, NM',
      coverImage:
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=720&h=405&fit=crop',
      goalAmount: 20000,
      currentAmount: 14000,
      description:
        '<p>Establish a ceramic arts workshop to teach traditional pottery techniques.</p>',
    },
  ],
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const seedFundraisers = async () => {
  try {
    const mongoUri =
      process.env.DATABASE_URL || 'mongodb://localhost:27017/fundsus';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing fundraisers (optional - comment out if you want to keep existing data)
    // await Fundraiser.deleteMany({});
    // console.log('Cleared existing fundraisers');

    const allFundraisers: any[] = [];

    for (const [category, fundraisers] of Object.entries(fundraiserData)) {
      console.log(
        `Processing ${category} category with ${fundraisers.length} fundraisers...`
      );

      for (const fundraiser of fundraisers) {
        const ownerId = getRandomUser();
        const baseSlug = slugify(fundraiser.title);
        const uniqueSlug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        allFundraisers.push({
          owner: new mongoose.Types.ObjectId(ownerId),
          title: fundraiser.title,
          slug: uniqueSlug,
          status: 'published',
          coverImage: fundraiser.coverImage,
          gallery: [],
          goalAmount: fundraiser.goalAmount,
          currentAmount: fundraiser.currentAmount,
          currency: 'USD',
          category: category,
          story: fundraiser.description,
          description: fundraiser.description,
          location: fundraiser.location,
          country: 'United States',
          beneficiaryType: 'yourself',
          automatedGoal: false,
          donationCount: getRandomAmount(10, 500),
          publishedAt: new Date(
            Date.now() - getRandomAmount(1, 90) * 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    console.log(`Inserting ${allFundraisers.length} fundraisers...`);
    await Fundraiser.insertMany(allFundraisers);
    console.log('Successfully seeded fundraisers!');

    // Print summary
    const counts = await Fundraiser.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    console.log('\nFundraisers by category:');
    counts.forEach((c) => console.log(`  ${c._id}: ${c.count}`));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding fundraisers:', error);
    process.exit(1);
  }
};

seedFundraisers();
