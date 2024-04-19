import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

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
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

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
    table.grantWriteData(fnGet);
    table.grantWriteData(fnQuery);
    table.grantReadWriteData(fnUpdate);
    table.grantWriteData(fnRemove);

    // Create a new ECS Fargate service from a Docker file
    const ecsService =
      new ecs_patterns.ApplicationMultipleTargetGroupsFargateService(
        this,
        "AppFargate",
        {
          memoryLimitMiB: 512,
          cpu: 256,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset("./search/Dockerfile"),
            containerPorts: [7700],
            environment: {
              MEILI_MASTER_KEY: APP_SEARCH_KEY!, // Please provide this in the ".env" file, this key will be used in Meili client
            },
          },
        }
      );

    // Add Dynamo DB event sources to the handler function
    const fnHandleDBStreams = new lambda.Function(
      this,
      "AppFunctionHandleDBStreams",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("search"),
        environment: {
          APP_TABLE_NAME: table.tableName,
          APP_SEARCH_HOST: ecsService.loadBalancer.loadBalancerDnsName,
          APP_SEARCH_KEY: APP_SEARCH_KEY!, // Please provide this in the ".env" file
          APP_SEARCH_INDEX: APP_SEARCH_INDEX,
        },
      }
    );

    fnHandleDBStreams.addEventSource(
      new eventsources.DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    // Output the URL of the load balancer
    new cdk.CfnOutput(this, "AppLoadBalancerDNS", {
      value: ecsService.loadBalancer.loadBalancerDnsName,
    });
  }
}
