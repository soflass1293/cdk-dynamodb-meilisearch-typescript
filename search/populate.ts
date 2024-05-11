import { DynamoDBStreamEvent } from "aws-lambda";
import { MeiliSearch } from "meilisearch";

const APP_TABLE_NAME = process.env.APP_TABLE || "AppTable";
const APP_SEARCH_HOST = process.env.APP_SEARCH_HOST || "";
const APP_SEARCH_KEY = process.env.APP_SEARCH_KEY;
const APP_SEARCH_INDEX = process.env.APP_SEARCH_INDEX || APP_TABLE_NAME;

const search = new MeiliSearch({
  host: APP_SEARCH_HOST,
  apiKey: APP_SEARCH_KEY,
});
const index = search.index(APP_SEARCH_INDEX);

export const handler = async (event: DynamoDBStreamEvent) => {
  const records = event.Records;
  const { eventName } = records[0];
  let response;
  if (eventName === "INSERT") {
    response = await onInsert(records);
  } else if (eventName === "MODIFY") {
    response = await onModify(records);
  } else if (eventName === "REMOVE") {
    response = await onRemove(records);
  }
  return response;
};

function onInsert(records: DynamoDBStreamEvent["Records"]) {
  const documents = records.map((element) => {
    if (!element.dynamodb?.NewImage) {
      return;
    }
    return element.dynamodb.NewImage;
  });
  const filtered = documents.filter((document) => document !== undefined);
  return index.addDocuments(filtered, { primaryKey: "" });
}

function onModify(records: DynamoDBStreamEvent["Records"]) {
  // Not implemented yet
  // records.forEach((element) => {});
}

function onRemove(records: DynamoDBStreamEvent["Records"]) { // TODO: Fix keys
  const keys = records.map((element) => element.dynamodb?.Keys);
  const id = keys.join();
  return index.deleteDocuments([...id]);
}
