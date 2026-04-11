"use client";

import { motion } from "framer-motion";
import { Activity, Clock, ShieldAlert, FileText, ChevronRight } from "lucide-react";

export default function MedicalHistoryPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Medical History</h1>
        <p className="text-gray-400">
          A chronologically generated, AI-summarized overview of all your available medical records.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark border border-indigo-500/20 rounded-2xl p-6 md:p-8 space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Comprehensive Medical Summary</h2>
            <p className="text-sm text-gray-400">Last updated: Today</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-300 leading-relaxed max-w-prose">
          <p>
            <strong className="text-white">Overview:</strong> This comprehensive summary, dated 20 July 2015, provides a clinical assessment of Mr. Tan Ah Kow. The assessment was conducted by Dr. Tan Ah Moi at Blackacre Hospital following a re-examination of the patient on 20 June 2015.
          </p>

          <div className="space-y-3">
            <h3 className="text-indigo-400 font-semibold flex items-center gap-2 text-base">
              <FileText className="w-4 h-4" /> 1. Clinical History and Diagnosis
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Patient Profile:</strong> Mr. Tan is a 55-year-old, unemployed, and divorced male currently living with his son.</li>
              <li><strong className="text-white">Medical Background:</strong> The patient has a long-standing history of hypertension and hyperlipidemia (since 1990) and suffered multiple strokes in 2005 and 2010.</li>
              <li><strong className="text-white">Primary Diagnosis:</strong> The doctor identifies Dementia and Stroke as the primary conditions. Mr. Tan exhibits behavioural and psychological symptoms secondary to dementia and has shown a gradual deterioration in cognitive and physical states.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-indigo-400 font-semibold flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" /> 2. Mental State Examination Findings
            </h3>
            <p>The clinical observations reveal significant cognitive deficits across several domains:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Orientation:</strong> Unable to identify location until prompted; could not correctly identify the date, day, or year.</li>
              <li><strong className="text-white">Memory & Knowledge:</strong> Could not remember the doctor’s name despite five years of treatment, misstated age, and failed to provide home address.</li>
              <li><strong className="text-white">Functional Literacy:</strong> Failed simple arithmetic, could not count backward, and unable to recognize currency.</li>
              <li><strong className="text-white">Insight:</strong> Showed a total lack of awareness regarding medical conditions or medications.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-indigo-400 font-semibold flex items-center gap-2 text-base">
              <Activity className="w-4 h-4" /> 3. Capacity Assessment & Prognosis
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Personal Welfare:</strong> Lacks overall capacity.</li>
              <li><strong className="text-white">Property & Affairs:</strong> Lacks overall capacity.</li>
              <li><strong className="text-white">Prognosis:</strong> The prognosis is poor. Mr. Tan is unlikely to regain mental capacity due to irreversible dementia.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-6 flex gap-3 items-start">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-200">AI-Generated Summary</p>
            <p className="text-xs text-red-300/[0.8] leading-relaxed">
              This comprehensive summary is AI-generated for demonstration purposes by aggregating multiple available medical records. It is NOT a definitive medical diagnosis. Always consult your healthcare provider for professional medical advice.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
