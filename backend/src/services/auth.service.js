'use strict';

const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth.middleware');
const crypto = require('../utils/crypto.utils');
const logger = require('../utils/logger');
const { prisma } = require('../config/db');

/**
 * Auth Service — Handles user authentication, registration, and session management
 * 
 * In production, this integrates with Fabric CA for certificate-based identity.
 * For MVP, we use JWT + password auth with Fabric CA integration planned.
 */
class AuthService {
    constructor() {}

    /**
     * Register a new patient
     */
    async registerPatient(data) {
        const { abhaId, name, email, phone, dateOfBirth, gender, address } = data;

        // Check if ABHA ID already registered in DB
        const existing = await prisma.patient.findUnique({ where: { abhaId } });
        if (existing) {
            throw Object.assign(new Error('ABHA ID already registered'), { statusCode: 409 });
        }

        // Generate IDs and keys
        const patientId = crypto.generateId('PAT');
        const keyPair = crypto.generateKeyPair();

        // Hash demographic data
        const demographicsPlain = JSON.stringify({ name, dateOfBirth, gender, phone, email, address });
        const demographicsHash = crypto.sha256Hash(demographicsPlain);

        // Create user record in PostgreSQL
        const patient = await prisma.patient.create({
            data: {
                patientId,
                abhaId,
                publicKey: keyPair.publicKey,
                demographicsHash,
                // For MVP, we're not actually storing demographics_encrypted in DB yet
                // but we could if we wanted to allow cloud-backup of profiles
            }
        });

        // Store secure credentials (should be in a separate encrypted table or vault)
        // For MVP, we'll keep them in this log for demonstration (CAUTION: Production would never do this)
        logger.info(`Patient registered: ${patientId} (ABHA: ${abhaId})`);

        // Generate token
        const token = generateToken({
            id: patientId,
            role: 'patient',
            name,
            email,
            abhaId
        });

        return {
            token,
            user: {
                id: patientId,
                role: 'patient',
                name,
                abhaId,
                email,
                publicKey: keyPair.publicKey
            }
        };
    }

    /**
     * Register a new doctor
     */
    async registerDoctor(data) {
        const { nmcRegistrationNo, name, specialization, hospitalId, email, phone } = data;

        // Check NMC number uniqueness
        for (const user of this.users.values()) {
            if (user.nmcRegistrationNo === nmcRegistrationNo) {
                throw Object.assign(new Error('NMC Registration number already registered'), { statusCode: 409 });
            }
        }

        const doctorId = crypto.generateId('DOC');
        const keyPair = crypto.generateKeyPair();
        const passwordHash = await bcrypt.hash(data.password || nmcRegistrationNo, 12);

        const user = {
            id: doctorId,
            role: 'doctor',
            nmcRegistrationNo,
            name,
            specialization,
            hospitalId,
            email,
            phone,
            passwordHash,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey,
            isVerified: false, // Needs admin verification
            createdAt: new Date().toISOString()
        };

        this.users.set(doctorId, user);
        this.users.set(`nmc:${nmcRegistrationNo}`, user);

        logger.info(`Doctor registered: ${doctorId} (NMC: ${nmcRegistrationNo})`);

        const token = generateToken({
            id: doctorId,
            role: 'doctor',
            name,
            email,
            specialization,
            orgId: hospitalId
        });

        return {
            token,
            user: {
                id: doctorId,
                role: 'doctor',
                name,
                nmcRegistrationNo,
                specialization,
                hospitalId,
                isVerified: false,
                publicKey: keyPair.publicKey
            }
        };
    }

    /**
     * Login user
     */
    async login(identifier, password, role) {
        let user = null;

        if (role === 'patient') {
            user = await prisma.patient.findFirst({
                where: {
                    OR: [
                        { patientId: identifier },
                        { abhaId: identifier }
                    ]
                }
            });
            if (user) user.role = 'patient';
        } else {
            user = await prisma.doctor.findFirst({
                where: {
                    OR: [
                        { doctorId: identifier },
                        { nmcRegistrationNo: identifier }
                    ]
                }
            });
            if (user) user.role = 'doctor';
        }

        if (!user) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }

        const token = generateToken({
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            orgId: user.hospitalId || null,
            abhaId: user.abhaId || null
        });

        logger.info(`User logged in: ${user.id} (${user.role})`);

        return {
            token,
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                ...(user.role === 'patient' && { 
                    abhaId: user.abhaId,
                    patientId: user.patientId // Explicitly adding this!
                }),
                ...(user.role === 'doctor' && {
                    nmcRegistrationNo: user.nmcRegistrationNo,
                    specialization: user.specialization,
                    isVerified: user.isVerified
                })
            }
        };
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const user = this.users.get(userId);
        if (!user) return null;

        return {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            publicKey: user.publicKey,
            ...(user.role === 'patient' && { abhaId: user.abhaId }),
            ...(user.role === 'doctor' && {
                nmcRegistrationNo: user.nmcRegistrationNo,
                specialization: user.specialization,
                hospitalId: user.hospitalId,
                isVerified: user.isVerified
            })
        };
    }

    /**
     * Get user public key
     */
    async getPublicKey(userId) {
        const user = this.users.get(userId);
        if (!user) throw new Error(`User ${userId} not found`);
        return user.publicKey;
    }
}

module.exports = new AuthService();
