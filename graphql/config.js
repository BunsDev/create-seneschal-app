import { AREWEAVE_GRAPHQL_URI, SENESCHAL_GRAPHQL_URI } from '@/config';
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const AREWEAVE_GRAPHQL_CLIENT = new ApolloClient({
  uri: AREWEAVE_GRAPHQL_URI,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache'
    },
    watchQuery: {
      fetchPolicy: 'no-cache'
    }
  }
});

export const SUBGRAPH_GRAPHQL_CLIENT = new ApolloClient({
  uri: SENESCHAL_GRAPHQL_URI,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache'
    },
    watchQuery: {
      fetchPolicy: 'no-cache'
    }
  }
});
