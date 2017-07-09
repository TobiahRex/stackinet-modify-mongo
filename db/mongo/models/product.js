/* eslint-disable no-use-before-define, no-console */
import { Promise as bbPromise } from 'bluebird';
import productSchema from '../schemas/product';

export default (db) => {
  /**
  * 1) Remove all documents instances.
  *
  * @param {string} collectionName - name of collection - only used to Verify operation accuracy with console.logs.
  *
  * @return {object} - Promise: resolved - Email details.
  */
  productSchema.statics.dropCollection  = collectionName =>
  new Promise((resolve, reject) => {
    console.log('\nDropping ', collectionName, ' collection...');

    return bbPromise.fromCallback(cb => Product.remove({}, cb))
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
  * 1) Remove single document instance.
  *
  * @param {string} id - Mongo _id of the document to remove.
  *
  * @return {object} - Promise: resolved - Email details.
  */
  productSchema.statics.removeOne = ({ id }) =>
  new Promise((resolve, reject) => {
    if (!id) return reject(`Missing required arguments. "id": ${id || 'undefined'}`);

    Product
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

  productSchema.statics.findProductsByFlavor = flavor =>
  new Promise((resolve, reject) => {
    Product.find({ 'product.flavor': flavor })
    .exec()
    .then((dbProducts) => {
      console.log(`
        Found ${dbProducts.length} popular product(s) with Flavor: "${flavor}"!
      `);
      resolve(dbProducts);
    })
    .catch((error) => {
      console.log(`Error trying to query for products with flavor "${flavor}". ERROR = ${error}`);
      reject(`Error trying to query for products with flavor "${flavor}". ERROR = ${error}`);
    });
  });

  productSchema.statics.fetchMultiple = ids =>
  new Promise((resolve, reject) => {
    if (!ids.length) {
      resolve([]);
    } else {
      Product.find({ _id: { $in: [...ids] } })
      .exec()
      .then((dbProducts) => {
        console.log('Found multiple Products.: ', dbProducts);
        resolve(dbProducts);
      })
      .catch(error => {
        console.log(`Error trying to fetch multiple products with ids "${ids}".`);
        reject(`Error trying to fetch multiple products with ids "${ids}".`);
      });
    }
  });

  productSchema.statics.findProductByIdAndDelete = _id =>
  new Promise((resolve, reject) => {
    Product.findByIdAndRemove(_id)
    .exec()
    .then(resolve)
    .catch(error => {
      console.log(`Error while trying to fetch multiple products with ids "${ids}".  ERROR = ${error}`);
      reject(`Error while trying to fetch multiple products with ids "${ids}".  ERROR = ${error}`);
    });
  });


  productSchema.statics.createProduct = (eventBody) =>
  new Promise((resolve, reject) => {
    const createArgs = Object.assign({}, eventBody);
    delete createArgs.databaseName;
    delete createArgs.operationName;
    delete createArgs.collectionName;

    bbPromise.fromCallback(cb => Product.create({ ...createArgs }, cb))
    .then((newDoc) => {
      console.log('Successfully create a new document on collection: ', eventBody.collectionName);
      resolve(newDoc);
    })
    .catch((error) => {
      console.log(`Error while trying to create new Product document.  ERROR = ${error}`);
      reject(`Error while trying to create new Product document.  ERROR = ${error}`);
    });
  });

  productSchema.statics.findProductById = _id =>
  new Promise((resolve, reject) => {
    Product.findById(_id)
    .exec()
    .then((dbProduct) => {
      console.log('\n//mongo/model/product.js\n @ findProductById RESOLVE\n', dbProduct);
      resolve(dbProduct);
    })
    .catch((error) => {
      console.log(`Error while trying to find Product by id "${id}". ERROR = ${error}.`);
      reject(`Error while trying to find Product by id "${id}". ERROR = ${error}.`);
    });
  });

  productSchema.statics.findProductAndUpdate = (_id, productObj) =>
  new Promise((resolve, reject) => {
    const newProductObj = {};
    Object.keys(productObj)
    .map((key) => {
      if (key === 'images') {
        const imageKeys = [];
        const imageObjs = [];
        productObj.images.forEach((imageObj, i) => {
          imageKeys.push(`product.images[${i}]`);
          imageObjs.push(imageObj);
        });
        return imageKeys.map((newKey, i) => ({
          [newKey]: imageObjs[i],
        }));
      }
      const newKey = `product.${key}`;
      const value = productObj[key];
      return ({
        [newKey]: value,
      });
    })
    .forEach((object) => {
      const key = Object.keys(object)[0];
      newProductObj[key] = object[key];
    });

    console.log('\nnewProductObj: ', newProductObj);

    Product.findByIdAndUpdate(_id, { $set: newProductObj }, { new: true })
    .exec()
    .then((updatedProduct) => {
      console.log(`
        Updated Product!: ${_id};
        `);
      resolve(updatedProduct);
    })
    .catch(error => {
      console.log(`Error while trying to find Product by id "${id}" and update. ERROR = ${error}.`);
      reject(`Error while trying to find Product by id "${id}" and update. ERROR = ${error}.`);
    });
  });

  productSchema.statics.getPopularProducts = qty =>
  new Promise((resolve, reject) => {
    Product.aggregate([
      { $group: {
        _id: '$product.flavor',
        docId: { $first: '$_id' },
        title: { $first: '$product.title' },
        routeTag: { $first: '$product.routeTag' },
        images: { $first: '$product.images' },
        completedCheckouts: { $first: '$statistics.completed_checkouts' },
      } },
      { $sort: { completedCheckouts: -1 } },
      { $limit: qty },
    ])
    .exec()
    .then((dbProducts) => {
      console.log('\nFound the following products. ', dbProducts);
      resolve(dbProducts);
    })
    .catch(error => {
      console.log(`Error while trying to get "${qty}" Popular products.  ERROR = ${error}.`);
      reject(`Error while trying to get "${qty}" Popular products.  ERROR = ${error}.`);
    });
  });

  console.log('\n\nCreating Product collection...');
  const Product = db.model('Product', productSchema);
  return Product;
};
