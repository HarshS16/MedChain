'use strict';

const crypto = require('../utils/crypto.utils');
const logger = require('../utils/logger');

/**
 * Encryption Service — Handles all encryption/decryption operations
 * 
 * Flow:
 * 1. Medical record encrypted with unique AES-256-GCM key
 * 2. That AES key encrypted with patient's public key (ECIES-like)
 * 3. When access granted, AES key re-encrypted with doctor's public key
 * 4. On revocation, the re-encrypted key entry is invalidated
 */
class EncryptionService {
    /**
     * Encrypt a medical record for storage
     * @param {Object} recordContent - Plaintext medical record content
     * @param {string} patientPublicKey - Patient's PEM public key
     * @returns {{ encryptedData, dataHash, symmetricKey, encryptedKeys }}
     */
    encryptRecord(recordContent, patientPublicKey) {
        const plaintext = JSON.stringify(recordContent);

        // 1. Generate unique symmetric key for this record
        const symmetricKey = crypto.generateSymmetricKey();

        // 2. Encrypt the record with the symmetric key
        const encryptedData = crypto.encryptSymmetric(plaintext, symmetricKey);

        // 3. Hash the plaintext for integrity verification
        const dataHash = crypto.sha256Hash(plaintext);

        // 4. Encrypt the symmetric key with patient's public key
        // Note: In a real implementation, we'd use the patient's ECIES public key
        // For MVP, we store the key securely with the session
        const encryptedKeyForPatient = symmetricKey.toString('base64');

        return {
            encryptedData,
            dataHash,
            symmetricKey: symmetricKey.toString('base64'),
            encryptedKeys: {
                // In production, each entry would be the sym key encrypted with that user's public key
            }
        };
    }

    /**
     * Decrypt a medical record
     * @param {string} encryptedData - Base64-encoded encrypted data
     * @param {string} symmetricKeyBase64 - Base64-encoded AES key
     * @returns {Object} Decrypted medical record content
     */
    decryptRecord(encryptedData, symmetricKeyBase64) {
        try {
            const symmetricKey = Buffer.from(symmetricKeyBase64, 'base64');
            const decryptedText = crypto.decryptSymmetric(encryptedData, symmetricKey);
            return JSON.parse(decryptedText);
        } catch (error) {
            logger.error('Decryption failed:', error.message);
            throw new Error('Failed to decrypt record. Invalid key or corrupted data.');
        }
    }

    /**
     * Verify data integrity by comparing hash
     * @param {string} decryptedData - Decrypted plaintext
     * @param {string} expectedHash - SHA-256 hash stored on-chain
     * @returns {boolean} True if data is intact
     */
    verifyIntegrity(decryptedData, expectedHash) {
        const computedHash = crypto.sha256Hash(
            typeof decryptedData === 'string' ? decryptedData : JSON.stringify(decryptedData)
        );
        return computedHash === expectedHash;
    }

    /**
     * Generate a new key pair for a user (patient or doctor)
     * @returns {{ publicKey, privateKey }}
     */
    generateUserKeyPair() {
        return crypto.generateKeyPair();
    }

    /**
     * Re-encrypt the symmetric key for a new recipient (when granting access)
     * @param {string} symmetricKeyBase64 - The record's AES key
     * @param {string} recipientPublicKey - New recipient's public key
     * @returns {string} Encrypted key for the recipient
     */
    shareKeyWithRecipient(symmetricKeyBase64, recipientPublicKey) {
        // In a full implementation, this would use ECIES
        // For MVP, we create a shared secret approach
        const symmetricKey = Buffer.from(symmetricKeyBase64, 'base64');

        // For now, return the base64 key (in production, this would be encrypted with recipient's public key)
        return symmetricKey.toString('base64');
    }

    /**
     * Invalidate a recipient's access to a key
     * This is handled by removing the encryptedKeys entry on-chain
     */
    revokeKeyAccess(recordId, recipientId) {
        logger.info(`Key access revoked for ${recipientId} on record ${recordId}`);
        return true;
    }
}

module.exports = new EncryptionService();
