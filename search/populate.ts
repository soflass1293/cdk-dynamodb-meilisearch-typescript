import { unmarshall } from "@aws-sdk/util-dynamodb";
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
  console.log("aaaaa");
  console.log(JSON.stringify(event));
  console.log("11111");
  const records = event.Records;
  console.log(records);
  console.log("22222");

  const { eventName } = records[0];
  console.log("333333");
  console.log("event name ", eventName);
  console.log("333333");
  let response;
  if (eventName === "INSERT") {
    console.log("INSERT");

    response = await onInsert(records);
  } else if (eventName === "MODIFY") {
    console.log("MODIFY");
    response = await onModify(records);
  } else if (eventName === "REMOVE") {
    console.log("REMOVE");
    response = await onRemove(records);
  }
  console.log("end", JSON.stringify(response));
  return response;
};

function onInsert(records: DynamoDBStreamEvent["Records"]) {
  console.log("on inserrrrtttt");

  const documents = records.map((element) => {
    if (!element.dynamodb?.NewImage) {
      return;
    }
    return element.dynamodb.NewImage;
  });
  const filteredI: Record<string, any>[] = [];
  documents.forEach((element) => {
    if (element !== undefined) {
      // @ts-ignore
      filteredI.push(unmarshall(element));
    }
  });
  console.log("filteredI", JSON.stringify(filteredI, null, 2));
 

  return index.addDocuments(filteredI);
}

function onModify(records: DynamoDBStreamEvent["Records"]) {
  // Not implemented yet
  // records.forEach((element) => {});
}

function onRemove(records: DynamoDBStreamEvent["Records"]) {
  // TODO: Fix keys
  const keys = records.map((element) => element.dynamodb?.Keys);
  const id = keys.join();
  return index.deleteDocuments([...id]);
}
