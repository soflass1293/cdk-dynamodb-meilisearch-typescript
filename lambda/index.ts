import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const APP_TABLE = process.env.APP_TABLE || "AppTable";

export const create = async () => {
  const command = new PutCommand({
    TableName: APP_TABLE,
    Item: {
      id: "my-id",
      foo: {
        bar: "boo",
      },
      kaz: "koo",
    },
  });

  const response = await docClient.send(command);
  console.log(response);
  return response;
};

export const get = async () => {
  const command = new GetCommand({
    TableName: APP_TABLE,
    Key: {
      id: "my-id",
    },
  });

  const response = await docClient.send(command);
  console.log(response);
  return response;
};

export const query = async () => {
  const command = new QueryCommand({
    TableName: APP_TABLE,
    KeyConditionExpression: "kaz = :kaz",
    ExpressionAttributeValues: {
      ":kaz": "koo",
    },
    ConsistentRead: true,
  });

  const response = await docClient.send(command);
  console.log(response);
  return response;
};

export const update = async () => {
  const command = new UpdateCommand({
    TableName: APP_TABLE,
    Key: {
      id: "my-id",
    },
    UpdateExpression: "set kaz = :kaz",
    ExpressionAttributeValues: {
      ":kaz": "new kaz",
    },
    ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(command);
  console.log(response);
  return response;
};

export const remove = async () => {
  const command = new DeleteCommand({
    TableName: APP_TABLE,
    Key: {
      id: "my-id",
    },
  });

  const response = await docClient.send(command);
  console.log(response);
  return response;
};
