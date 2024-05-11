import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import {
  CloudSearchProps,
  ComputeValue,
  ContainerProps,
  HostedSearchProps,
  ProviderProps,
  WithCloudSearch,
  WithCloudSearchProps,
  WithHostedSearch,
  WithHostedSearchProps,
} from "../search";

const APP_TABLE_NAME = process.env.APP_TABLE || "AppTable";
const APP_SEARCH_KEY = process.env.APP_SEARCH_KEY;
const APP_SEARCH_INDEX = process.env.APP_SEARCH_INDEX || APP_TABLE_NAME;

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, "AppTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // WARNING: This will delete your table and data when the stack is deleted
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // You must add this steam and set it to "NEW_AND_OLD_IMAGES"
    });

    /* 
      You can use Meilisearch in two ways "Cloud" and "Self-hosted" modes
      - Cloud mode requires you to have an account, please visit: https://www.meilisearch.com/docs/learn/getting_started/cloud_quick_start
      - In Self-hosted mode we create for you a running Meilisearch Docker image using AWS Fargate
    */

    // Cloud mode only
    // Import With helper
    const cloudSearch: CloudSearchProps = {
      /* 
        Used as the Master key and API key
        visit https://www.meilisearch.com/docs/learn/security/basic_security
      */
      apiKey: APP_SEARCH_KEY!, // Required
      // Search index, you can define your own search index here on in the ".env" file
      index: APP_SEARCH_INDEX, // Optional: Initialized as the table name
    };
    const provider: ProviderProps = {
      host: process.env.MEILISEARCH_CLOUD_HOST!, // This can be found in your projects settings
    };

    const withCloudSearchProps: WithCloudSearchProps = {
      table,
      search: cloudSearch,
      provider,
    };
    new WithCloudSearch(this, "AppWithCloudSearch", withCloudSearchProps);
    // End Cloud mode

    // Self-hosted mode only
    /* 
      The container compute power (hosted in ECS Fargate as a Docker image)
      visit https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create-container-image.html
    */
    const hostedSearch: HostedSearchProps = {
      /* 
          Used as the Master key and API key
          visit https://www.meilisearch.com/docs/learn/security/basic_security
        */
      apiKey: APP_SEARCH_KEY!, // Required
      // Search index, you can define your own search index here on in the ".env" file
      index: APP_SEARCH_INDEX, // Optional: Initialized as the table name
    };
    const container: ContainerProps = {
      cpu: ComputeValue.v256,
      memoryLimitMiB: ComputeValue.v512,
    };

    const withHostedSearchProps: WithHostedSearchProps = {
      table,
      search: hostedSearch,
      container,
    };
    new WithHostedSearch(this, "AppWithHostedSearch", withHostedSearchProps);
    // End Self-hosted mode

    // Add your own CRUD Lambda functions
    // Lambda Functions
    const fnCreate = new lambda.Function(this, "AppFunctionCreate", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.create",
      code: lambda.Code.fromAsset("lambda"), // Assuming your Lambda code is in a folder named 'lambda'
      environment: {
        APP_TABLE_NAME: table.tableName,
      },
    });

    const fnGet = new lambda.Function(this, "AppFunctionGet", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.get",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        APP_TABLE_NAME: table.tableName,
      },
    });

    const fnQuery = new lambda.Function(this, "AppFunctionQuery", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.query",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        APP_TABLE_NAME: table.tableName,
      },
    });

    const fnUpdate = new lambda.Function(this, "AppFunctionUpdate", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.update",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        APP_TABLE_NAME: table.tableName,
      },
    });

    const fnRemove = new lambda.Function(this, "AppFunctionRemove", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.remove",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        APP_TABLE_NAME: table.tableName,
      },
    });

    // Grant Lambdas permissions to access DynamoDB table
    table.grantWriteData(fnCreate);
    table.grantReadData(fnGet);
    table.grantReadData(fnQuery);
    table.grantReadWriteData(fnUpdate);
    table.grantWriteData(fnRemove);
  }
}
