'use strict';

const { z } = require('zod');

// ---- Patient Validation ----
const registerPatientSchema = z.object({
    abhaId: z.string().regex(/^\d{2}-\d{4}-\d{4}-\d{4}$/, 'ABHA ID must be in XX-XXXX-XXXX-XXXX format'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email format').or(z.literal('')).transform(e => e === '' ? undefined : e).optional(),
    phone: z.string().min(10).max(15).or(z.literal('')).transform(p => p === '' ? undefined : p).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().max(500).optional()
});

// ---- Doctor Validation ----
const registerDoctorSchema = z.object({
    nmcRegistrationNo: z.string().min(3).max(20),
    name: z.string().min(2).max(100),
    specialization: z.string().min(2).max(100),
    hospitalId: z.string().startsWith('HOSP-', 'Hospital ID must start with HOSP-'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().min(10).max(15).or(z.literal('')).transform(p => p === '' ? undefined : p).optional()
});

// ---- Login ----
const loginSchema = z.object({
    identifier: z.string().min(3), // ABHA ID, NMC number, or email
    password: z.string().min(8),
    role: z.enum(['patient', 'doctor', 'admin'])
});

// ---- Record Creation ----
const createRecordSchema = z.object({
    patientId: z.string().startsWith('PAT-'),
    recordType: z.enum([
        'CONSULTATION', 'PRESCRIPTION', 'LAB_REPORT',
        'SURGERY', 'DIAGNOSIS', 'IMAGING',
        'VACCINATION', 'ALLERGY', 'FAMILY_HISTORY'
    ]),
    medicalCategory: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    content: z.object({
        chiefComplaint: z.string().optional(),
        examination: z.any().optional(),
        diagnosis: z.array(z.any()).optional(),
        prescriptions: z.array(z.any()).optional(),
        labOrders: z.array(z.string()).optional(),
        labResults: z.any().optional(),
        procedures: z.array(z.any()).optional(),
        followUp: z.string().optional(),
        doctorNotes: z.string().optional(),
        vitals: z.object({
            bp: z.string().optional(),
            pulse: z.number().optional(),
            temperature: z.number().optional(),
            weight: z.number().optional(),
            height: z.number().optional(),
            bmi: z.number().optional(),
            spo2: z.number().optional()
        }).optional()
    })
});

// ---- Access Control ----
const grantAccessSchema = z.object({
    patientId: z.string().startsWith('PAT-'),
    grantedTo: z.string(), // DOC- or HOSP-
    grantedToType: z.enum(['doctor', 'hospital']),
    scope: z.enum(['ALL', 'READ_ONLY', 'CONSULTATION', 'PRESCRIPTION', 'LAB_REPORT', 'SURGERY', 'DIAGNOSIS']).default('ALL'),
    durationHours: z.number().int().min(0).default(0) // 0 = indefinite
});

const revokeAccessSchema = z.object({
    patientId: z.string().startsWith('PAT-'),
    revokeFrom: z.string() // DOC- or HOSP-
});

// ---- AI Query ----
const aiQuerySchema = z.object({
    patientId: z.string().startsWith('PAT-'),
    query: z.string().min(5).max(1000),
    filters: z.object({
        recordTypes: z.array(z.string()).optional(),
        dateRange: z.object({
            from: z.string().datetime().optional(),
            to: z.string().datetime().optional()
        }).optional(),
        medicalCategories: z.array(z.string()).optional()
    }).optional()
});

// ---- Validation Middleware Factory ----
function validate(schema) {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req.body);
            req.validatedBody = parsed;
            next();
        } catch (error) {
            const details = error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));
            
            require('./logger').warn('Validation failed:', { 
                path: req.originalUrl,
                details,
                body: req.body 
            });

            return res.status(400).json({
                error: 'Validation failed',
                details
            });
        }
    };
}

module.exports = {
    registerPatientSchema,
    registerDoctorSchema,
    loginSchema,
    createRecordSchema,
    grantAccessSchema,
    revokeAccessSchema,
    aiQuerySchema,
    validate
};
