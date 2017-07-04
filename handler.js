if (!global._babelPolyfill) require('babel-polyfill');

import { Promise as bbPromise } from 'bluebird';
import handleModification from './handleModification';
import verifyDB from './db/mongo/connection';

module.exports.modify = (event, context) => {
  console.log('\nEVENT: ', JSON.stringify(event, null, 2));

  if (
    !event.body.databaseName ||
    !event.body.collectionName ||
    !event.body.operationName
  ) {
    return context.fail({ message: 'Missing required arguments.' }) && context.done();
  }

  verifyDB(event.body.databaseName)
  .then(dbModels => {
    console.log('\nSuccessfully retrieved ', event.body.databaseName.toUpperCase());

    handleModification({ event, dbModel: dbModels[event.body.collectionName] });
  })
  .then((result) => {
    return context.succeed(JSON.stringify({ message: { ...result } })) && context.done();
  })
  .catch((error) => {
    console.log('\nFINAL ERROR: \n', JSON.stringify(error, null, 2));
    return context.fail(JSON.stringify({ message: 'Mongo Cluster modification failed', ...error })) && context.done();
  });
}
