import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

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
        TABLE_NAME: table.tableName,
      },
    });

    const fnGet = new lambda.Function(this, "AppFunctionGet", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.get",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const fnQuery = new lambda.Function(this, "AppFunctionQuery", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.query",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const fnUpdate = new lambda.Function(this, "AppFunctionUpdate", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.update",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const fnRemove = new lambda.Function(this, "AppFunctionRemove", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "index.remove",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant Lambdas permissions to access DynamoDB table
    table.grantWriteData(fnCreate);
    table.grantWriteData(fnGet);
    table.grantWriteData(fnQuery);
    table.grantReadWriteData(fnUpdate);
    table.grantWriteData(fnUpdate);

    // Add Dynamo DB event sources to the respective functions
    fnCreate.addEventSource(
      new eventsources.DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    fnUpdate.addEventSource(
      new eventsources.DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    fnRemove.addEventSource(
      new eventsources.DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    // Create a new ECS Fargate service from a Docker file
    const ecsService =
      new ecs_patterns.ApplicationMultipleTargetGroupsFargateService(
        this,
        "AppFargate",
        {
          memoryLimitMiB: 512,
          cpu: 256,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset("./meili/Dockerfile"),
            containerPorts: [7700],
            environment: {
              MEILI_MASTER_KEY: "APP_MEILI_MASTER_KEY", // Create your own key, this key will be used in Meili client
            },
          },
        }
      );

    // Output the URL of the load balancer
    new cdk.CfnOutput(this, "AppLoadBalancerDNS", {
      value: ecsService.loadBalancer.loadBalancerDnsName,
    });
  }
}

const app = new cdk.App();
