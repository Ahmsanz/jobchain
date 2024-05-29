import { Types } from 'mongoose';

const { ObjectId } = Types;

export const USERS = [
  {
    _id: new ObjectId('6655ffa26bbd25c92dc4179d'),
    firstName: 'Admin',
    lastName: 'McTest',
    email: 'admin.mctest@mail.com',
    role: 'admin',
    password: 'admin',
    auditedCompanies: ['Company Y'],
  },
  {
    _id: new ObjectId('665068fc13bd0d16a1ea2330'),
    firstName: 'Audit',
    lastName: 'McTest',
    email: 'audit.mctest@mail.com',
    role: 'auditor',
    password: 'audit',
    auditedCompanies: ['Company Y'],
  },
];
