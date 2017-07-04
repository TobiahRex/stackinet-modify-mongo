/* eslint-disable no-console, no-constant-condition, no-unused-vars */
import mongoose from 'mongoose';
import createMarketHeroModel from './models/marketHero';
import createEmailModel from './models/email';
import createComplaintModel from './models/complaint';
import createProductModel from './models/product';
import createUserModel from './models/user';

mongoose.Promise = Promise;
const dotenv = require('dotenv').config({ silent: true }); //eslint-disable-line
const lonesmokeMongo = process.env.lonesmoke_MONGOURI;
const nj2jpMongo = process.env.nj2jp_MONGOURI;

if (!lonesmokeMongo || !nj2jpMongo) {
  console.log(`Lonesmoke MONGO value is: ${lonesmokeMongo ? lonesmokeMongo : 'undefined'}`);
  console.log(`Nj2jp MONGO value is: ${lonesmokeMongo ? lonesmokeMongo : 'undefined'}`);
}

let cachedDb = {
  lonesmokeConnection: null,
  nj2jpConnection: null,
  lonesmokeDbModels: {
    Email: null,
    Complaint: null,
    MarketHero: null,
  },
  nj2jpDbModels: {
    User: null,
    Email: null,
    Transactions: null,
  },
};

const verifyDb = () =>
new Promise((resolve) => {
  if (
    cachedDb.lonesmokeConnection &&
    (cachedDb.lonesmokeConnection._readyState === 1)
  ) {
    console.log('cachedDb.lonesmokeConnection._readyState: ', cachedDb.lonesmokeConnection._readyState, '\nFound previous LONESMOKE CONNECTION\n', '\nCurrent Connections: ', cachedDb.lonesmokeConnection.base.connections);
    resolve(cachedDb.lonesmokeDbModels);
  } else {
    const connection = mongoose.createConnection(lonesmokeMongo, console.log);
    console.log('CREATED NEW Lonesmoke CONNECTION: ', connection, '\nmongoose.lonesmokeConnection.readyState: ', connection._readyState, '\nAll Lonesmoke Connections:', connection.base);

    cachedDb.lonesmokeConnection = connection;
    cacheDb.lonesmokeDbModels = {
      Email: createEmailModel(connection),
      Complaint: createComplaintModel(connection),
      MarketHero: createMarketHeroModel(connection),
    };
  }

  if (
    cachedDb.nj2jpConnection &&
    (cachedDb.nj2jpConnection._readyState === 1)
  ) {
    console.log('cachedDb.nj2jpConnection._readyState: ', cachedDb.nj2jpConnection._readyState, '\nFound previous Nj2jp CONNECTION\n', '\nCurrent NJ2JP Connections: ', cachedDb.nj2jpConnection.base.connections);
    resolve(cachedDb.nj2jpDbModels);
  } else {
    const connection = mongoose.createConnection(MONGO_DB, console.log);
    console.log('CREATED NEW CONNECTION: ', connection, '\nmongoose.connection.readyState: ', connection._readyState, '\nAll Connections:', connection.base);

    cachedDb.nj2jpConnection = connection;
    cacheDb.nj2jpDbModels = {
      User: createUserModel(connection),
      Product: createProductModel(connection),
    };
  }
  resolve(cachedDb);
});

export default verifyDb;
