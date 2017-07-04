if (!global._babelPolyfill) require('babel-polyfill');

import { Promise as bbPromise } from 'bluebird';
import handleModification from './handleModification';
import verifyDB from './db/mongo/connection';

module.exports.modifyMongo = (event, context) => {
  console.log('\nEVENT: ', JSON.stringify(event, null, 2));

  if (!event.body.operationName || !event.body.collectionName) {
    return context.fail({ message: 'Missing required arguments.' }) && context.done();
  }

  verifyDB()
  .then(dbCollections => handleModification(event, { ...dbCollections }))
  .then((result) => {
    return context.succeed(JSON.stringify({ message: { ...result } })) && context.done();
  })
  .catch((error) => {
    console.log('\nFINAL ERROR: \n', JSON.stringify(error, null, 2));
    return context.fail(JSON.stringify({ message: 'Ses Discount handler FAILED', ...error })) && context.done();
  });
}
