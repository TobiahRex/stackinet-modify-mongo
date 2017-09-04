/* eslint-disable no-console, no-constant-condition, no-unused-vars */
import mongoose from 'mongoose';
import createEmailModel from './models/email';
import createMarketHeroModel from './models/marketHero';
import createProductModel from './models/product';
import createSagawaModel from './models/sagawa';
import createTransactionModel from './models/transaction';
import createUserModel from './models/user';
import createReportModel from './models/report';

mongoose.Promise = Promise;
const dotenv = require('dotenv').config({ silent: true }); //eslint-disable-line
const lonesmokeMongo = process.env.LONESMOKE_MONGO_URI;
const nj2jpMongo = process.env.NJ2JP_MONGO_URI;

if (!lonesmokeMongo || !nj2jpMongo) {
  console.log(`Lonesmoke MONGO value is: ${lonesmokeMongo || 'undefined'}`);
  console.log(`Nj2jp MONGO value is: ${lonesmokeMongo || 'undefined'}`);
}

let cachedDb = {
  lonesmoke: {
    connection: null,
    dbModels: {
      Email: null,
      Complaint: null,
      MarketHero: null,
    },
  },
  nj2jp: {
    connection: null,
    dbModels: {
      User: null,
      Email: null,
      Transactions: null,
    },
  },
};

const verifyDb = dbName =>
new Promise((resolve, reject) => {
  switch (dbName.toLowerCase()) {
    case 'lonesmoke': {
      console.log('cachedDb.lonesmoke.connection', cachedDb.lonesmoke.connection);

      if (
        cachedDb.lonesmoke.connection &&
        (cachedDb.lonesmoke.connection._readyState === 1)
      ) {
        console.log('\nFOUND PREVIOUS LONESMOKE CONNECTION\n',
        '\nCurrent Connections: ', cachedDb.lonesmoke.connection.base.connections, 'cachedDb.lonesmokeConnection._readyState: ', cachedDb.lonesmoke.connection._readyState);

        resolve(cachedDb.lonesmoke);
      } else {
        const connection = mongoose.createConnection(lonesmokeMongo, { replset: { poolSize: 100 }});
        console.log(`CREATED NEW ${dbName} CONNECTION: `, connection);

        cachedDb = {
          ...cachedDb,
          lonesmoke: {
            connection,
            dbModels: {
              Email: createEmailModel(connection),
              MarketHero: createMarketHeroModel(connection),
            },
          },
        };

        resolve(cachedDb.lonesmoke);
      }
    } break;
    case 'nj2jp': {
      if (
        cachedDb.nj2jp.connection &&
        (cachedDb.nj2jp.connection._readyState === 1)
      ) {
        console.log('cachedDb.nj2jpConnection._readyState: ', cachedDb.nj2jp.connection._readyState, '\nFound previous Nj2jp CONNECTION\n', '\nCurrent NJ2JP Connections: ', cachedDb.nj2jp.connection.base.connections);
        resolve(cachedDb.nj2jp);
      } else {
        const connection = mongoose.createConnection(nj2jpMongo, { replset: { poolSize: 100 }});
        console.log(`CREATED NEW ${dbName} CONNECTION: `, connection);

        cachedDb = {
          ...cachedDb,
          nj2jp: {
            connection,
            dbModels: {
              Email: createEmailModel(connection),
              MarketHero: createMarketHeroModel(connection),
              Product: createProductModel(connection),
              Sagawa: createSagawaModel(connection),
              Transaction: createTransactionModel(connection),
              User: createUserModel(connection),
              Report: createReportModel(connection),
            },
          },
        };

        resolve(cachedDb.nj2jp);
      }
    } break;
    default: {
      console.log('\nError that dbName did not match any databases in the Stakinet cluster.');
      reject('Error that dbName did not match any databases in the Stakinet cluster.');
    } break;
  }
});

export default verifyDb;
