import { Promise as bbPromise } from 'bluebird';

/**
* 1) Dynamically create, update, or delete Documents on Mongo Collections.
*
* @param {object} event - Lambda event object.
* - Keys: operationName, collectionName, {other Args for operation.}
* @param {object} <Collections> - Mongo Collections containing documents to be mutated or created.
*
* @return {object} modified Document - Promises: resolved.
*/

export default ({ event, dbModels }) =>
new Promise((resolve, reject) => {
  console.log('\nSTART: Handling modification... ',
  '\noperationName: ', event.body.operationName,
  '\ncollectionName: ', event.body.collectionName,
  '\n\ndbModels: ', Object.keys(dbModels));

  const { operationName, collectionName } = event.body;
  console.log('event: ', event);

  switch (operationName) {
    case 'dropCollection': {
      return dbModels[collectionName]
      .dropCollection()
      .then(resolve)
      .catch(reject);
    }

    case 'deleteOne': {
      return dbModels[collectionName]
      .removeOne(event.body)
      .then(resolve)
      .catch(reject);
    }

    case 'updateDoc': {
      return dbModels[collectionName]
      .updateDoc(event.body)
      .then(resolve)
      .catch(reject);
    }
    //
    // case 'create': {
    //   console.log('\ncreating document...');
    //   const createArgs = Object.assign({}, event.body);
    //   delete createArgs.databaseName;
    //   delete createArgs.operationName;
    //   delete createArgs.collectionName;
    //   bbPromise.fromCallback(cb => dbModel.create({ ...createArgs }, cb))
    //   .then((newDoc) => {
    //     console.log('Successfully create a new document on collection: ', event.body.collectionName);
    //     resolve(newDoc);
    //   })
    //   .catch((error) => {
    //     console.log('\nERROR while trying to create a new document.\nCheck arguments: ', JSON.stringify(createArgs, null, 2));
    //     reject(error);
    //   });
    // } break;
    //
    // case 'udpate': {
    //   console.log('\nupdating document...');
    //   const updateArgs = Object.assign({}, event.body);
    //   delete updateArgs.databaseName;
    //   delete updateArgs.operationName;
    //   delete updateArgs.collectionName;
    //   dbModel
    //   .findByIdAndUpdate(event.body.id, { $set: updateArgs }, { new: true })
    //   .then((updatedDoc) => {
    //     console.log('\nSuccessfully udpated Document _id: ', updatedDoc._id, '\nUpdated Doc: ', JSON.stringify(updatedDoc, null, 2));
    //     resolve(updatedDoc);
    //   })
    //   .catch((error) => {
    //     console.log('\nERROR while trying to update document with _id: ', event.body.id, '\nCheck arguments: ', JSON.stringify(updateArgs, null, 2));
    //     reject(error);
    //   });
    // } break;
    default: {
      console.log('\n\nNo operation executed.  Verify input arguments.');
      reject('No operation executed.  Verify input arguments.');
    }
  }
  reject(`operationName: ${operationName} does not exist.`);
});
