"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronRight, 
  MessageSquare, 
  Star,
  Hospital,
  Clock,
  Search,
  BookOpen,
  UserCheck
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  lastVisit: string;
  totalVisits: number;
  contact: {
    email: string;
    phone: string;
  };
  rating: number;
  availability: "Available" | "In Surgery" | "Away";
  biography: string;
}

const myDoctors: Doctor[] = [
  {
    id: "DOC-001",
    name: "Dr. Anirudh Sharma",
    specialization: "Principal Cardiologist",
    hospital: "Max Super Speciality Hospital",
    lastVisit: "2024-03-15",
    totalVisits: 8,
    contact: { email: "a.sharma@maxhealthcare.com", phone: "+91 98110 55021" },
    rating: 4.9,
    availability: "Available",
    biography: "Over 20 years of experience in invasive cardiology. Led the team for your triple bypass recovery."
  },
  {
    id: "DOC-002",
    name: "Dr. Meera Iyer",
    specialization: "Senior Endocrinologist",
    hospital: "Apollo Hospitals, Chennai",
    lastVisit: "2024-02-10",
    totalVisits: 12,
    contact: { email: "meera.iyer@apollohospitals.com", phone: "+91 88700 99012" },
    rating: 4.8,
    availability: "Away",
    biography: "Specializes in diabetic management and metabolic disorders. Managing your Glycomet routine since 2022."
  },
  {
    id: "DOC-003",
    name: "Dr. Rajesh Gupta",
    specialization: "ENT Specialist",
    hospital: "Fortis Escorts",
    lastVisit: "2023-12-05",
    totalVisits: 3,
    contact: { email: "r.gupta@fortis.com", phone: "+91 91220 33441" },
    rating: 4.6,
    availability: "In Surgery",
    biography: "Expert in sinus treatments and pediatric ENT. Provided the Amoxicillin routine for your last infection."
  }
];

export default function YourDoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = myDoctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.1em] border border-indigo-100/50">Clinical Circle</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Your Medical Team
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            A directory of healthcare professionals specialized in your treatment plans across all hospitals you've visited on the MedChain network.
          </p>
        </div>

        <div className="relative group w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, clinic or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-4 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         {[
           { label: "Active Doctors", value: myDoctors.length, icon: Stethoscope, color: "indigo" },
           { label: "Total Clinical Visits", value: myDoctors.reduce((a, b) => a + b.totalVisits, 0), icon: Calendar, color: "emerald" },
           { label: "Hospitals Covered", value: new Set(myDoctors.map(d => d.hospital)).size, icon: Hospital, color: "amber" },
         ].map((stat, i) => (
           <div key={i} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shrink-0`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredDoctors.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              <div className="p-8">
                {/* Availability Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    doc.availability === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    doc.availability === 'In Surgery' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {doc.availability}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-black text-slate-700">{doc.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-white shadow-md flex items-center justify-center text-indigo-600 text-3xl font-black">
                    {doc.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{doc.name}</h3>
                    <p className="text-sm font-bold text-indigo-600 tracking-tight">{doc.specialization}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-start gap-3">
                      <Hospital className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-xs font-bold text-slate-600 leading-relaxed">{doc.hospital}</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-xs font-bold text-slate-500">Last visited <span className="text-indigo-600">{new Date(doc.lastVisit).toLocaleDateString()}</span></p>
                   </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                   <p className="text-xs font-medium text-slate-500 italic leading-relaxed line-clamp-2">
                     "{doc.biography}"
                   </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-auto p-4 flex gap-2 border-t border-slate-50">
                 <button className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" /> Reports
                 </button>
                 <button className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                    <MessageSquare className="w-4 h-4" /> Message
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Network Note */}
      <div className="mt-12 text-center p-8 border-2 border-dashed border-slate-200 rounded-[3rem]">
         <p className="text-slate-400 font-bold text-sm">
           This directory only shows doctors you have authorized and visited through the MedChain platform.
         </p>
         <button className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline transition-all">
           Search MedChain Physician Network
         </button>
      </div>
    </div>
  );
}
