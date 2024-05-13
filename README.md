
# Welcome to CDK DynamoDB Search

This is an [Amazon DynamoDB](https://aws.amazon.com/dynamodb) helper written in [TypeScript](https://www.typescriptlang.org) enabling full text search using [Meilisearch](https://www.meilisearch.com) on top of [Amazon Web Services Cloud Development Kit (AWS CDK)](https://aws.amazon.com/cdk)

# How does it work?
This package is a wrapper around [Amazon DynamoDB](https://aws.amazon.com/dynamodb) table that listens to its ("INSERT", "MODIFY", "REMOVE") events using [Amazon DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html).
### Insert event
When an item/items is inserted in the table, an "INSERT" event is triggered, an [AWS Lambda](https://aws.amazon.com/lambda) function listens to this event and inserts a document/documents based on the recieved record/records using [Meilisearch Client add documents](https://www.meilisearch.com/docs/reference/api/documents#add-or-replace-documents).
### Modify event
When an item/items is inserted in the table, an "MODIFY" event is triggered, an [AWS Lambda](https://aws.amazon.com/lambda) function listens to this event and updates a document/documents based on the recieved record/records using [Meilisearch Client update documents](https://www.meilisearch.com/docs/reference/api/documents#add-or-update-documents).
### Remove event
When an item/items is inserted in the table, an "REMOVE" event is triggered, an [AWS Lambda](https://aws.amazon.com/lambda) function listens to this event and deletes a document/documents based on the recieved record/records primary keys using [Meilisearch Client delete documents](https://www.meilisearch.com/docs/reference/api/documents#delete-documents).

# Modes
Currently the package supports two modes Cloud and Self-hosted:

### Cloud
Uses [Meilisearch Cloud](https://www.meilisearch.com/cloud) service managed by Meilisearch team.
You can check out Meilsearch Cloud [pricing](https://www.meilisearch.com/pricing)
to get started on using the Meilisearch Cloud mode jump to [Getting started with Meilisearch Cloud mode](#getting-started-with-meilisearch-cloud-mode) section
### Self-hosted
Uses the official [Docker](https://www.docker.com) image from [Docker Hub](https://hub.docker.com/r/getmeili/meilisearch) hosted in [AWS Fargate](https://aws.amazon.com/fargate/) behind an [AWS Application Load Balancer](https://aws.amazon.com/elasticloadbalancing/application-load-balancer).
You can calculate the cost [here](https://calculator.aws)
to get started on using the Meilisearch Cloud mode jump to [Getting started with Meilisearch Hosted mode](#getting-started-with-meilisearch-hosted-mode) section

# Getting started
## Getting started with Meilisearch Cloud mode 

 1. Install the package
 Using [NPM](https://www.npmjs.com)
`npm install cdk-dynamodb-search`
or using [Yarn](https://yarnpkg.com)
`yarn add cdk-dynamodb-search`
2. Get the host and the API key
Create an account in [Meilisearch Cloud](https://www.meilisearch.com/cloud) and get the host URL and the API key from your settings.

3. Import the package
Import "WithCloudSearch" into the stack containing the table definition  - **Required**
```typescript
import { WithCloudSearch } from "cdk-dynamodb-search";
```

4. Wrap your DynamoDB table with the WithSearch helper  - **Required**
```typescript
new WithCloudSearch(this,"MySearch", {
	// my_table: dynamodb.Table - Required
	table: my_table  // Add here!!!
});
```

5. Add the search API key (will be used as the [Meilisearch master key](https://www.meilisearch.com/docs/learn/security/basic_security)  - **Required**
```typescript
new WithCloudSearch(this,"MySearch", {
  table: my_table,
  search: {
    // apiKey: string - Required	
    apiKey: "MY_SUPER_SECRET_KEY" // Add here!!!
  }
});
```
6. Add the search host URL - **Required**
```typescript
new WithCloudSearch(this,"MySearch", {
  table: my_table,
  search: {
    apiKey: "MY_SUPER_SECRET_KEY"
  },
  provider: {
    // host: string - Required
    host: "https://...your-meilisearch-host" // Add here!!!
  }
});
```
7. Deploy the solution - **Required**
`npx cdk deploy`

That's it that was the minimal usage.

*Create an item in your table and visit the host URL to see that item has been created successfully.*

## Further customization

If you want further customization you can customize the params:
1. Set the Meilisearch search index - **Optional**
```typescript
new WithCloudSearch(this,"MySearch", {
  table: my_table,
  search: {
    apiKey: "MY_SUPER_SECRET_KEY",
    index: "my-search-index"
  },
  provider: {
    // host: string - Optional
    host: "https://...your-meilisearch-host" // Add here!!!
  }
});
```
## Getting started with Meilisearch Hosted mode 

 1. Install the package
 Using [NPM](https://www.npmjs.com)
`npm install cdk-dynamodb-search`
or using [Yarn](https://yarnpkg.com)
`yarn add cdk-dynamodb-search`

2. Import the package
Import "WithCloudSearch" into the stack containing the table definition  - **Required**
```typescript
import { WithHostedSearch } from "cdk-dynamodb-search";
```

3. Wrap your DynamoDB table with the WithSearch helper  - **Required**
```typescript
new WithHostedSearch(this,"MySearch", {
  // my_table: dynamodb.Table - Required
  table: my_table  // Add here!!!
});
```

4. Add the search API key (will be used as the [Meilisearch master key](https://www.meilisearch.com/docs/learn/security/basic_security)  - **Required**
```typescript
new WithCloudSearch(this,"MySearch", {
  table: my_table,
  search: {
    // apiKey: string - Required - Create your own key
    apiKey: "MY_SUPER_SECRET_KEY" // Add here!!!
  }
});
```

5. Deploy the solution - **Required**
`npx cdk deploy`

That's it that was the minimal usage.

*Create an item in your table and visit the host URL to see that item has been created successfully.*

## Further customization

If you want further customization you can customize the params:
1. Set the Meilisearch search index - **Optional**
```typescript
new WithCloudSearch(this,"MySearch", {
  table: my_table,
  search: {
    apiKey: "MY_SUPER_SECRET_KEY",
    index: "my-search-index"
  },
  provider: {
    // host: string - Optional
    host: "https://...your-meilisearch-host" // Add here!!!
  }
});
```

2. Set the container CPU compute power - **Optional**
-	Import ComputeValue
```typescript
import { 
  WithHostedSearch 
  ComputeValue // Add here!!!
} from "cdk-dynamodb-search";
```
- Add the container CPU compute power

```typescript
new WithCloudSearch(this,"MySearch", {
  table: my_table,
  search: {
    apiKey: "MY_SUPER_SECRET_KEY",
    index: "my-search-index"
  },
  // container: WithSearchProps["ContainerProps"] - Optional
  container: {
    // cpu: ComputeValue - Optional - default 256
    cpu: ComputeValue.v512 // Add here!!!
  }
});
```

2. Set the container memory in megabytes - **Optional**
-	Import ComputeValue
```typescript
import { 
  WithHostedSearch 
  ComputeValue // Add here!!!
} from "cdk-dynamodb-search";
```
- Add the container memory

```typescript
new WithCloudSearch(this,"MySearch", {
  table: my_table,
  search: {
    apiKey: "MY_SUPER_SECRET_KEY",
    index: "my-search-index"
  },
  // container: WithSearchProps["ContainerProps"] - Optional
  container: {
    // memory: ComputeValue - Optional - default 512
    memory: ComputeValue.v1024 // Add here!!!
  }
});
```

## Props
### WithCloudSearch

```typescript
type CloudSearchProps = {
  apiKey: string;
  index?: string;
};
type ProviderProps = {
  host: string;
};
interface WithCloudSearchProps {
  table: dynamodb.Table;
  search: SearchProps;
  provider: ProviderProps;
}
```

### WithHostedSearch

```typescript
type HostedSearchProps = {
  apiKey: string;
  index?: string;
};
enum ComputeValue {
  v256 = 256,
  v512 = 512,
  v1024 = 1024,
  v2048 = 2048,
  v4096 = 4096,
}
type ContainerProps = {
  memoryLimitMiB: ComputeValue.v512;
  cpu: ComputeValue.v256;
};
interface WithHostedSearchProps {
  table: dynamodb.Table;
  search: SearchProps;
  provider: ProviderProps;
}
```

## Useful commands
- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template