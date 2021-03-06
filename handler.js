if (!global._babelPolyfill) require('babel-polyfill');

import { Promise as bbPromise } from 'bluebird';
import handleModification from './handleModification';
import verifyDB from './db/mongo/connection';

module.exports.modifyMongo = (event, context) => {
  console.log('\nEVENT: ', JSON.stringify(event, null, 2));

  if (
    !event.body.password ||
    !event.body.databaseName ||
    !event.body.collectionName ||
    !event.body.operationName
  ) {
    return context.fail('Missing required arguments.') && context.done();
  }

  if (event.body.password !== process.env.PASSWORD) {
    return context.fail('Unauthorized request.') && context.done();
  } else {
    return verifyDB(event.body.databaseName)
    .then(dbResults => handleModification({ event, ...dbResults }))
    .then((result) => {
      return context.succeed(result) && context.done();
    })
    .catch((error) => {
      console.log('\nFINAL ERROR: \n', JSON.stringify(error, null, 2));
      return context.fail(`Mongo cluster modification failed. ERROR: ${error}`) && context.done();
    });
  }

}
