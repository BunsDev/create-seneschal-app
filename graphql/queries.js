import { gql } from '@apollo/client';

export const GetMirrorTransactions = gql`
  query ($digest: String!) {
    transactions(
      tags: [
        { name: "App-Name", values: ["MirrorXYZ"] }
        { name: "Original-Content-Digest", values: [$digest] }
      ]
      sort: HEIGHT_DESC
      first: 1
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`;
