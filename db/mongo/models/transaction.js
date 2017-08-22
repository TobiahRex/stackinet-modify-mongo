/* eslint-disable no-use-before-define, no-console, import/newline-after-import */
import { Promise as bbPromise } from 'bluebird';
import transactionSchema from '../schemas/Transaction';

export default (db) => {
  /**
  * 1) Remove all documents instances.
  *
  * @param {string} collectionName - name of collection - only used to Verify operation accuracy with console.logs.
  *
  * @return {object} - Promise: resolved - Transaction details.
  */
  transactionSchema.statics.dropCollection  = collectionName =>
  new Promise((resolve, reject) => {
    console.log('\n\n@Transaction.dropCollection');

    return bbPromise.fromCallback(cb => Transaction.remove({}, cb))
    .then((result) => {
      console.log('\nSuccessfully removed all Documents on the ', collectionName, ' collection.\nResult: ', result);
      resolve(result);
    })
    .catch((error) => {
      console.log('\nERROR trying to drop collection ', collectionName);
      reject(error);
    });
  });
  /**
  * 1) Validate required fields exist.
  * 2) Create a new Transaction.
  *
  * @param {object} fields - Required fields for creating new Transaction.
  *
  * @return {object} - Promise: resolved - Transaction details.
  */
  transactionSchema.statics.createTransaction = fields =>
  new Promise((resolve, reject) => {
  console.log('\n\n@Transaction.createTransaction');

    if (!fields) return reject(`Missing required arguments. "fields": ${fields || 'undefined'}`);

    const {
      type,
      purpose,
      language,
      subjectData,
      bodyHtmlData,
      bodyTextData,
      replyToAddress,
    } = fields;

    if (!type || !purpose || !language || !replyToAddress || !subjectData || !bodyHtmlData || !bodyTextData) {
      reject({ error: 'Missing required fields to create a new Transaction.', ...fields });
    } else {
      bbPromise.fromCallback(cb => Transaction.create({ ...fields }, cb))
      .then((newTransaction) => {
        console.log('\nSuccessfully created new Transaction!\n _id: ', newTransaction._id);
        resolve(newTransaction);
      });
    }
  });

  transactionSchema.statics.removeOne = ({ id }) =>
  new Promise((resolve, reject) => {
    console.log('\n\n@Transaction.removeOne');

    if (!id) return reject(`Missing required arguments. "id": ${id || 'undefined'}`);

    Transaction
    .findByIdAndRemove(id)
    .exec()
    .then((deletedDoc) => {
      console.log('\nSuccessfully removed _id: ', deletedDoc._id);
      resolve(deletedDoc);
    })
    .catch((error) => {
      console.log(`Error trying to remove document with _id "${id}"`);
      reject(`Error trying to remove document with _id "${id}"`);
    });
  });

  transactionSchema.statics.updateDoc = (eventBody) =>
  new Promise((resolve, reject) => {
    console.log('\n\n@Transaction.updateDoc');

    if (!eventBody) return reject(`Missing required arguments. "eventBody": ${eventBody || 'undefined'}`);

    delete eventBody.collectionName;
    delete eventBody.databaseName;
    delete eventBody.operationName;

    const updateArgs = Object.assign({}, eventBody);
    Object.keys(updateArgs)
    .forEach(key => {
      if (/\[\]/gi.test(updateArgs[key])) {
        try {
          updateArgs[key] = JSON.parse(updateArgs[key]);
        } catch (error) {
          reject(`ERROR while trying to parse input string array into array literal.  ERROR = ${error}.`);
          return null;
        }
      }
    });

    Transaction
    .findByIdAndUpdate({ _id: eventBody.id }, { $set: updateArgs }, { new: true })
    .exec()
    .then((result) => {
      console.log(`Successfully updated collection ${eventBody.collectionName}.  RESULT = ${result}`);
      return resolve(result);
    })
    .catch((error) => {
      console.log(`Error trying to update collection "${eventBody.collectionName}".  ERROR = ${error}`);
      return reject(error);
    });
  });

  console.log('\n\nCreating Transaction collection...');
  const Transaction = db.model('Transaction', transactionSchema);
  return Transaction;
};
