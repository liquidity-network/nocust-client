---
id: "overview"
title: "Overview"
sidebar_label: "Overview"
---

The `nocust-client` allows you to interact with the NOCUST 🌊 commit-chain.

In this document, we describe the client that allows developers to build wallets or dApps with _full commit-chain capabilities_. The client enables you to:

* Deposit \(convert Ethereum ➡️ NOCUST coins\)
* Withdraw \(convert NOCUST coins ➡️ Ethereum\)
* Make payments from address A ➡️ B
* Make atomic swaps between address A ↔️ B

The client currently supports Ether or ERC-20 tokens. Once Ether or tokens are on a NOCUST commit-chain, we refer to them as fast, free \(and furious? 😛\) assets, for example fETH, or fTOKEN. Transactions on the NOCUST commit-chain **cost zero gas** and are **instant** enabling plenty new use-cases 😲. The client internally ensures the security of the NOCUST wallet by monitoring the smart-contract of the NOCUST operator \(Henry\) and the state of the NOCUST commit-chain.

The following figure illustrates the different roles of each component in a NOCUST commit-chain. Bob is the one running the NOCUST client to interact with Henry, the NOCUST operator and the smart contract.
