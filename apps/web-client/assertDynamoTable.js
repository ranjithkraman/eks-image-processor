module.exports = (dynamodb, table) => {
  const TableDef = {
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    TableName: table,
  };

  return dynamodb
    .createTable(TableDef)
    .promise()
    .catch((err) => {
      /* istanbul ignore next */
      if (err.message.includes('Table already exists')) {
        return dynamodb.describeTable({ TableName: table }).promise();
      }

      /* istanbul ignore next */
      console.error(
        'ERROR: Unable to create or describe required table in DynamoDB',
        err
      );

      /* istanbul ignore next */
      process.exit(1);
    });
};
