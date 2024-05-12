import { ComputeValue, WithHostedSearch } from "../lib";
import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";

it("should create a construct", async () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "MoviesStack");

  const TABLE_NAME = "movies";
  const table = new dynamodb.Table(stack, "TestTable", {
    partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    billingMode: BillingMode.PAY_PER_REQUEST,
    tableName: TABLE_NAME,
  });

  const SEARCH_API_KEY = "MY_SUPER_SECRET_KEY";
  const SEARCH_INDEX = "my-movies";
  new WithHostedSearch(stack, "TestSearch", {
    table,
    search: {
      apiKey: SEARCH_API_KEY,
      index: SEARCH_INDEX,
    },
    container: {
      cpu: ComputeValue.v256,
      memoryLimitMiB: ComputeValue.v512,
    },
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::DynamoDB::Table", 1);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    TableName: TABLE_NAME,
    StreamSpecification: { StreamViewType: "NEW_AND_OLD_IMAGES" },
  });

  template.resourceCountIs("AWS::ECS::TaskDefinition", 1);
  template.hasResourceProperties("AWS::ECS::TaskDefinition", {
    Cpu: `${ComputeValue.v256}`,
    Memory: `${ComputeValue.v512}`,
    NetworkMode: "awsvpc",
    RequiresCompatibilities: Match.arrayWith(["FARGATE"]),
    ContainerDefinitions: Match.arrayWith([
      Match.objectLike({
        PortMappings: Match.arrayWith([
          { ContainerPort: 7700, Protocol: "tcp" },
        ]),
        Environment: [
          { Name: "MEILI_MASTER_KEY", Value: "MY_SUPER_SECRET_KEY" },
        ],
      }),
    ]),
  });
});
