import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { WithCloudSearch } from "../lib";

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
  const SEARCH_HOST = "https://www.example.com/search";
  new WithCloudSearch(stack, "TestSearch", {
    table,
    search: {
      apiKey: SEARCH_API_KEY,
      index: SEARCH_INDEX,
    },
    provider: {
      host: SEARCH_HOST,
    },
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::DynamoDB::Table", 1);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    TableName: TABLE_NAME,
    StreamSpecification: { StreamViewType: "NEW_AND_OLD_IMAGES" },
  });
});
