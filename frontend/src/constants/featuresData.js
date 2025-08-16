// src/constants/featuresData.js
import React from 'react';
import { Camera, Headset, Mic, Image as ImageIcon, Bell, Book, Users } from 'lucide-react';

export const featuresData = [
    { icon: <Camera className="w-8 h-8" />, title: "Live Recognition (via Wearable Glasses)", description: "Wear ECHO’s AI-powered glasses to instantly recognize the people around you. In real time, the glasses display and speak names like “This is your mom” or “This is your friend John”, giving Alzheimer’s patients clarity and confidence in social interactions." },
    { icon: <Headset className="w-8 h-8" />, title: "Listen to ECHO", description: "Hear live recognition through voice — when ECHO identifies someone, it can speak their name aloud. Patients can also listen to saved speeches, moments, and reminders, making memory recall an interactive and reassuring experience." },
    { icon: <Mic className="w-8 h-8" />, title: "Add Speech", description: "Simply speak, and ECHO will capture and save your words with a title for later recall. No typing needed — just talk naturally to store names, thoughts, or reminders that can be replayed anytime." },
    { icon: <ImageIcon className="w-8 h-8" />, title: "Add Moments", description: "Upload photos and videos, then add details like a title, the people in them, date, time, and related memories. This creates rich, personalized memory anchors that help patients recognize faces and recall special events." },
    { icon: <Bell className="w-8 h-8" />, title: "Add Reminders", description: "Set reminders for important events like doctor’s appointments, medication times, or family visits. ECHO notifies the patient and caregiver at the right moment, ensuring nothing important is missed." },
    { icon: <Book className="w-8 h-8" />, title: "Memory Journal", description: "A beautifully organized space where all memories come together — speeches, moments, and personal write-ups. Patients and caregivers can browse, filter, and revisit every stored memory in one place." },
    { icon: <Users className="w-8 h-8" />, title: "Caregiver Section", description: "A dedicated dashboard for caregivers to monitor the patient’s activity, view newly added memories, and receive instant alerts when the patient needs assistance or interacts with ECHO." }
];
