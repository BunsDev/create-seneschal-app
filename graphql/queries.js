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

export const GetSponsoredProposals = gql`
  query {
    proposals {
      id
      sponsor
      processor
      recipient
      status
      commitmentDetails {
        eligibleHat
        shares
        loot
        extraRewardAmount
        timeFactor
        sponsoredTime
        expirationTime
        contextURL
        metadata
        recipient
        extraRewardToken
      }
    }
  }
`;

export const GetProcessedProposals = gql`
  query {
    proposals(where: { status: Processed }) {
      id
      sponsor
      processor
      recipient
      status
      commitmentDetails {
        eligibleHat
        shares
        loot
        extraRewardAmount
        timeFactor
        sponsoredTime
        expirationTime
        contextURL
        metadata
        recipient
        extraRewardToken
      }
      processingDetails {
        blockTimestamp
      }
    }
  }
`;
