'use strict';

const PatientContract = require('./lib/patient-contract');
const RecordContract = require('./lib/record-contract');
const AccessContract = require('./lib/access-contract');
const AuditContract = require('./lib/audit-contract');

module.exports.PatientContract = PatientContract;
module.exports.RecordContract = RecordContract;
module.exports.AccessContract = AccessContract;
module.exports.AuditContract = AuditContract;

module.exports.contracts = [
    PatientContract,
    RecordContract,
    AccessContract,
    AuditContract
];
