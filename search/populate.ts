import {
  DynamoDBStreamsClient,
  ListStreamsCommand,
} from "@aws-sdk/client-dynamodb-streams";
import { MeiliSearch } from "meilisearch";

const APP_TABLE_NAME = process.env.APP_TABLE || "AppTable";
const APP_SEARCH_HOST = process.env.APP_SEARCH_HOST || "";
const APP_SEARCH_KEY = process.env.APP_SEARCH_KEY;
const APP_SEARCH_INDEX = process.env.APP_SEARCH_INDEX || APP_TABLE_NAME;

enum DynamoDBStreamsEventNames {
  insert = "INSERT",
  modify = "MODIFY",
  remove = "REMOVE",
}

const search = new MeiliSearch({
  host: APP_SEARCH_HOST,
  apiKey: APP_SEARCH_KEY,
});
const index = search.index(APP_SEARCH_INDEX);

// Dynamo DB Streams Client configuration
const config = {
  // region: "REGION",
};
const client = new DynamoDBStreamsClient(config);

// List Streams Input
const input = {
  TableName: APP_TABLE_NAME,
  // Limit: Number("int"),
  // ExclusiveStartStreamArn: "STRING_VALUE",
};
const command = new ListStreamsCommand(input);
export const handler = async () => {
  const result = await client.send(command);
  const data = result.Records[0];
  const { eventSource, eventName } = data;
  if (
    eventSource != "aws:dynamodb" &&
    !Object.values(DynamoDBStreamsEventNames).includes(eventName)
  ) {
    return;
  }

  console.log(result);
  let response;
  if (eventName === DynamoDBStreamsEventNames.insert) {
    response = await onInsert(data.Records[0]);
  } else if (eventName === DynamoDBStreamsEventNames.modify) {
    response = await onModify(data.Records[0]);
  } else if (eventName === DynamoDBStreamsEventNames.remove) {
    response = await onRemove(data.Records[0]);
  }
  return response;
};

function onInsert(records: Record<string, any>[]) {
  const documents = records.map((element) => element["dynamodb"]["NewImage"]);
  return index.addDocuments(documents);
}

function onModify(records: any[]) {
  // Not implemented yet
  // records.forEach((element) => {});
}

function onRemove(records: any[]) {
  const ids = records.map((element) => element["dynamodb"]["NewImage"]["id"]);
  return index.deleteDocuments([...ids]);
}
