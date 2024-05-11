import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";

type SearchProps = {
  apiKey: string;
  index?: string;
};

type ContainerProps = {
  memoryLimitMiB: ComputeValue.v512;
  cpu: ComputeValue.v256;
};

enum ComputeValue {
  v256 = 256,
  v512 = 512,
  v1024 = 1024,
  v2048 = 2048,
  v4096 = 4096,
}

interface WithSearchProps {
  table: dynamodb.Table;
  search: SearchProps;
  container?: ContainerProps;
}

class WithSearch extends Construct {
  constructor(scope: Construct, id: string, props: WithSearchProps) {
    super(scope, id);
    const ecsService =
      new ecs_patterns.ApplicationMultipleTargetGroupsFargateService(
        this,
        "WithSearchFargate",
        {
          memoryLimitMiB: props.container?.memoryLimitMiB || ComputeValue.v512,
          cpu: props.container?.cpu || ComputeValue.v256,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset("./search/Dockerfile"),
            containerPorts: [7700],
            environment: {
              MEILI_MASTER_KEY: props.search.apiKey!, // Please provide this in the ".env" file, this key will be used in Meilisearch client
            },
          },
        }
      );
    // Add Dynamo DB event sources to the handler function
    const fnHandleDBStreams = new lambda.Function(
      this,
      "WithSearchAppFunctionHandleDBStreams",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "populate.handler",
        code: lambda.Code.fromAsset("search"),
        environment: {
          APP_SEARCH_HOST: ecsService.loadBalancer.loadBalancerDnsName, // TODO: Update deprecated load balancer
          APP_SEARCH_KEY: props.search.apiKey!, // Please provide this in the ".env" file
          APP_SEARCH_INDEX: props.search.index || props.table.tableName,
        },
      }
    );

    fnHandleDBStreams.addEventSource(
      new eventsources.DynamoEventSource(props.table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    // Output the URL of the load balancer
    new cdk.CfnOutput(this, "WithSearchAppLoadBalancerDNS", {
      value: ecsService.loadBalancer.loadBalancerDnsName, // TODO: Update deprecated load balancer
    });
  }
}

export {
  ComputeValue,
  ContainerProps,
  SearchProps,
  WithSearch,
  WithSearchProps,
};
