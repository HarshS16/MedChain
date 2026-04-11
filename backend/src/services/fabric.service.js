'use strict';

const gatewayConnector = require('../config/fabric-gateway');
const logger = require('../utils/logger');

/**
 * Fabric Service — High-level abstraction for Chaincode interactions
 */
class FabricService {
    constructor() {
        this.channelName = process.env.FABRIC_CHANNEL || 'medchannel';
        this.chaincodeName = process.env.FABRIC_CHAINCODE || 'medrecord';
    }

    /**
     * Helper to execute a transaction (write)
     */
    async submitTransaction(contractName, functionName, ...args) {
        try {
            const contract = gatewayConnector.getContract(this.channelName, this.chaincodeName, contractName);
            if (!contract) {
                logger.warn(`MOCK TRANSACTION [${contractName}:${functionName}]: ${JSON.stringify(args)}`);
                return { mock: true, txId: 'mock-tx-' + Date.now() };
            }

            logger.info(`Submitting Transaction: ${functionName} on contract ${contractName}`);
            const resultBytes = await contract.submitTransaction(functionName, ...args);
            
            const resultString = Buffer.from(resultBytes).toString();
            return resultString ? JSON.parse(resultString) : null;
        } catch (error) {
            logger.error(`Fabric submission error [${functionName}]:`, error);
            throw error;
        }
    }

    /**
     * Helper to evaluate a transaction (read)
     */
    async evaluateTransaction(contractName, functionName, ...args) {
        try {
            const contract = gatewayConnector.getContract(this.channelName, this.chaincodeName, contractName);
            if (!contract) {
                logger.warn(`MOCK QUERY [${contractName}:${functionName}]: ${JSON.stringify(args)}`);
                return null;
            }

            logger.info(`Evaluating Transaction: ${functionName} on contract ${contractName}`);
            const resultBytes = await contract.evaluateTransaction(functionName, ...args);
            
            const resultString = Buffer.from(resultBytes).toString();
            return resultString ? JSON.parse(resultString) : null;
        } catch (error) {
            logger.error(`Fabric evaluation error [${functionName}]:`, error);
            throw error;
        }
    }

    // --- Patient Contract Calls ---

    async registerPatient(patientId, abhaId, publicKey) {
        return this.submitTransaction('PatientContract', 'RegisterPatient', patientId, abhaId, publicKey);
    }

    async getPatient(patientId) {
        return this.evaluateTransaction('PatientContract', 'GetPatient', patientId);
    }

    // --- Record Contract Calls ---

    async createRecord(recordId, patientId, doctorId, hospitalId, recordType, dataHash, ipfsCid, encryptedKeys) {
        return this.submitTransaction(
            'RecordContract', 
            'CreateRecord', 
            recordId, 
            patientId, 
            doctorId, 
            hospitalId, 
            recordType, 
            dataHash, 
            ipfsCid, 
            JSON.stringify(encryptedKeys)
        );
    }

    async getRecordById(recordId) {
        return this.evaluateTransaction('RecordContract', 'GetRecordById', recordId);
    }

    async getRecordsByPatient(patientId) {
        return this.evaluateTransaction('RecordContract', 'GetRecordsByPatient', patientId);
    }

    // --- Access Contract Calls ---

    async grantAccess(patientId, doctorId, durationHours, scope) {
        return this.submitTransaction('AccessContract', 'GrantAccess', patientId, doctorId, durationHours.toString(), scope);
    }

    async revokeAccess(patientId, doctorId) {
        return this.submitTransaction('AccessContract', 'RevokeAccess', patientId, doctorId);
    }

    async checkAccess(patientId, doctorId) {
        const result = await this.evaluateTransaction('AccessContract', 'CheckAccess', patientId, doctorId);
        return result === true || result?.hasAccess === true;
    }
}

module.exports = new FabricService();
