[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) ![npm](https://img.shields.io/npm/v/create-seneschal-app)


# The Seneschal

![The Seneschal Logo](https://res.cloudinary.com/saimano/image/upload/v1696143767/seneschal/screenshot.png)

**The Seneschal** is a powerful tool that empowers DAO operators to grant shares, loot, and rewards to value-creating participants. This tool enables the creation of piecemeal task-to-task incentives within DAOs, all while maintaining a non-coercive and high-trust environment. It's designed to enhance the functionality and flexibility of decentralized autonomous organizations.

## Getting Started

This starter kit is built using [Next.js](https://nextjs.org/), [Shadcn/UI](https://ui.shadcn.com/), GraphQL, OpenAI, IPFS (using [nft.storage](https://nft.storage/) as the provider), [Hats Protocol](https://www.hatsprotocol.xyz/), [Subgraph](https://thegraph.com/), [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/), [Ethers](https://docs.ethers.org/v5/), and [Zod.js](https://github.com/colinhacks/zod).

### Installation

To create your own instance of **The Seneschal**, you can use the following command:

```bash
npx create-seneschal-app --name <project-name>
```

## Environment Variables

You can find the necessary environment variables in the `sample.env` file. Make sure to configure them to suit your specific setup.

## Usage

- Once you have the contracts deployed, make sure to set up your environment variables by copying the sample environment file provided: `sample.env`.
- Requires a subgraph to your deployed seneschal contract which you can clone [here](https://github.com/manolingam/seneschal-subgraph/). Make sure to update the contract address at `subgraph.yaml`.
- Using [nft.storage](https://nft.storage/) as the IPFS provider. You can either use the same or bring your own provider. Note that, if the provider is changed, you need to make appropriate code changes as well for interacting with IPFS.

Once you have your instance up and running, you can start customizing it to suit your needs. 

## Technologies Used

- Next.js
- Tailwind CSS
- GraphQL
- OpenAI
- IPFS (nft.storage as the provider)
- Hats Protocol
- Subgraph
- Wagmi
- Viem
- Ethers
- Zod.js

## Authors

- Contracts built by [Kyle](https://twitter.com/KyleSt4rgarden)
- Subgraph and Dapp by [Saimano](https://twitter.com/saimano1996)

## Contribution

We welcome contributions from the community to enhance and improve **The Seneschal** project. If you would like to contribute, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/my-feature` or `git checkout -b bugfix/issue-description`.
3. Make your changes and commit them with a descriptive commit message.
4. Push your changes to your forked repository.
5. Create a pull request to the main repository, detailing the changes you've made and any relevant information.

---

*Copyright © 2023 [SilverDoor](https://silverdoor.ai). This project is licensed under the [MIT License](LICENSE).*

