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

export const GetProposals = gql`
  query {
    proposals {
      id
      sponsor
      witness
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

export const GetWitnessedProposals = gql`
  query {
    proposals(where: { status: Witnessed }) {
      id
      sponsor
      witness
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
      witnessingDetails {
        blockTimestamp
      }
    }
  }
`;
