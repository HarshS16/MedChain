'use strict';

const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Fabric Gateway Configuration
 * Handles connectivity to Hyperledger Fabric peers using the Gateway SDK
 */
class FabricConnector {
    constructor() {
        this.client = null;
        this.gateway = null;
        this.network = null;
        this.contracts = new Map();
    }

    /**
     * Initialize connection to the Fabric network
     */
    async init() {
        try {
            const mspId = process.env.FABRIC_MSP_ID || 'Org1MSP';
            const peerEndpoint = process.env.FABRIC_PEER_ENDPOINT || 'localhost:7051';
            const peerHostAlias = process.env.FABRIC_PEER_HOST_ALIAS || 'peer0.org1.example.com';
            
            // 1. Create gRPC connection
            this.client = await this.createGrpcConnection(peerEndpoint, peerHostAlias);

            // 2. Load Identity and Signer (from crypto-config)
            const identity = await this.createIdentity();
            const signer = await this.createSigner();

            // 3. Connect to Gateway
            this.gateway = connect({
                client: this.client,
                identity,
                signer,
                evaluateOptions: () => ({ deadline: Date.now() + 5000 }), // 5s timeout
                commitOptions: () => ({ deadline: Date.now() + 30000 }),   // 30s timeout
            });

            logger.info(`Successfully connected to Fabric Gateway as ${mspId} at ${peerEndpoint}`);
            return this.gateway;
        } catch (error) {
            logger.error('Failed to connect to Fabric Gateway:', error);
            // Fallback for development if network isn't up
            if (process.env.NODE_ENV === 'development') {
                logger.warn('RUNNING IN MOCK MODE: Fabric network not reachable.');
                return null;
            }
            throw error;
        }
    }

    async createGrpcConnection(endpoint, hostAlias) {
        const tlsCertPath = process.env.FABRIC_TLS_CERT_PATH;
        let credentials;

        if (tlsCertPath) {
            const tlsRootCert = await fs.readFile(tlsCertPath);
            credentials = grpc.credentials.createSsl(tlsRootCert);
        } else {
            credentials = grpc.credentials.createInsecure();
        }

        return new grpc.Client(endpoint, credentials, {
            'grpc.ssl_target_name_override': hostAlias,
        });
    }

    async createIdentity() {
        const certPath = process.env.FABRIC_CERT_PATH;
        if (!certPath) {
            if (process.env.NODE_ENV === 'development') return null;
            throw new Error('FABRIC_CERT_PATH is not defined');
        }
        const credentials = await fs.readFile(certPath);
        return { 
            mspId: process.env.FABRIC_MSP_ID || 'Org1MSP', 
            credentials 
        };
    }

    async createSigner() {
        const keyPath = process.env.FABRIC_KEY_PATH;
        if (!keyPath) {
            if (process.env.NODE_ENV === 'development') return null;
            throw new Error('FABRIC_KEY_PATH is not defined');
        }
        const privateKeyPem = await fs.readFile(keyPath);
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        return signers.newPrivateKeySigner(privateKey);
    }

    /**
     * Get a specific contract from the network
     */
    getContract(channelName, chaincodeName, contractName) {
        if (!this.gateway) return null;
        
        const network = this.gateway.getNetwork(channelName);
        return network.getContract(chaincodeName, contractName);
    }

    async close() {
        if (this.gateway) this.gateway.close();
        if (this.client) this.client.close();
    }
}

module.exports = new FabricConnector();
