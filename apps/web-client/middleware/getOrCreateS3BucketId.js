const debugError = require('debug')('ERROR');

module.exports = (req, res, next) => {
  const item = {
    Item: {
      id: { S: '1' }, // there should only be at max one record in this table
      s3BucketId: { S: req.app.locals.uuid() },
    },
    TableName: req.app.locals.table,
    ConditionExpression: 'attribute_not_exists(id)', // do not overwrite if a record exists
    ReturnValues: 'ALL_OLD',
  };

  return req.app.locals.dynamodb.putItem(item).promise()
    .catch((err) => {
      if (err.code === 'ConditionalCheckFailedException') {
        return req.app.locals.dynamodb.getItem({
          Key: {
            id: { S: '1' },
          },
          TableName: req.app.locals.table,
        }).promise();
      }

      if (err.code === 'ResourceNotFoundException') {
        return Promise.reject({
          code: 'ResourceNotFoundException',
          // eslint-disable-next-line max-len
          message: `${err.message} - the DynamoDB ${req.app.locals.table} table may still be initializing`,
        });
      }

      debugError('DYNAMO PUT ITEM: ', err);
      return Promise.reject(err);
    })

    .then(({ Item }) => {
      req.app.locals.s3Bucket = Item ? Item.s3BucketId.S : item.Item.s3BucketId.S;
      next();
    })

    .catch((err) => {
      debugError('DYNAMO GET ITEM: ', err);
      const errJson = {
        code: err.code,
        message: err.message,
      };

      res.status(500).json(errJson);
    });
};
