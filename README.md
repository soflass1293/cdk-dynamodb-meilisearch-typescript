# Welcome to useSearch

This is an [Amazon DynamoDB](https://aws.amazon.com/dynamodb) helper enabling full text search using Meilisearch [Meilisearch](https://www.meilisearch.com) on top of [Amazon Web Services Cloud Development Kit (AWS CDK)](https://aws.amazon.com/cdk)

# How to use

1. Install the package
   `npm install dynamodb-use-search`
2. Import the package
   `import { useSearch } from "dynamodb-use-search";`
3. Wrap your DynamoDB table with the useSearch helper
   `useSearch(my_table)`
4. Add the search API key (will be used as the master key [Meilisearch](https://www.meilisearch.com/docs/learn/security/basic_security))
   `useSearch(my_table, { apiKey: "MY_SECRET_KEY"})`

That's it that was the minimal usage

# Further customization
If you want further customization you can customize the params

`Required SearchProps: {
  apiKey: string - API key also used as the master key (required)
  index: string - Search index name (optional)
}`
`Optional ContainerProps: {
  cpu: number - The number of cpu units used by the task
  memoryLimitMiB: number - The amount (in MiB) of memory used by the task
}`

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template


    // Add Dynamo DB event sources to the handler function
    const fnHandleDBStreams = new NodejsFunction(
      this,
      "WithSearchAppFunctionHandleDBStreams",
      {
        entry: `${__dirname}/../populate.ts`,
        handler: "handler",
        environment: {
          APP_SEARCH_HOST: ecsService.loadBalancer.loadBalancerDnsName, // TODO: Update deprecated load balancer
          APP_SEARCH_KEY: props.search.apiKey!, // Please provide this in the ".env" file
          APP_SEARCH_INDEX: props.search.index || props.table.tableName,
        },
      }
    );