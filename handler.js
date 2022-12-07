'use strict';
const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({ region: 'us-east-1', maxRetries: 3, httpOptions: { timeout: 5000 } });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

module.exports.createNote = async (event, context, callback) => {
  console.log(event);
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);
  let response;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: 'attribute_not_exists(notesId)'
    };

    await documentClient.put(params).promise();

    response = {
      statusCode: 201,
      body: JSON.stringify(data)
    }

    callback(null, response)
  } catch (err) {
    response = {
      statusCode: 500,
      body: JSON.stringify(err.message)
    }

    callback(null, response)
  }
};

module.exports.updateNote = async (event, context, callback) => {
  console.log(event);
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);
  let response;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }

    await documentClient.update(params).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify(data)
    }

    callback(null, response)
  } catch (err) {
    response = {
      statusCode: 500,
      body: JSON.stringify(err.message)
    }

    callback(null, response)
  }
};

module.exports.deleteNote = async (event, context, callback) => {
  console.log(event);
  context.callbackWaitsForEmptyEventLoop = false;
  let response;

  let notesId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId }
    };

    await documentClient.delete(params).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify(notesId)
    }

    callback(null, response)
  } catch (err) {
    response = {
      statusCode: 500,
      body: JSON.stringify(err.message)
    }

    callback(null, response)
  }
};

module.exports.getAllNotes = async (event, context, callback) => {
  console.log(event);
  context.callbackWaitsForEmptyEventLoop = false;
  let response;

  try {
    const params = {
      TableName: NOTES_TABLE_NAME
    }

    const notes = await documentClient.scan(params).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify(notes)
    }

    callback(null, response)
  } catch (err) {
    response = {
      statusCode: 500,
      body: JSON.stringify(err.message)
    }

    callback(null, response)
  }
};
