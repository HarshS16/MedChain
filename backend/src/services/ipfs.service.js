'use strict';

const logger = require('../utils/logger');
const axios = require('axios');
const FormData = require('form-data');

/**
 * IPFS Service — Store and retrieve encrypted medical data from IPFS.
 * Supports Local IPFS nodes, Pinata Cloud, and a Mock fallback for development.
 */
class IpfsService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.provider = process.env.IPFS_CLOUD_PROVIDER || 'local';
        this._initializeClient();
    }

    async _initializeClient() {
        try {
            if (this.provider === 'pinata') {
                return this._setupPinataClient();
            }

            // Default to local/private IPFS node
            const IPFS_API_URL = process.env.IPFS_API_URL || 'http://localhost:5001';
            try {
                const { create } = await import('ipfs-http-client');
                this.client = create({ url: IPFS_API_URL });
                this.isConnected = true;
                logger.info(`IPFS client connected to local node at ${IPFS_API_URL}`);
            } catch (e) {
                logger.warn('IPFS local client not available. Using mock mode for development.');
                this._setupMockClient();
            }
        } catch (error) {
            logger.warn('IPFS initialization failed. Using mock mode:', error.message);
            this._setupMockClient();
        }
    }

    /**
     * Set up client using Pinata API
     */
    _setupPinataClient() {
        const apiKey = process.env.PINATA_API_KEY;
        const apiSecret = process.env.PINATA_SECRET_KEY;
        const jwt = process.env.PINATA_JWT;

        if (!jwt && (!apiKey || !apiSecret)) {
            logger.error('Pinata credentials missing in .env. Falling back to mock mode.');
            this._setupMockClient();
            return;
        }

        this.pinataHeaders = jwt 
            ? { 'Authorization': `Bearer ${jwt}` }
            : { 'pinata_api_key': apiKey, 'pinata_secret_api_key': apiSecret };

        // Wrapper for Pinata to match ipfs-http-client interface partially
        this.client = {
            add: async (data, options) => {
                const formData = new FormData();
                
                let content;
                let filename = 'record_file';

                // Check if data is an object with content (Prisma/IPFS style) or a raw Buffer
                if (data && data.content) {
                    content = data.content;
                    filename = data.path || 'record_file';
                } else {
                    content = data;
                }

                // If content is a Buffer, append it directly
                if (Buffer.isBuffer(content)) {
                    formData.append('file', content, { filename });
                } else {
                    const stringContent = typeof content === 'string' ? content : JSON.stringify(content);
                    formData.append('file', Buffer.from(stringContent), { filename: 'record.txt' });
                }

                const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                    headers: {
                        ...this.pinataHeaders,
                        ...formData.getHeaders()
                    },
                    maxBodyLength: Infinity // Allow large reports
                });

                return { cid: { toString: () => response.data.IpfsHash } };
            },
            cat: async function* (cid) {
                // Pinata retrieval uses the gateway
                const gateway = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
                const response = await axios.get(`${gateway}/${cid}`, { responseType: 'arraybuffer' });
                yield Buffer.from(response.data);
            },
            pin: {
                add: async () => ({ toString: () => 'pinned' }) // Pinata pins by default on upload
            }
        };

        this.isConnected = true;
        logger.info('IPFS service initialized with Pinata Cloud provider.');
    }

    /**
     * Mock IPFS client for development without node or cloud
     */
    _setupMockClient() {
        this.mockStore = new Map();
        this.client = {
            add: async (data) => {
                const crypto = require('crypto');
                const content = data.content ? data.content : data;
                const body = typeof content === 'string' ? content : JSON.stringify(content);
                const hash = crypto.createHash('sha256').update(body).digest('hex');
                const cid = `Qm${hash.substring(0, 44)}`;
                this.mockStore.set(cid, body);
                return { cid: { toString: () => cid } };
            },
            cat: async function* (cid) {
                const data = this.mockStore.get(cid);
                if (!data) throw new Error(`CID ${cid} not found in mock store`);
                yield Buffer.from(data);
            }.bind(this),
            pin: {
                add: async () => ({ toString: () => 'pinned' })
            }
        };
        this.isConnected = true;
    }

    /**
     * Store encrypted data on IPFS
     * @param {string} encryptedData - Encrypted record data
     * @returns {string} IPFS CID
     */
    async storeData(encryptedData) {
        try {
            const result = await this.client.add(encryptedData);
            const cid = result.cid.toString();
            logger.info(`Data stored on IPFS (${this.provider}): ${cid}`);
            return cid;
        } catch (error) {
            logger.error('IPFS store error:', error.response?.data || error.message);
            throw new Error('Failed to store data on IPFS');
        }
    }

    /**
     * Retrieve data from IPFS
     * @param {string} cid - IPFS content identifier
     * @returns {string} Retrieved data
     */
    async retrieveData(cid) {
        try {
            const chunks = [];
            for await (const chunk of this.client.cat(cid)) {
                chunks.push(chunk);
            }
            const data = Buffer.concat(chunks).toString();
            logger.info(`Data retrieved from IPFS: ${cid}`);
            return data;
        } catch (error) {
            logger.error(`IPFS retrieve error for CID ${cid}:`, error.message);
            throw new Error(`Failed to retrieve data from IPFS. CID: ${cid}`);
        }
    }

    /**
     * Store a file (PDF, image) on IPFS
     * @param {Buffer} fileBuffer - File data
     * @param {string} filename - Original filename
     * @returns {{ cid, size }}
     */
    async storeFile(fileBuffer, filename) {
        try {
            const result = await this.client.add({
                path: filename,
                content: fileBuffer
            });
            const cid = result.cid.toString();
            logger.info(`File stored on IPFS: ${filename} → ${cid}`);
            return { cid, size: fileBuffer.length };
        } catch (error) {
            logger.error('IPFS file store error:', error.response?.data || error.message);
            throw new Error('Failed to store file on IPFS');
        }
    }

    /**
     * Check connection status
     */
    async checkHealth() {
        try {
            if (this.mockStore) {
                return { status: 'mock', message: 'Using mock IPFS (development mode)' };
            }
            if (this.provider === 'pinata') {
                return { status: 'connected', provider: 'pinata' };
            }
            const id = await this.client.id();
            return { status: 'connected', peerId: id.id.toString() };
        } catch (error) {
            return { status: 'disconnected', error: error.message };
        }
    }
}

module.exports = new IpfsService();
