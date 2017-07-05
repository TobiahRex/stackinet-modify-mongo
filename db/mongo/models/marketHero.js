/* eslint-disable no-use-before-define, no-console, import/newline-after-import */
import axios from 'axios';
import { Promise as bbPromise } from 'bluebird';
import marketHeroSchema from '../schemas/marketHero';
require('dotenv').load({ silent: true });

export default (db) => {
  marketHeroSchema.statics.dropCollection  = collectionName =>
  new Promise((resolve, reject) => {
    console.log('\nDropping ', collectionName, ' collection...');

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

  marketHeroSchema.statics.removeOne = ({ id }) =>
  new Promise((resolve, reject) => {
    if (!eventBody) return reject(`Missing required arguments. "id": ${id || 'undefined'}`);

    MarketHero
    .findByIdAndRemove(event.body.id).exec()
    .then((deletedDoc) => {
      console.log('\nSuccessfully removed _id: ', deletedDoc._id);
      resolve(deletedDoc);
    })
    .catch((error) => {
      console.log('\nCould not delete Document with _id: ', event.body.id, '\nERROR: ', error);
    });
  });


  marketHeroSchema.statics.updateDoc = (eventBody) =>
  new Promise((resolve, reject) => {
    if (!eventBody) return reject(`Missing required arguments. "eventBody": ${eventBody || 'undefined'}`);

    delete eventBody.collectionName;
    delete eventBody.databaseName;
    delete eventBody.operationName;

    const updateArgs = Object.assign({}, eventBody);
    MarketHero
    .findByIdAndUpdate(id, { $set: updateArgs }, { new: true })
    .exec()
    .then((result) => {
      console.log(`Successfully updated collection ${collectionName}.  RESULT = ${result}`);
      return resolve(result);
    })
    .catch((error) => {
      console.log(`Error trying to update collection "${collectionName}".  ERROR = ${error}`);
      return reject(error);
    });
  });

  console.log('\n\nCreating MarketHero collection...');
  const MarketHero = db.model('MarketHero', marketHeroSchema);
  return MarketHero;
};
