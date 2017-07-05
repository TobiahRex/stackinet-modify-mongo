/* eslint-disable no-use-before-define, no-console, import/newline-after-import */
import axios from 'axios';
import { Promise as bbPromise } from 'bluebird';
import marketHeroSchema from '../schemas/marketHero';
require('dotenv').load({ silent: true });

export default (db) => {
  marketHeroSchema.statics.dropCollection  = collectionName =>
  new Promise((resolve, reject) => {
    console.log('\nDropping ', collectionName, ' collection...');
    console.log('MarketHero.exec: ', MarketHero.exec);
    return MarketHero.find({}).exec()
    .then(result => {
      console.log('\nFound something...', result);
      resolve(result);
    })
    .catch(error => {
      console.log('\nERROR at FIND: ', error);
      reject(error);
    })
    // return bbPromise.fromCallback(cb => MarketHero.remove({}, cb))
    // .then((result) => {
    //   console.log('\nSuccessfully removed all Documents on the ', collectionName, ' collection.\nResult: ', result);
    //   return resolve(result);
    // })
    // .catch((error) => {
    //   console.log('\nERROR trying to drop collection ', collectionName, '\nERROR: ', error);
    //   return reject(error);
    // });
  });

  console.log('\n\nCreating MarketHero collection...');
  const MarketHero = db.model('MarketHero', marketHeroSchema);
  return MarketHero;
};
