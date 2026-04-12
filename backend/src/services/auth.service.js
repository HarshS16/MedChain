'use strict';

const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth.middleware');
const crypto = require('../utils/crypto.utils');
const logger = require('../utils/logger');
const { prisma } = require('../config/db');

/**
 * Auth Service — Handles user authentication, registration, and session management
 * Simplified for MVP but integrated with Prisma for real persistence.
 */
class AuthService {
    constructor() {}

    /**
     * Register a new patient
     */
    async registerPatient(data) {
        const { abhaId, name, email, phone, dateOfBirth, gender, address, password } = data;

        // Check if ABHA ID already registered in DB
        const existing = await prisma.patient.findUnique({ where: { abhaId } });
        if (existing) {
            throw Object.assign(new Error('ABHA ID already registered'), { statusCode: 409 });
        }

        const patientId = crypto.generateId('PAT');
        const keyPair = crypto.generateKeyPair();
        const passwordHash = await bcrypt.hash(password || abhaId, 12);

        // Demographic data for hashing
        const demographicsPlain = JSON.stringify({ name, dateOfBirth, gender, phone, email, address });
        const demographicsHash = crypto.sha256Hash(demographicsPlain);

        // Create user record in PostgreSQL
        const patient = await prisma.patient.create({
            data: {
                patientId,
                abhaId,
                name,
                email,
                phone,
                passwordHash,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                publicKey: keyPair.publicKey,
                demographicsHash,
            }
        });

        logger.info(`Patient registered in DB: ${patientId} (ABHA: ${abhaId})`);

        const token = generateToken({
            id: patient.id,
            role: 'patient',
            name: patient.name,
            email: patient.email,
            abhaId: patient.abhaId
        });

        return {
            token,
            user: {
                id: patient.id,
                patientId: patient.patientId,
                role: 'patient',
                name: patient.name,
                abhaId: patient.abhaId,
                email: patient.email,
                publicKey: patient.publicKey
            }
        };
    }

    /**
     * Register a new doctor
     */
    async registerDoctor(data) {
        const { nmcRegistrationNo, name, specialization, hospitalId, email, phone, password } = data;

        // Check NMC number uniqueness in DB
        const existing = await prisma.doctor.findUnique({ where: { nmcRegistrationNo } });
        if (existing) {
            throw Object.assign(new Error('NMC Registration number already registered'), { statusCode: 409 });
        }

        const doctorId = crypto.generateId('DOC');
        const keyPair = crypto.generateKeyPair();
        const passwordHash = await bcrypt.hash(password || nmcRegistrationNo, 12);

        const doctor = await prisma.doctor.create({
            data: {
                doctorId,
                nmcRegistrationNo,
                name,
                email,
                phone,
                passwordHash,
                orgId: hospitalId || 'HOSP-DEFAULT',
                specialization,
                publicKey: keyPair.publicKey,
                isVerified: false
            }
        });

        logger.info(`Doctor registered in DB: ${doctorId} (NMC: ${nmcRegistrationNo})`);

        const token = generateToken({
            id: doctor.id,
            role: 'doctor',
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            orgId: doctor.orgId
        });

        return {
            token,
            user: {
                id: doctor.id,
                doctorId: doctor.doctorId,
                role: 'doctor',
                name: doctor.name,
                nmcRegistrationNo: doctor.nmcRegistrationNo,
                specialization: doctor.specialization,
                hospitalId: doctor.orgId,
                isVerified: doctor.isVerified,
                publicKey: doctor.publicKey
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
                        { abhaId: identifier },
                        { email: identifier }
                    ]
                }
            });
            if (user) user.role = 'patient';
        } else {
            user = await prisma.doctor.findFirst({
                where: {
                    OR: [
                        { doctorId: identifier },
                        { nmcRegistrationNo: identifier },
                        { email: identifier }
                    ]
                }
            });
            if (user) user.role = 'doctor';
        }

        if (!user || !user.passwordHash) {
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
            orgId: user.orgId || user.hospitalId || null,
            abhaId: user.abhaId || null
        });

        logger.info(`User authenticated: ${user.id} (${user.role})`);

        return {
            token,
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                ...(user.role === 'patient' && { 
                    abhaId: user.abhaId,
                    patientId: user.patientId
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
        // Try patient then doctor
        let user = await prisma.patient.findUnique({ where: { id: userId } });
        if (user) {
            user.role = 'patient';
        } else {
            user = await prisma.doctor.findUnique({ where: { id: userId } });
            if (user) user.role = 'doctor';
        }

        if (!user) return null;

        return {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            publicKey: user.publicKey,
            ...(user.role === 'patient' && { 
                abhaId: user.abhaId,
                patientId: user.patientId
            }),
            ...(user.role === 'doctor' && {
                nmcRegistrationNo: user.nmcRegistrationNo,
                specialization: user.specialization,
                hospitalId: user.orgId,
                isVerified: user.isVerified
            })
        };
    }

    /**
     * Get user public key
     */
    async getPublicKey(userId) {
        const user = await this.getUserById(userId);
        if (!user) throw new Error(`User ${userId} not found`);
        return user.publicKey;
    }
}

module.exports = new AuthService();
