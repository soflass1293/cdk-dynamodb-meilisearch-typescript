import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBStreamEvent } from "aws-lambda";
import { MeiliSearch } from "meilisearch";
import { createId, sortKeys } from "./utils";

const APP_TABLE_NAME = process.env.APP_TABLE || "AppTable";
const APP_SEARCH_HOST = process.env.APP_SEARCH_HOST || "";
const APP_SEARCH_KEY = process.env.APP_SEARCH_KEY;
const APP_SEARCH_INDEX = process.env.APP_SEARCH_INDEX || APP_TABLE_NAME;

const search = new MeiliSearch({
  host: APP_SEARCH_HOST,
  apiKey: APP_SEARCH_KEY,
});
const index = search.index(APP_SEARCH_INDEX);

async function handler(event: DynamoDBStreamEvent) {
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
}

function onInsert(records: DynamoDBStreamEvent["Records"]) {
   const documents = records.map((element) => {
    if (!element.dynamodb?.NewImage) {
      return;
    }
    const { NewImage, Keys } = element.dynamodb;
    return { NewImage, Keys };
  });
  const filtered: Record<string, any>[] = [];
  documents.forEach((element) => {
    if (element !== undefined) {
      const { NewImage, Keys } = element;
      // @ts-ignore
      const sortedKeys = sortKeys(unmarshall(Keys));
      const id = createId(sortedKeys);
      const sortedImage = unmarshall(NewImage as Record<string, any>); // TODO: use this "as Record<string, AttributeValue>""
      const document = { ...sortedImage, id };
      // @ts-ignore
      filtered.push(document);
    }
  });
   return index.addDocuments(filtered);
}

function onModify(records: DynamoDBStreamEvent["Records"]) {
  const documents = records.map((element) => {
    if (!element.dynamodb?.NewImage) {
      return;
    }
    const { NewImage, Keys } = element.dynamodb;
    return { NewImage, Keys };
  });
  const filtered: Record<string, any>[] = [];
  documents.forEach((element) => {
    if (element !== undefined) {
      const { NewImage, Keys } = element;
      // @ts-ignore
      const sortedKeys = sortKeys(unmarshall(Keys));
      const id = createId(sortedKeys);
      const sortedImage = unmarshall(NewImage as Record<string, any>); // TODO: use this "as Record<string, AttributeValue>""
      const document = { ...sortedImage, id };
      // @ts-ignore
      filtered.push(document);
    }
  });
  return index.updateDocuments(filtered);
}

function onRemove(records: DynamoDBStreamEvent["Records"]) {
  const ids: string[] = [];
  records.map((element) => {
    const keys = element.dynamodb?.Keys;
    // @ts-ignore
    const sorted = sortKeys(unmarshall(keys));
    const id = createId(sorted);
    ids.push(id);
  });
  return index.deleteDocuments([...ids]);
}

export { handler };
