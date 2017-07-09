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
      reject({
        problem: `Could not find any products with flavor ${flavor}.

        Mongo Error = ${error}`,
      });
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
      .catch(error => reject(`
        problem: Could not fetch multiple products.

        Mongo Error = ${error}.
      `));
    }
  });

  productSchema.statics.findProductByIdAndDelete = _id =>
  new Promise((resolve, reject) => {
    Product.findByIdAndRemove(_id)
    .exec()
    .then(resolve)
    .catch(error => reject({
      problem: `Could not create a delete product with _id:${_id}.  Verify the id is valid.
      Mongoose Error = ${error}`,
    }));
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
      console.log('\nERROR while trying to create a new document.\nCheck arguments: ', JSON.stringify(createArgs, null, 2));
      reject(error);
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
      reject({
        problem: `Could not find the product with id ${_id}.  Are you sure that product exists?
        Mongo Error = ${error}`,
      });
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
    .catch(error => reject({
      problem: `Could not find the product with id ${_id}. Are you sure that product exists?
      Mongo Error = ${error}`,
    }));
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
      console.log(`
        Found the following products: ${JSON.stringify(dbProducts, null, 2)}
      `);
      resolve(dbProducts);
    })
    .catch(error => reject({
      problem: `Could not fetch the ${qty} products you requested.
      Mongo Error = ${error}`,
    }));
  });

  console.log('\n\nCreating Product collection...');
  const Product = db.model('Product', productSchema);
  return Product;
};
