'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Crypto utility functions for MedChain
 * AES-256-GCM for symmetric encryption
 * ECIES pattern for asymmetric key exchange
 */

/**
 * Generate a random AES-256 symmetric key
 * @returns {Buffer} 32-byte key
 */
function generateSymmetricKey() {
    return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Encrypt data with AES-256-GCM
 * @param {string|Buffer} plaintext - Data to encrypt
 * @param {Buffer} key - 32-byte symmetric key
 * @returns {string} Base64-encoded encrypted payload (iv + tag + ciphertext)
 */
function encryptSymmetric(plaintext, key) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(typeof plaintext === 'string' ? plaintext : plaintext.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    // Pack: iv (16) + tag (16) + ciphertext
    const payload = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
    return payload.toString('base64');
}

/**
 * Decrypt data encrypted with AES-256-GCM
 * @param {string} encryptedPayload - Base64-encoded payload
 * @param {Buffer} key - 32-byte symmetric key
 * @returns {string} Decrypted plaintext
 */
function decryptSymmetric(encryptedPayload, key) {
    const payload = Buffer.from(encryptedPayload, 'base64');

    const iv = payload.subarray(0, IV_LENGTH);
    const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = payload.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, null, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Hash data with SHA-256
 * @param {string|Buffer} data - Data to hash
 * @returns {string} Hex-encoded SHA-256 hash
 */
function sha256Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate ECIES key pair for patient
 * @returns {{ publicKey: string, privateKey: string }} Hex-encoded keys
 */
function generateKeyPair() {
    const keyPair = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1',
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
    };
}

/**
 * Derive encryption key from password (for wallet encryption)
 * @param {string} password - User password
 * @param {Buffer} salt - Random salt
 * @returns {Buffer} Derived key
 */
function deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt a symmetric key with a recipient's public key
 * This simulates ECIES — encrypt the AES key so only the recipient can decrypt it
 * @param {Buffer} symmetricKey - AES key to encrypt
 * @param {string} recipientPublicKey - PEM-encoded public key
 * @returns {string} Base64-encoded encrypted key
 */
function encryptKeyForRecipient(symmetricKey, recipientPublicKey) {
    const encrypted = crypto.publicEncrypt(
        {
            key: recipientPublicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        symmetricKey
    );
    return encrypted.toString('base64');
}

/**
 * Decrypt a symmetric key with the recipient's private key
 * @param {string} encryptedKey - Base64-encoded encrypted symmetric key
 * @param {string} privateKey - PEM-encoded private key
 * @returns {Buffer} Decrypted symmetric key
 */
function decryptKeyWithPrivateKey(encryptedKey, privateKey) {
    return crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(encryptedKey, 'base64')
    );
}

/**
 * Generate a secure random UUID-like ID with prefix
 * @param {string} prefix - PAT, DOC, REC, HOSP, GRANT
 * @returns {string} Prefixed UUID
 */
function generateId(prefix) {
    const uuid = crypto.randomUUID();
    return `${prefix}-${uuid}`;
}

module.exports = {
    generateSymmetricKey,
    encryptSymmetric,
    decryptSymmetric,
    sha256Hash,
    generateKeyPair,
    deriveKey,
    encryptKeyForRecipient,
    decryptKeyWithPrivateKey,
    generateId,
    ALGORITHM,
    KEY_LENGTH
};
