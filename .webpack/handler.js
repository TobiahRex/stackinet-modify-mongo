(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _extends2 = __webpack_require__(1);

	var _extends3 = _interopRequireDefault(_extends2);

	var _stringify = __webpack_require__(2);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _bluebird = __webpack_require__(3);

	var _handleModification = __webpack_require__(4);

	var _handleModification2 = _interopRequireDefault(_handleModification);

	var _connection = __webpack_require__(7);

	var _connection2 = _interopRequireDefault(_connection);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	if (!global._babelPolyfill) __webpack_require__(27);

	module.exports.modify = function (event, context) {
	  console.log('\nEVENT: ', (0, _stringify2.default)(event, null, 2));

	  if (!event.body.databaseName || !event.body.collectionName || !event.body.operationName) {
	    return context.fail({ message: 'Missing required arguments.' }) && context.done();
	  }

	  (0, _connection2.default)(event.body.databaseName).then(function (dbCollections) {
	    console.log('\nSuccessfully retrieved ', event.body.collectionName.toUpperCase(), ' on DB: ', event.body.databaseName.toUpperCase());
	    (0, _handleModification2.default)((0, _extends3.default)({ event: event }, dbCollections));
	  }).then(function (result) {
	    return context.succeed((0, _stringify2.default)({ message: (0, _extends3.default)({}, result) })) && context.done();
	  }).catch(function (error) {
	    console.log('\nFINAL ERROR: \n', (0, _stringify2.default)(error, null, 2));
	    return context.fail((0, _stringify2.default)((0, _extends3.default)({ message: 'Mongo Cluster modification failed' }, error))) && context.done();
	  });
	};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = require("babel-runtime/helpers/extends");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = require("babel-runtime/core-js/json/stringify");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = require("bluebird");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _stringify = __webpack_require__(2);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _extends2 = __webpack_require__(1);

	var _extends3 = _interopRequireDefault(_extends2);

	var _assign = __webpack_require__(5);

	var _assign2 = _interopRequireDefault(_assign);

	var _promise = __webpack_require__(6);

	var _promise2 = _interopRequireDefault(_promise);

	var _bluebird = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	* 1) Dynamically create, update, or delete Documents on Mongo Collections.
	*
	* @param {object} event - Lambda event object.
	* - Keys: operationName, collectionName, {other Args for operation.}
	* @param {object} <Collections> - Mongo Collections containing documents to be mutated or created.
	*
	* @return {object} modified Document - Promises: resolved.
	*/
	exports.default = function (_ref) {
	  var event = _ref.event,
	      dbModels = _ref.dbModels;
	  return new _promise2.default(function (resolve, reject) {
	    console.log('\nSTART: Handling modification...');
	    var _event$body = event.body,
	        operationName = _event$body.operationName,
	        collectionName = _event$body.collectionName;


	    switch (operationName) {
	      case 'dropCollection':
	        {
	          dbModels[collectionName].remove({}).exec().then(function (result) {
	            console.log('\nSuccessfully removed all Documents on the ', collectionName, ' collection.\nResult: ', result);
	            resolve(result);
	          }).catch(function (error) {
	            console.log('\nERROR trying to drop collection ', collectionName);
	            reject(error);
	          });
	        };break;

	      case 'delete':
	        {
	          dbModels[collectionName].findByIdAndRemove(event.body.id).exec().then(function (deletedDoc) {
	            console.log('\nSuccessfully removed _id: ', deletedDoc._id);
	            resolve(deletedDoc);
	          }).catch(function (error) {
	            console.log('\nCould not delete Document with _id: ', event.body.id);
	          });
	        };break;

	      case 'create':
	        {
	          var createArgs = (0, _assign2.default)({}, event.body);
	          delete createArgs.operationName;
	          delete createArgs.collectionName;
	          _bluebird.Promise.fromCallback(function (cb) {
	            return dbModels[collectionName].create((0, _extends3.default)({}, createArgs));
	          }).then(function (newDoc) {
	            console.log('Successfully create a new document on collection: ', event.body.collectionName);
	            resolve(newDoc);
	          }).catch(function (error) {
	            console.log('\nERROR while trying to create a new document.\nCheck arguments: ', JSOn.stringify(createArgs, null, 2));
	            reject(error);
	          });
	        };break;

	      case 'udpate':
	        {
	          dbModels[collectionName].findByIDAndUpdate(event.body.id, { $set: updateArgs }, { new: true }).then(function (updatedDoc) {
	            console.log('\nSuccessfully udpated Document _id: ', updatedDoc._id, '\nUpdated Doc: ', (0, _stringify2.default)(updatedDoc, null, 2));
	            resolve(updatedDoc);
	          }).catch(function (error) {
	            console.log('\nERROR while trying to update document with _id: ', event.body.id, '\nCheck arguments: ', (0, _stringify2.default)(updateArgs, null, 2));
	            reject(error);
	          });
	        };break;
	    }
	  });
	};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/assign");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = require("babel-runtime/core-js/promise");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends2 = __webpack_require__(1);

	var _extends3 = _interopRequireDefault(_extends2);

	var _promise = __webpack_require__(6);

	var _promise2 = _interopRequireDefault(_promise);

	var _mongoose = __webpack_require__(8);

	var _mongoose2 = _interopRequireDefault(_mongoose);

	var _email = __webpack_require__(9);

	var _email2 = _interopRequireDefault(_email);

	var _complaint = __webpack_require__(14);

	var _complaint2 = _interopRequireDefault(_complaint);

	var _marketHero = __webpack_require__(16);

	var _marketHero2 = _interopRequireDefault(_marketHero);

	var _product = __webpack_require__(21);

	var _product2 = _interopRequireDefault(_product);

	var _user = __webpack_require__(25);

	var _user2 = _interopRequireDefault(_user);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint-disable no-console, no-constant-condition, no-unused-vars */
	_mongoose2.default.Promise = _promise2.default;
	var dotenv = __webpack_require__(20).config({ silent: true }); //eslint-disable-line
	var lonesmokeMongo = process.env.LONESMOKE_MONGO_URI;
	var nj2jpMongo = process.env.NJ2JP_MONGO_URI;

	if (!lonesmokeMongo || !nj2jpMongo) {
	  console.log('Lonesmoke MONGO value is: ' + (lonesmokeMongo ? lonesmokeMongo : 'undefined'));
	  console.log('Nj2jp MONGO value is: ' + (lonesmokeMongo ? lonesmokeMongo : 'undefined'));
	}

	var cachedDb = {
	  lonesmokeConnection: null,
	  nj2jpConnection: null,
	  lonesmokeDbModels: {
	    Email: null,
	    Complaint: null,
	    MarketHero: null
	  },
	  nj2jpDbModels: {
	    User: null,
	    Email: null,
	    Transactions: null
	  }
	};

	var verifyDb = function verifyDb(dbName) {
	  return new _promise2.default(function (resolve, reject) {
	    switch (dbName.toLowerCase()) {
	      case 'lonesmoke':
	        {
	          if (cachedDb.lonesmokeConnection && cachedDb.lonesmokeConnection._readyState === 1) {
	            console.log('cachedDb.lonesmokeConnection._readyState: ', cachedDb.lonesmokeConnection._readyState, '\nFound previous LONESMOKE CONNECTION\n', '\nCurrent Connections: ', cachedDb.lonesmokeConnection.base.connections);
	            resolve(cachedDb.lonesmokeDbModels);
	          } else {
	            var connection = _mongoose2.default.createConnection(lonesmokeMongo, console.log);
	            console.log('CREATED NEW Lonesmoke CONNECTION: ', connection, '\n\nmongoose.lonesmokeConnection.readyState: ', connection._readyState, '\n\nAll Lonesmoke Connections:', connection.base);

	            cachedDb = (0, _extends3.default)({}, cacheDB, {
	              loneSmokeConnection: connection
	              // lonesmokeDbModels: {
	              //   Email: createEmailModel(connection),
	              //   Complaint: createComplaintModel(connection),
	              //   MarketHero: createMarketHeroModel(connection),
	              // }
	            });
	            console.log('\nSaved ', dbName, ' to "cachedDb".\ncachedDb: ', cachedDb);
	            resolve(cachedDb.lonesmokeDbModels);
	          }
	        };break;
	      case 'nj2jp':
	        {
	          if (cachedDb.nj2jpConnection && cachedDb.nj2jpConnection._readyState === 1) {
	            console.log('cachedDb.nj2jpConnection._readyState: ', cachedDb.nj2jpConnection._readyState, '\nFound previous Nj2jp CONNECTION\n', '\nCurrent NJ2JP Connections: ', cachedDb.nj2jpConnection.base.connections);
	            resolve(cachedDb.nj2jpDbModels);
	          } else {
	            var _connection = _mongoose2.default.createConnection(MONGO_DB, console.log);
	            console.log('CREATED NEW CONNECTION: ', _connection, '\nmongoose.connection.readyState: ', _connection._readyState, '\nAll Connections:', _connection.base);

	            cachedDb = (0, _extends3.default)({}, cacheDB, {
	              nj2jpConnection: _connection,
	              nj2jpDbModels: {
	                User: (0, _user2.default)(_connection),
	                Product: (0, _product2.default)(_connection)
	              }
	            });
	            console.log('\nSaved ', dbName, ' to "cachedDb".');
	            resolve(cachedDb.nj2jpDbModels);
	          }
	        };break;
	      default:
	        {
	          console.log('\nError that db name did not match any databases in the Stakinet cluster.');
	          reject('That dbName did not match any databases in the Stakinet cluster.');
	        };break;
	    }
	  });
	};

	exports.default = verifyDb;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports = require("mongoose");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _stringify = __webpack_require__(2);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _extends2 = __webpack_require__(1);

	var _extends3 = _interopRequireDefault(_extends2);

	var _promise = __webpack_require__(6);

	var _promise2 = _interopRequireDefault(_promise);

	var _awsSdk = __webpack_require__(10);

	var _awsSdk2 = _interopRequireDefault(_awsSdk);

	var _bluebird = __webpack_require__(3);

	var _isEmail = __webpack_require__(11);

	var _isEmail2 = _interopRequireDefault(_isEmail);

	var _email = __webpack_require__(12);

	var _email2 = _interopRequireDefault(_email);

	var _config = __webpack_require__(13);

	var _config2 = _interopRequireDefault(_config);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	_awsSdk2.default.config.update({
	  accessKeyId: _config2.default.aws.accessKeyId,
	  secretAccessKey: _config2.default.aws.secretAccessKey,
	  region: _config2.default.aws.sesEmailRegion
	}); /* eslint-disable no-use-before-define, no-console, import/newline-after-import */


	var ses = new _awsSdk2.default.SES();

	exports.default = function (db) {
	  /**
	  * 1) Validate required fields exist.
	  * 2) Create a new email.
	  *
	  * @param {object} fields - Required fields for creating new Email.
	  *
	  * @return {object} - Promise: resolved - Email details.
	  */
	  _email2.default.statics.createEmail = function (fields) {
	    return new _promise2.default(function (resolve, reject) {
	      var type = fields.type,
	          purpose = fields.purpose,
	          language = fields.language,
	          subjectData = fields.subjectData,
	          bodyHtmlData = fields.bodyHtmlData,
	          bodyTextData = fields.bodyTextData,
	          replyToAddress = fields.replyToAddress;


	      if (!type || !purpose || !language || !replyToAddress || !subjectData || !bodyHtmlData || !bodyTextData) {
	        reject((0, _extends3.default)({ error: 'Missing required fields to create a new Email.' }, fields));
	      } else {
	        _bluebird.Promise.fromCallback(function (cb) {
	          return Email.create((0, _extends3.default)({}, fields), cb);
	        }).then(function (newEmail) {
	          console.log('\nSuccessfully created new Email!\n _id: ', newEmail._id);
	          resolve(newEmail);
	        });
	      }
	    });
	  };

	  /**
	  * 1) Find all emails with type.
	  * 2) Filter results by request language.
	  *
	  * @param {string} type - The email type to find.
	  * @param {string} requestedLangauge - The language to filter by.
	  *
	  * @return {object} - Promise: resolved - Email details.
	  */
	  _email2.default.statics.findEmailAndFilterLanguage = function (type, reqLanguage) {
	    return new _promise2.default(function (resolve, reject) {
	      Email.find(type).exec().then(function (dbEmails) {
	        console.log('\nFound the following emails with type: ', type, '\ndbEmails: ', dbEmails);
	        if (!dbEmails) {
	          console.log('Error: \nDid not find any emails with type: "', type, '"');
	          reject({ type: 'error', problem: 'Did not find any emails with type: ' + type });
	        }

	        var foundEmail = dbEmails.filter(function (dbEmail) {
	          return dbEmail.language === reqLanguage;
	        })[0];

	        if (!foundEmail) {
	          console.log('Error: \nDid not find email with language: "', reqLanguage, '"');
	          reject({ type: 'error', problem: 'After filtering emails of type "' + type + '", there was no email that matched language: "' + reqLanguage + '"' });
	        }
	        resolve(foundEmail);
	      }).catch(function (error) {
	        console.log('Could not filter emails: ', error);
	        reject({ type: 'error', problem: (0, _extends3.default)({}, error) });
	      });
	    });
	  };

	  /**
	  * 1) Determine if the userEmail has already been sent a discount by checking Market Hero collection.
	  * 2a) If found, send a Rejection Email.
	  * 2b) If not found, verify user has not added classified our application emails as "spam" since last message had been sent.
	  * 3a) If email has not been added to Complaint collection, send the user a Discount email.
	  *
	  * @param {string} to - recipients email address.
	  * @param {object} emailDoc - Mongo Email collection, Document.
	  *
	  * @return {object} - Promise: resolved - email type sent.
	  */
	  _email2.default.statics.sendEmail = function (to, emailDoc) {
	    return new _promise2.default(function (resolve, reject) {
	      if (!(0, _isEmail2.default)(to)) {
	        console.log('ERROR @ sendEmail: \n\'', to, '\' is not a valid email address.');
	        reject({ error: true, problem: 'Did not submit a valid email address. Please try again.' });
	      }

	      var emailParams = {
	        Destination: {
	          ToAddresses: [to]
	        },
	        Source: emailDoc.replyToAddress,
	        ReplyToAddresses: [emailDoc.replyToAddress],
	        Message: {
	          Body: {
	            Html: {
	              Data: emailDoc.bodyHtmlData,
	              Charset: emailDoc.bodyHtmlCharset
	            },
	            Text: {
	              Data: emailDoc.bodyTextData,
	              Charset: emailDoc.bodyTextCharset
	            }
	          },
	          Subject: {
	            Data: emailDoc.subjectData,
	            Charset: emailDoc.subjectCharset
	          }
	        }
	      };

	      console.log('\nSending AWS ses email...');
	      _bluebird.Promise.fromCallback(function (cb) {
	        return ses.sendEmail(emailParams, cb);
	      }).then(function (data) {
	        console.log('\nSuccessfully sent SES email: \n', data, '\nSaving record of email sent to Email Document...');
	        emailDoc.sentEmails.push({ messageId: data.MessageId });
	        emailDoc.save({ new: true }).then(function (savedEmail) {
	          console.log('\nSuccessfully updated "messageId" with value: \n', savedEmail.sentEmails.pop().messageId);

	          resolve({
	            statusCode: 200,
	            body: (0, _stringify2.default)({ message: 'Mail sent successfully.' })
	          });
	        });
	      }).catch(function (error) {
	        console.log('\nERROR sending SES email with type: "', emailDoc.type, '"\nError = ', error, '\n', error.stack);
	        reject({ error: true, problem: (0, _extends3.default)({}, error) });
	      });
	    });
	  };
	  console.log('\n\nCreating Email collection...');
	  var Email = db.model('Email', _email2.default);
	  return Email;
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	module.exports = require("aws-sdk");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	module.exports = require("validator/lib/isEmail");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Schema = __webpack_require__(8).Schema;

	var ObjectId = exports.ObjectId = Schema.Types.ObjectId;

	var emailSchema = new Schema({
	  type: { type: String, required: true },
	  created: { type: Date, default: Date.now },
	  purpose: { type: String, required: true },
	  language: { type: String, required: true },
	  replyToAddress: { type: String, required: true },
	  subjectData: { type: String, required: true },
	  subjectCharset: { type: String, default: 'utf8' },
	  bodyHtmlData: { type: String, required: true },
	  bodyHtmlCharset: { type: String, default: 'utf8' },
	  bodyTextData: { type: String, requried: true },
	  bodyTextCharset: { type: String, default: 'utf8' },
	  sentEmails: [{
	    messageId: { type: String },
	    sesStatus: { type: String }
	  }]
	});
	exports.default = emailSchema;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	module.exports = {
		"aws": {
			"accessKeyId": "AKIAJUPLOWQUBUVQLKCQ",
			"secretAccessKey": "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",
			"region": "ap-northeast-1"
		}
	};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _promise = __webpack_require__(6);

	var _promise2 = _interopRequireDefault(_promise);

	var _isEmail = __webpack_require__(11);

	var _isEmail2 = _interopRequireDefault(_isEmail);

	var _complaint = __webpack_require__(15);

	var _complaint2 = _interopRequireDefault(_complaint);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint-disable no-use-before-define, no-console */
	exports.default = function (db) {
	  /**
	  * 1) Verifies email - 2) If valid, saved email to Complaint collection:
	  * Purpose: Have a record of emails that have tagged this apps Emails as "Spam" so as to never send again.
	  *
	  * @param {string} email - Email data.
	  *
	  * @return {object} - Promise resolved with data.
	  */
	  _complaint2.default.statics.addEmailComplaint = function (email) {
	    return new _promise2.default(function (resolve, reject) {
	      if (!(0, _isEmail2.default)(email)) {
	        reject({ type: 'error', problem: email + ' - Is not a valid email.' });
	      }
	      Complaint.find({}).exec().then(function (dbComplaints) {
	        return dbComplaints.emails.push({ address: email, created: new Date() }).save();
	      }).then(function () {
	        console.log('Successfully saved ', email, ' to Complaints list.');
	        resolve();
	      });
	    });
	  };
	  console.log('\n\nCreating Compaint collection...');
	  var Complaint = db.model('Complaint', _complaint2.default);
	  return Complaint;
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Schema = __webpack_require__(8).Schema;

	var complaintSchema = new Schema({
	  emails: {
	    email: { type: String, required: true },
	    created: { type: Date, default: Date.now },
	    messageId: { type: String, required: true }
	  }
	});
	exports.default = complaintSchema;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends2 = __webpack_require__(1);

	var _extends3 = _interopRequireDefault(_extends2);

	var _stringify = __webpack_require__(2);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _toConsumableArray2 = __webpack_require__(17);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _promise = __webpack_require__(6);

	var _promise2 = _interopRequireDefault(_promise);

	var _axios = __webpack_require__(18);

	var _axios2 = _interopRequireDefault(_axios);

	var _bluebird = __webpack_require__(3);

	var _marketHero = __webpack_require__(19);

	var _marketHero2 = _interopRequireDefault(_marketHero);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(20).load({ silent: true }); /* eslint-disable no-use-before-define, no-console, import/newline-after-import */

	exports.default = function (db) {
	  /**
	  * 1) Determines if email is already saved to MarketHero collection.
	  *
	  * @param string userEmail - Email data.
	  *
	  * @return {object} - Promise: resolved - user info if found || nothing if not found.
	  */
	  _marketHero2.default.statics.checkForLead = function (userEmail) {
	    return new _promise2.default(function (resolve, reject) {
	      MarketHero.findOne({ 'lead.email': userEmail }).exec().then(resolve).catch(reject);
	    });
	  };

	  /**
	  * 1) Determines whether @param "tag" is an array or single string.
	  * 2) Calls MarketHero API, and creates new lead & adds tag(s) to new that lead.
	  * 3a) Returns resolved Promise.
	  * 3b) Returns error object { type: 'error', problem: {desc} }
	  *
	  * @param string userEmail - Email data.
	  * @param string || [array] tag -  Tag data || Tags Data.
	  *
	  * @return {object} - Promise: resolved - no data.
	  */
	  _marketHero2.default.statics.createApiLead = function (userEmail, tag) {
	    return new _promise2.default(function (resolve, reject) {
	      var tagInfo = null;

	      if (Array.isArray(tag)) tagInfo = [].concat((0, _toConsumableArray3.default)(tag));else tagInfo = tag;

	      var reqBody = {
	        apiKey: process.env.MARKET_HERO_API_KEY,
	        firstName: 'John',
	        lastName: 'Doe',
	        email: userEmail,
	        tags: tagInfo
	      };
	      _axios2.default.post('https://api.markethero.io/v1/api/tag-lead', (0, _stringify2.default)(reqBody), {
	        headers: {
	          'Content-Type': 'application/json'
	        }
	      }).then(function (res) {
	        console.log('\nSuccessfully posted to Market Hero: \nMarket Hero reponse: ', res);
	        if (res.status !== 200) {
	          console.log('\n          Market Hero API Error:\n          Cannot update lead# ' + userEmail + ';\n          Response: ' + (0, _stringify2.default)(res) + '\n        ');
	          reject({ type: 'error', problem: (0, _extends3.default)({}, res) });
	        }
	        console.log('\n        Market Hero API Success:\n        Created/Updated "' + userEmail + '".\n        Response: ' + (0, _stringify2.default)(res) + '\n      ');
	      }).catch(function (error) {
	        console.log('\nError trying to saved Lead to market Hero: ', error);
	        reject({ type: 'error', problem: (0, _extends3.default)({}, error) });
	      });
	    });
	  };

	  /**
	  * 1) Determines whether @param "tag" is an array or single string.
	  * 2) Creates new MarketHero document in Mongo Cluster..
	  * 3) Returns Resolved Promise.
	  * 3b) Returns
	  *
	  * @param {string} userEmail - Email data.
	  * @param {string || array} tag - Tag data.
	  *
	  * @return {object} - Promise: resolved - no data.
	  */
	  _marketHero2.default.statics.createMongoLead = function (userEmail, tag) {
	    return new _promise2.default(function (resolve, reject) {
	      var tagInfo = null;

	      if (Array.isArray(tag)) tagInfo = [].concat((0, _toConsumableArray3.default)(tag));else tagInfo = tag;

	      _bluebird.Promise.fromCallback(function (cb) {
	        return MarketHero.create({
	          lead: { email: userEmail },
	          tags: Array.isArray(tagInfo) ? [].concat((0, _toConsumableArray3.default)(tagInfo)) : [tagInfo]
	        }, cb);
	      }).then(function (newLead) {
	        console.log('\n        Created new lead in Mongo Database.\n        New Lead: ' + newLead + '\n      ');
	        resolve(newLead);
	      }).catch(function (error) {
	        console.log('\n        Could not create new Lead in Mongo Database.\n        ERROR: ' + error + '\n      ');
	        reject({ type: 'error', problem: (0, _extends3.default)({}, error) });
	      });
	    });
	  };
	  console.log('\n\nCreating MarketHero collection...');
	  var MarketHero = db.model('MarketHero', _marketHero2.default);
	  return MarketHero;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	module.exports = require("babel-runtime/helpers/toConsumableArray");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	module.exports = require("axios");

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Schema = __webpack_require__(8).Schema;

	var ObjectId = exports.ObjectId = Schema.Types.ObjectId;
	var marketHeroSchema = new Schema({
	  lead: {
	    email: { type: String, required: true },
	    date: { type: Date, default: Date.now },
	    firstName: { type: String, default: 'John' },
	    lastName: { type: String, default: 'Doe' }
	  },
	  tags: [{
	    name: { type: String },
	    description: { type: String },
	    date: { type: Date }
	  }]
	});
	exports.default = marketHeroSchema;
	/* Schema Breakdown.
	  "leads": Leads is an array of all the leads in the LoneSmoke database.

	  "tags": Tags is the an array of all the existing tags currently in existence.
	  - name: The name of the tag. e.g. "!beachDiscount"
	  - description: The details behind why the tag exists and it's purpose. e.g. "This customer signed up to receive a 10% discount from Zushi Beach".
	  - date: The date that this tag was created.
	*/

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	module.exports = require("dotenv");

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _defineProperty2 = __webpack_require__(22);

	var _defineProperty3 = _interopRequireDefault(_defineProperty2);

	var _keys = __webpack_require__(23);

	var _keys2 = _interopRequireDefault(_keys);

	var _stringify = __webpack_require__(2);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _toConsumableArray2 = __webpack_require__(17);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _promise = __webpack_require__(6);

	var _promise2 = _interopRequireDefault(_promise);

	var _bluebird = __webpack_require__(3);

	var _product = __webpack_require__(24);

	var _product2 = _interopRequireDefault(_product);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint-disable no-use-before-define, no-console */
	exports.default = function (db) {
	  _product2.default.statics.findProductsByFlavor = function (flavor) {
	    return new _promise2.default(function (resolve, reject) {
	      Product.find({ 'product.flavor': flavor }).exec().then(function (dbProducts) {
	        console.log('\n        Found ' + dbProducts.length + ' popular product(s) with Flavor: "' + flavor + '"!\n      ');
	        resolve(dbProducts);
	      }).catch(function (error) {
	        reject({
	          problem: 'Could not find any products with flavor ' + flavor + '.\n\n        Mongo Error = ' + error
	        });
	      });
	    });
	  };

	  _product2.default.statics.fetchMultiple = function (ids) {
	    return new _promise2.default(function (resolve, reject) {
	      if (!ids.length) {
	        resolve([]);
	      } else {
	        Product.find({ _id: { $in: [].concat((0, _toConsumableArray3.default)(ids)) } }).exec().then(function (dbProducts) {
	          console.log('Found multiple Products.: ', dbProducts);
	          resolve(dbProducts);
	        }).catch(function (error) {
	          return reject('\n        problem: Could not fetch multiple products.\n\n        Mongo Error = ' + error + '.\n      ');
	        });
	      }
	    });
	  };

	  _product2.default.statics.findProductByIdAndDelete = function (_id) {
	    return new _promise2.default(function (resolve, reject) {
	      Product.findByIdAndRemove(_id).exec().then(resolve).catch(function (error) {
	        return reject({
	          problem: 'Could not create a delete product with _id:' + _id + '.  Verify the id is valid.\n      Mongoose Error = ' + error
	        });
	      });
	    });
	  };

	  _product2.default.statics.createProduct = function (product, statistics) {
	    return new _promise2.default(function (resolve, reject) {
	      _bluebird.Promise.fromCallback(function (cb) {
	        return Product.create({ product: product, statistics: statistics }, cb);
	      }).then(function (newProduct) {
	        console.log('\n//mongo/model/product.js\n @ createProduct RESOLVE\n', newProduct);
	        resolve(newProduct);
	      }).catch(function (error) {
	        reject({
	          problem: 'Could not create a new product with this product object: ' + (0, _stringify2.default)({ product: product }, null, 2) + '\n        Mongoose Error = ' + error
	        });
	      });
	    });
	  };

	  _product2.default.statics.findProductById = function (_id) {
	    return new _promise2.default(function (resolve, reject) {
	      Product.findById(_id).exec().then(function (dbProduct) {
	        console.log('\n//mongo/model/product.js\n @ findProductById RESOLVE\n', dbProduct);
	        resolve(dbProduct);
	      }).catch(function (error) {
	        reject({
	          problem: 'Could not find the product with id ' + _id + '.  Are you sure that product exists?\n        Mongo Error = ' + error
	        });
	      });
	    });
	  };

	  _product2.default.statics.findProductAndUpdate = function (_id, productObj) {
	    return new _promise2.default(function (resolve, reject) {
	      var newProductObj = {};
	      (0, _keys2.default)(productObj).map(function (key) {
	        if (key === 'images') {
	          var imageKeys = [];
	          var imageObjs = [];
	          productObj.images.forEach(function (imageObj, i) {
	            imageKeys.push('product.images[' + i + ']');
	            imageObjs.push(imageObj);
	          });
	          return imageKeys.map(function (newKey, i) {
	            return (0, _defineProperty3.default)({}, newKey, imageObjs[i]);
	          });
	        }
	        var newKey = 'product.' + key;
	        var value = productObj[key];
	        return (0, _defineProperty3.default)({}, newKey, value);
	      }).forEach(function (object) {
	        var key = (0, _keys2.default)(object)[0];
	        newProductObj[key] = object[key];
	      });

	      console.log('\nnewProductObj: ', newProductObj);

	      Product.findByIdAndUpdate(_id, { $set: newProductObj }, { new: true }).exec().then(function (updatedProduct) {
	        console.log('\n        Updated Product!: ' + _id + ';\n        ');
	        resolve(updatedProduct);
	      }).catch(function (error) {
	        return reject({
	          problem: 'Could not find the product with id ' + _id + '. Are you sure that product exists?\n      Mongo Error = ' + error
	        });
	      });
	    });
	  };

	  _product2.default.statics.getPopularProducts = function (qty) {
	    return new _promise2.default(function (resolve, reject) {
	      Product.aggregate([{ $group: {
	          _id: '$product.flavor',
	          docId: { $first: '$_id' },
	          title: { $first: '$product.title' },
	          routeTag: { $first: '$product.routeTag' },
	          images: { $first: '$product.images' },
	          completedCheckouts: { $first: '$statistics.completed_checkouts' }
	        } }, { $sort: { completedCheckouts: -1 } }, { $limit: qty }]).exec().then(function (dbProducts) {
	        console.log('\n        Found the following products: ' + (0, _stringify2.default)(dbProducts, null, 2) + '\n      ');
	        resolve(dbProducts);
	      }).catch(function (error) {
	        return reject({
	          problem: 'Could not fetch the ' + qty + ' products you requested.\n      Mongo Error = ' + error
	        });
	      });
	    });
	  };

	  console.log('\n\nCreating Product collection...');
	  var Product = db.model('Product', _product2.default);
	  return Product;
	};

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	module.exports = require("babel-runtime/helpers/defineProperty");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	module.exports = require("babel-runtime/core-js/object/keys");

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Schema = __webpack_require__(8).Schema;

	var ObjectId = exports.ObjectId = Schema.Types.ObjectId;
	var productSchema = new Schema({
	  product: {
	    mainTitle: {
	      type: String,
	      required: true
	    },
	    title: {
	      type: String,
	      required: true
	    },
	    flavor: {
	      type: String,
	      required: true
	    },
	    price: {
	      type: String,
	      required: true,
	      default: 30
	    },
	    sku: {
	      type: String,
	      required: true
	    },
	    size: {
	      type: Number,
	      enum: [30, 60, 120],
	      required: true
	    },
	    nicotineStrength: {
	      type: Number,
	      enum: [2, 4, 6, 8, 10, 12, 14, 16, 18],
	      required: true
	    },
	    images: [{
	      purpose: {
	        type: String,
	        required: true
	      },
	      url: {
	        type: String,
	        required: true
	      }
	    }],
	    routeTag: {
	      type: String,
	      required: true
	    },
	    vendor: { type: String },
	    blurb: {
	      type: String,
	      required: true
	    },
	    dates: {
	      added_to_store: {
	        type: Date,
	        default: Date.now
	      },
	      removed_from_store: {
	        type: Date
	      }
	    },
	    quantities: {
	      available: { type: Number },
	      in_cart: { type: Number }
	    }
	  },
	  reviews: [{
	    reviews_id: { type: ObjectId, ref: 'Reviews' },
	    user_id: { type: ObjectId, ref: 'User' }
	  }],
	  distribution: {
	    restock_threshold: {
	      type: Number,
	      default: 500
	    },
	    restock_amount: {
	      type: Number,
	      default: 500
	    },
	    last_replenishment: [{
	      date: {
	        type: Date
	      },
	      amount: {
	        type: Number,
	        default: 500
	      }
	    }],
	    wholesale_price: { type: Number }
	  },
	  statistics: {
	    adds_to_cart: { type: Number },
	    completed_checkouts: { type: Number },
	    transactions: [{
	      transaction_id: { type: ObjectId, ref: 'Transaction' },
	      user_id: { type: ObjectId, ref: 'User' }
	    }]
	  }
	});
	exports.default = productSchema;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _toConsumableArray2 = __webpack_require__(17);

	var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

	var _extends2 = __webpack_require__(1);

	var _extends3 = _interopRequireDefault(_extends2);

	var _promise = __webpack_require__(6);

	var _promise2 = _interopRequireDefault(_promise);

	var _bluebird = __webpack_require__(3);

	var _user = __webpack_require__(26);

	var _user2 = _interopRequireDefault(_user);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint-disable no-use-before-define, no-console */
	exports.default = function (db) {
	  _user2.default.statics.fetchUserProfile = function (userId) {
	    return new _promise2.default(function (resolve, reject) {
	      User.findById(userId).exec().then(function (dbUser) {
	        console.log('\n        User Found: ' + dbUser._id + '\n        Sending updated profile to Client.\n      ');
	        resolve(dbUser);
	      }).catch(function (error) {
	        return reject('\n      Could Not find a user with this is: ' + userId + '\n\n      Mongo ERROR: ' + error + '\n      ');
	      });
	    });
	  };

	  _user2.default.statics.loginOrRegister = function (args) {
	    return new _promise2.default(function (resolve, reject) {
	      var auth0Id = args.auth0Id;
	      var loginType = args.loginType;
	      delete args.auth0Id;
	      delete args.loginType;

	      User.findOne({ 'authentication.auth0Identities.user_id': auth0Id }).exec().then(function (dbUser) {
	        if (!dbUser) return User.registerUser(args);
	        return User.loginUser(loginType, dbUser, args);
	      }).then(resolve).catch(function (error) {
	        return reject({ problem: error });
	      });
	    });
	  };

	  _user2.default.statics.loginUser = function (loginType, dbUser, userObj) {
	    return new _promise2.default(function (resolve) {
	      console.log('Found Existing User.\n');
	      dbUser.authentication.totalLogins += 1;
	      dbUser.authentication.logins.push(userObj.authenticationLogins.pop());
	      dbUser.contactInfo.location = (0, _extends3.default)({}, userObj.contactInfoLocation);
	      dbUser.shopping.cart = [].concat((0, _toConsumableArray3.default)(userObj.shoppingCart));
	      dbUser.socialProfileBlob[loginType] = userObj.socialProfileBlob[loginType];

	      dbUser.save({ validateBeforeSave: true }).then(resolve);
	    });
	  };

	  _user2.default.statics.registerUser = function (userObj) {
	    return new _promise2.default(function (resolve, reject) {
	      var name = userObj.name,
	          pictures = userObj.pictures,
	          authentication = userObj.authentication,
	          authenticationLogins = userObj.authenticationLogins,
	          authenticationAuth0Identities = userObj.authenticationAuth0Identities,
	          contactInfo = userObj.contactInfo,
	          contactInfoLocation = userObj.contactInfoLocation,
	          contactInfoDevices = userObj.contactInfoDevices,
	          contactInfoSocialNetworks = userObj.contactInfoSocialNetworks,
	          shopping = userObj.shopping,
	          shoppingCart = userObj.shoppingCart,
	          permissions = userObj.permissions,
	          userStory = userObj.userStory,
	          socialProfileBlob = userObj.socialProfileBlob;


	      _bluebird.Promise.fromCallback(function (cb) {
	        return User.create({
	          name: name,
	          pictures: pictures,
	          authentication: (0, _extends3.default)({}, authentication, {
	            logins: [].concat((0, _toConsumableArray3.default)(authenticationLogins)),
	            auth0Identities: [].concat((0, _toConsumableArray3.default)(authenticationAuth0Identities))
	          }),
	          contactInfo: (0, _extends3.default)({}, contactInfo, {
	            location: (0, _extends3.default)({}, contactInfoLocation),
	            devices: [].concat((0, _toConsumableArray3.default)(contactInfoDevices)),
	            socialNetworks: [].concat((0, _toConsumableArray3.default)(contactInfoSocialNetworks))
	          }),
	          shopping: (0, _extends3.default)({}, shopping, {
	            cart: [].concat((0, _toConsumableArray3.default)(shoppingCart))
	          }),
	          permissions: permissions,
	          userStory: userStory,
	          socialProfileBlob: socialProfileBlob
	        }, cb);
	      }).then(function (newUser) {
	        console.log('\nNew User created!: ', newUser._id, '\nName: ', newUser.name.display, '\n');
	        resolve(newUser);
	      }).catch(reject);
	    });
	  };

	  _user2.default.statics.addToMemberCart = function (_ref) {
	    var userId = _ref.userId,
	        qty = _ref.qty,
	        nicotineStrength = _ref.nicotineStrength,
	        product = _ref.product;
	    return new _promise2.default(function (resolve, reject) {
	      User.findById(userId).exec().then(function (dbUser) {
	        dbUser.shopping.cart.push({
	          qty: qty,
	          product: product,
	          nicotineStrength: nicotineStrength
	        });
	        return dbUser.save({ validateBeforeSave: true });
	      }).then(function (savedUser) {
	        console.log('Saved product to the User\'s Shopping Cart!');
	        resolve(savedUser);
	      }).catch(function (error) {
	        return reject({
	          problem: 'Could not save to the Users shopping cart.\n      args: {\n        userId: ' + userId + ',\n        qty: ' + qty + ',\n        nicotineStrength: ' + nicotineStrength + ',\n        product: ' + product + ',\n      }\n      Mongo Error: ' + error
	        });
	      });
	    });
	  };

	  _user2.default.statics.deleteFromCart = function (_ref2) {
	    var userId = _ref2.userId,
	        productId = _ref2.productId;
	    return new _promise2.default(function (resolve, reject) {
	      User.findById(userId).exec().then(function (dbUser) {
	        dbUser.shopping.cart = dbUser.shopping.cart.filter(function (_ref3) {
	          var product = _ref3.product;
	          return String(product) !== String(productId);
	        });
	        return dbUser.save({ validateBeforeSave: true });
	      }).then(function (savedUser) {
	        console.log('\n        Deleted Product: ' + productId + ' from User: ' + savedUser._id + '.\n      ');
	        resolve(savedUser);
	      }).catch(function (error) {
	        return reject('\n      Could not Delete Product: ' + productId + ' from User: ' + userId + '.\n      Mongo Error = ' + error + '\n    ');
	      });
	    });
	  };

	  _user2.default.statics.editToMemberCart = function (_ref4) {
	    var userId = _ref4.userId,
	        products = _ref4.products;
	    return new _promise2.default(function (resolve, reject) {
	      User.findById(userId).exec().then(function (dbUser) {
	        dbUser.shopping.cart = products;
	        return dbUser.save({ validateBeforeSave: true });
	      }).then(function (updatedUser) {
	        console.log('\n        Updated user shopping cart!\n      ');
	        resolve(updatedUser);
	      }).catch(function (error) {
	        return reject('\n      Could not Update User: ' + userId + '.\n\n      Mongo Error = ' + error + '\n    ');
	      });
	    });
	  };

	  console.log('\n\nCreating User collection...');
	  var User = db.model('User', _user2.default);
	  return User;
	};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var Schema = __webpack_require__(8).Schema;

	var ObjectId = exports.ObjectId = Schema.Types.ObjectId;
	var userSchema = new Schema({
	  name: {
	    first: { type: String },
	    last: { type: String },
	    display: { type: String }
	  },
	  pictures: {
	    small: { type: String },
	    large: { type: String },
	    default: {
	      type: String,
	      default: 'https://s3-ap-northeast-1.amazonaws.com/nj2jp-react/default-user.png'
	    }
	  },
	  authentication: {
	    signedUp: { type: Date },
	    password: { type: String },
	    createdAt: { type: Date },
	    totalLogins: { type: Number },
	    lastLogin: [{
	      date: { type: Date, default: new Date() },
	      device: { type: String, default: 'computer' }
	    }],
	    ageVerified: { type: Boolean, default: false },
	    auth0Identities: [{
	      provider: { type: String },
	      user_id: { type: String },
	      connection: { type: String },
	      isSocial: { type: Boolean }
	    }]
	  },
	  contactInfo: {
	    email: { type: String },
	    phone: { type: String },
	    locale: { type: String },
	    timezone: { type: Number },
	    location: {
	      ipAddress: { type: String },
	      lat: { type: String },
	      long: { type: String },
	      country: { type: String }
	    },
	    devices: [{
	      hardware: { type: String },
	      os: { type: String }
	    }],
	    socialNetworks: [{
	      name: { type: String },
	      link: { type: String }
	    }]
	  },
	  shopping: {
	    cart: [{
	      qty: { type: Number },
	      nicotineStrength: { type: Number },
	      product: { type: ObjectId, ref: 'Product' }
	    }],
	    transactions: [{ type: ObjectId, ref: 'Transaction' }]
	  },
	  permissions: {
	    role: {
	      type: String,
	      enum: ['user', 'admin', 'devAdmin', 'wholeseller', 'distributor'],
	      required: true
	    }
	  },
	  userStory: {
	    age: { type: Number },
	    birthday: { type: Date },
	    bio: { type: String },
	    gender: { type: String }
	  },
	  marketHero: {
	    tags: [{
	      name: { type: String },
	      date: { type: Date }
	    }]
	  },
	  socialProfileBlob: {
	    line: { type: String },
	    facebook: { type: String },
	    google: { type: String },
	    twitter: { type: String },
	    linkedin: { type: String }
	  }
	});
	exports.default = userSchema;

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	module.exports = require("babel-polyfill");

/***/ })
/******/ ])));