import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

type SearchProps = {
  apiKey: string;
  index?: string;
};

type ProviderProps = {
  host: string;
};

interface WithSearchProps {
  table: dynamodb.Table;
  search: SearchProps;
  provider: ProviderProps;
}

class WithSearch extends Construct {
  constructor(scope: Construct, id: string, props: WithSearchProps) {
    super(scope, id);
    // Add Dynamo DB event sources to the handler function
    const fnHandleDBStreams = new NodejsFunction(
      this,
      "WithSearchAppFunctionHandleDBStreams",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: `${__dirname}/../populate.js`,
        environment: {
          APP_SEARCH_HOST: props.provider.host,
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
  }
}

export { ProviderProps, SearchProps, WithSearch, WithSearchProps };
