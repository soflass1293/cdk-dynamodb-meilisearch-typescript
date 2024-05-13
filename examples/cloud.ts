// @ts-nocheck
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

// Import the package
import { WithCloudSearch } from "cdk-dynamodb-search";

export class CdkTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // You can use environment variables in ".env" files
    const APP_TABLE = process.env.APP_TABLE!;
    const APP_SEARCH_KEY = process.env.APP_SEARCH_KEY!;
    const APP_SEARCH_INDEX =process.env.APP_SEARCH_INDEX!;
    const APP_SEARCH_HOST =process.env.APP_SEARCH_HOST!;

    const table = new dynamodb.Table(this, APP_TABLE, {
      partitionKey: { name: "test-pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "test-sk", type: dynamodb.AttributeType.STRING },
      tableName: APP_TABLE,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // You must enable the stream "NEW_AND_OLD_IMAGES"
    });

    new WithCloudSearch(this, "TestSearch", {
      table, // Required
      search: {
        apiKey: APP_SEARCH_KEY, // Required - obtained from https://www.meilisearch.com/cloud
        index: APP_SEARCH_INDEX, // Optional - defaulted to the table name
      },
      provider: {
        host: APP_SEARCH_HOST, // Required - obtained from https://www.meilisearch.com/cloud
      }
    });
  }
}
