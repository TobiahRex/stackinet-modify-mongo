/* eslint-disable no-use-before-define, no-console, import/newline-after-import */
import AWS from 'aws-sdk';
import { Promise as bbPromise } from 'bluebird';
import isEmail from 'validator/lib/isEmail';
import emailSchema from '../schemas/email';
import config from '../../..//config.json';

AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.sesEmailRegion,
});

const ses = new AWS.SES();

export default (db) => {
  /**
  * 1) Validate required fields exist.
  * 2) Create a new email.
  *
  * @param {object} fields - Required fields for creating new Email.
  *
  * @return {object} - Promise: resolved - Email details.
  */
  emailSchema.statics.dropCollection  = collectionName =>
  new Promise((resolve, reject) => {
    console.log('\nDropping ', collectionName, ' collection...');

    return bbPromise.fromCallback(cb => Email.remove({}, cb))
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
  * 2) Create a new email.
  *
  * @param {object} fields - Required fields for creating new Email.
  *
  * @return {object} - Promise: resolved - Email details.
  */
  emailSchema.statics.createEmail = fields =>
  new Promise((resolve, reject) => {
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
      reject({ error: 'Missing required fields to create a new Email.', ...fields });
    } else {
      bbPromise.fromCallback(cb => Email.create({ ...fields }, cb))
      .then((newEmail) => {
        console.log('\nSuccessfully created new Email!\n _id: ', newEmail._id);
        resolve(newEmail);
      });
    }
  });

  emailSchema.statics.removeOne = ({ id }) =>
  new Promise((resolve, reject) => {
    if (!eventBody) return reject(`Missing required arguments. "id": ${id || 'undefined'}`);

    Email
    .findByIdAndRemove(event.body.id)
    .exec()
    .then((deletedDoc) => {
      console.log('\nSuccessfully removed _id: ', deletedDoc._id);
      resolve(deletedDoc);
    })
    .catch((error) => {
      console.log('\nCould not delete Document with _id: ', event.body.id, '\nERROR: ', error);
    });
  });

  emailSchema.statics.updateDoc = (eventBody) =>
  new Promise((resolve, reject) => {
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

    Email
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

  console.log('\n\nCreating Email collection...');
  const Email = db.model('Email', emailSchema);
  return Email;
};
