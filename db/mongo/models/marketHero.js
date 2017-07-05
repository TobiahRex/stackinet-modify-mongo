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

    return MarketHero
    .remove({})
    .exec()
    .then((result) => {
      console.log(`Successfully dropped collection ${collectionName}.  RESULT = ${result}`);
      return resolve(result);
    })
    .catch((error) => {
      console.log(`Error trying to drop collection "${collectionName}".  ERROR = ${error}`);
      return reject(error);
    });
  });

  console.log('\n\nCreating MarketHero collection...');
  const MarketHero = db.model('MarketHero', marketHeroSchema);
  return MarketHero;
};
