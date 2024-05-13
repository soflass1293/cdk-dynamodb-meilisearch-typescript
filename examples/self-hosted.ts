// @ts-nocheck
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

// Import the package
import { ComputeValue, WithHostedSearch } from "cdk-dynamodb-search";

export class CdkTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // You can use environment variables in ".env" files
    const APP_TABLE = process.env.APP_TABLE!;
    const APP_SEARCH_KEY = process.env.APP_SEARCH_KEY!;
    const APP_SEARCH_INDEX =process.env.APP_SEARCH_INDEX!;

    const table = new dynamodb.Table(this, APP_TABLE, {
      partitionKey: { name: "test-pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "test-sk", type: dynamodb.AttributeType.STRING },
      tableName: APP_TABLE,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // You must enable the stream "NEW_AND_OLD_IMAGES"
    });

    new WithHostedSearch(this, "TestSearch", {
      table, // Required
      search: {
        apiKey: APP_SEARCH_KEY, // Required
        index: APP_SEARCH_INDEX, // Optional - defaulted to the table name
      },
      container: { // Optional
        cpu: ComputeValue.v256,
        memoryLimitMiB: ComputeValue.v512,
      },
    });
  }
}
