import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import {
  ComputeValue, WithHostedSearch
} from "../search";

const APP_SEARCH_KEY = process.env.APP_SEARCH_KEY;
const APP_SEARCH_INDEX = process.env.APP_SEARCH_INDEX;

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, "AppTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // new WithCloudSearch(this, "AppWithCloudSearch", {
    //   table,
    //   search: {
    //     apiKey: APP_SEARCH_KEY!,
    //     index: APP_SEARCH_INDEX,
    //   },
    //   provider: {
    //     host: process.env.MEILISEARCH_CLOUD_HOST!,
    //   },
    // });

    new WithHostedSearch(this, "AppWithHostedSearch", {
      table,
      search: {
        apiKey: APP_SEARCH_KEY!,
        index: APP_SEARCH_INDEX,
      },
      container: {
        cpu: ComputeValue.v256,
        memoryLimitMiB: ComputeValue.v512,
      },
    });
  }
}
