import * as cdk from "aws-cdk-lib";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

type SearchProps = {
  apiKey: string;
  index?: string;
};

type ContainerProps = Pick<
  ecs_patterns.ApplicationMultipleTargetGroupsFargateServiceProps,
  "memoryLimitMiB" | "cpu"
>;

const useSearch = (
  table: dynamodb.Table,
  search: SearchProps,
  container: ContainerProps = {
    memoryLimitMiB: ComputeValue.v512,
    cpu: ComputeValue.v256,
  }
) => {
  // Create a new ECS Fargate service from a Docker file
  const ecsService =
    new ecs_patterns.ApplicationMultipleTargetGroupsFargateService(
      this,
      "AppFargate",
      {
        memoryLimitMiB: container?.memoryLimitMiB,
        cpu: container?.cpu,
        taskImageOptions: {
          image: ecs.ContainerImage.fromAsset("./search/Dockerfile"),
          containerPorts: [7700],
          environment: {
            MEILI_MASTER_KEY: search.apiKey!, // Please provide this in the ".env" file, this key will be used in Meili client
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
      handler: "populate.handler",
      code: lambda.Code.fromAsset("search"),
      environment: {
        APP_TABLE_NAME: table.tableName,
        APP_SEARCH_HOST: ecsService.loadBalancer.loadBalancerDnsName,
        APP_SEARCH_KEY: search.apiKey!, // Please provide this in the ".env" file
        APP_SEARCH_INDEX: search.index || table.tableName,
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
};

enum ComputeValue {
  v256 = 256,
  v512 = 512,
  v1024 = 1024,
  v2048 = 2048,
  v4096 = 4096,
}

export { useSearch, SearchProps, ContainerProps, ComputeValue };
