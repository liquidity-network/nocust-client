---
id: "getting-started"
title: "Getting started"
sidebar_label: "Getting started"
---

To install the NOCUST JavaScript API (Current beta version), simply run:

```text
➜ npm install nocust-client@4.0.0-alpha.5
```

As we are manipulating exclusively Ether amounts in Wei \(10^-18 Ether\), we use the `bignumber.js` library for Ether and token amounts \([to go beyond the Javascript safe limit](https://stackoverflow.com/questions/307179/what-is-javascripts-highest-integer-value-that-a-number-can-go-to-without-losin)\).


```text
➜ npm install bignumber.js
```

### NOCUST Transfer - Full Example

We offer two out of the box examples 😍

#### `Browser` Example

Try [here](https://owallet.liquidity.network) a very simple browser wallet. It will automagically register two new wallets with the hub, and make a transfer among them. See the source code on [GitHub](https://github.com/liquidity-network/liquidity-browser-app).

#### `Node` Example

The following JavaScript code sets up the client and transfers 0 fETH 🤪 from Bob 🙋‍♂️ to Alice 🙋‍♀️.

To execute the example code below, follow those steps:

```text
➜ npm install nocust-client@4.0.0-alpha.5   
➜ npm install web3@1.0.0-beta.37 bignumber.js
➜ # copy and paste the code above into `test.js`
➜ node test.js
Transfer to Alice sent ! Transaction ID:  504
```

We tested this example with `npm` version 5.7.1 and `node` version 8.5.0.

```typescript
const Web3 = require('web3'); // Web3 1.0.0-beta.37 only for now
const BigNumber = require('bignumber.js');
const { nocust } = require('nocust-client');

// Setup web3 with Infura
const web3 = new Web3(
  new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/')
);
// create 2 new wallets
const wallets = web3.eth.accounts.wallet.create(2);
const BOB_PUB = wallets[0].address;
const BOB_PRIV = wallets[0].privateKey;
const ALICE_PUB = wallets[1].address;
const ALICE_PRIV = wallets[1].privateKey;

const sendToALice = async () => {
  // init nocust client
  await nocust.init({
    contractAddress: '0x01A6cC0201F51fc6e016DB734489799031881fD3',
    rpcUrl: 'https://rinkeby.infura.io/v3/1e82e39a71a24c6680a9e3feabe71106',
    operatorUrl: 'https://rinkeby-v2.liquidity.network/'
  });

  // Add BOB & ALICE privatekeys to nocust
  await nocust.addPrivateKey(BOB_PRIV);
  console.log("BOB's private key added");
  await nocust.addPrivateKey(ALICE_PRIV);
  console.log("ALICE's private key added");

  // Registering both Bob and Alice to nocust
  await nocust.registerWallet(BOB_PUB);
  console.log("BOB's wallet has been registered");
  await nocust.registerWallet(ALICE_PUB);
  console.log("ALICE's wallet has been registered");

  // Send 0.00 fETH on the commit-chain to Alice
  // In this example, we send 0 fETH, because Alice doesn't have any funds yet, and yes, we can send 0-value commit-chain transaction, haha
  const tx = await nocust.transfer({
    to: ALICE_PUB,
    // 0.00 fEther in Wei as BigNumber.
    amount: new BigNumber(0),
    from: BOB_PUB
  });
  console.log('Transfer to Alice sent ! Transaction ID: ', tx.txId);
};

sendToALice();
```

### Deposits \(Ethereum ➡️ NOCUST\)

To make transfers, you need to have NOCUST funds. NOCUST funds are simply funds deposited into the NOCUST smart-contract, which can be done through the client as follows.

```typescript
const transactionHash = await nocust.deposit({
  address: BOB_PUB,                       // Account from which to make a deposit (its private key needs to be in the Web3 instance)
  amound: web3.utils.toWei(0.5,'ether'),  // Amount to deposit
  gasPrice: web3.utils.toWei(10,'gwei'),  // Gas price, 10 Gwei
});
```

The function `deposit()` makes a contract call to the NOCUST smart contract with the specified amount. The commit-chain funds are available after `20` block confirmation. To check your NOCUST balance, you can call the `getBalance()` function. Note that `deposit()`and `getBalance()` take a parameter `token` to similarly manipulate ERC-20 tokens.

```typescript
const balance : BigNumber = await nocust.getBalance(BOB_PUB);
console.log("Bob's commit-chain balance is: ", balance.toString(), " wei")
```

⚠️ Don't forget to provide a [transfer allowance](https://medium.com/ethex-market/erc20-approve-allow-explained-88d6de921ce9) to the NOCUST contract for the ERC-20 you wish to use. You can also use the function `approveDeposits()` that will check for allowance and make an approve call if necessary.

### NOCUST Transfers \(🙋‍♂️ ➡️ 🙋‍♀️\)

NOCUST transfers are free of gas and instant! See[ the example above](./getting-started#node-example) to learn how to simply make an Ether transfer. 

#### NOCUST ERC-20 Transfers

NOCUST 🌊 support the transfer of ERC-20 tokens. The hub decides which tokens can be used on NOCUST. To see which tokens are currently supported by a NOCUST hub, call `getSupportedTokens()`:

```typescript
const supportedTokenArray = await nocust.getSupportedTokens()

// The first element in the array is for Ether token, its token address it set to the nocust smart-contract address.
const NocustContract = supportedTokenArray[0].address

// Following elements are the tokens supported by the commit-chain 
const tokenXYZcontract = supportedTokenArray[1].address
const tickerName = supportedTokenArray[1].shortName
```

`supportedTokenArray` contains an array of objects containing the information about the ERC-20 tokens supported by the commit-chain. The element at index 0 is for Ether \(reflecting the fETH on the NOCUST commit-chain\).

With the help of the `registerWallet()` function, we can register the tokens we want to use:

```typescript
await nocust.registerWallet(ALICE_PUB, tokenXYZcontract)
// Bob can receive fETH and the fToken at the address `tokenXYZcontract`
```

Note, that the recipient needs to have register at least once in the past with the commit-chain for the specific token prior receiving any transaction. To make a fToken transfer, simply specify the address of the fToken in the `token` field.

```typescript
const txId = await nocust.transfer({
  to: ALICE_PUB,
  amount: web3.utils.toWei(0.01,'ether'), // Amount
  from: BOB_PUB,
  token: tokenXYZcontract,
});
```

### Withdrawals \(NOCUST ➡️ Ethereum\)

A withdrawal allows the user to send NOCUST funds back to Ethereum \(also called an exit\). Withdrawals take time ⌛ and are a two-step process requiring two separate contract calls.

The amount of NOCUST funds available for withdrawal may differ from the current NOCUST balance. Recently acquired NOCUST funds cannot be withdrawn instantly, and need between 36h and 72h \(one full round\) to be available. To check the current balance available for withdrawal call the function `getWithdrawalLimit()` :

```typescript
const withdrawalLimit = await nocust.getWithdrawalLimit(BOB_PUB)
```

To initiate a withdrawal, call `withdrawalRequest()` with an amount &lt;= `withdrawalLimit`:

```typescript
const transactionHash = await nocust.withdraw({
  address: BOB_PUB,                        // Account from which to make the withdrawal
  amount: web3.utils.toWei(0.5,'ether'),   // Amount to withdraw
  gasPrice: web3.utils.toWei(10,'gwei'),   // Gas price, 10 Gwei
});
```

This makes a contract call to initiate a withdrawal. After 36h to 72h \(corresponding to one full NOCUST round\), the withdrawal needs to be confirmed. To query how much time is left before the withdrawal can be confirmed you can call `getBlocksToWithdrawalConfirmation()`:

```typescript
const blocksToConfirmation = await nocust.getBlocksToWithdrawalConfirmation(BOB_PUB)
```

`getBlocksToWithdrawalConfirmation()` returns the number of block confirmations required before to confirm a withdrawal. If the function returns `0`, the withdrawal is ready for confirmation. Note that the function will return `-1` if there is no withdrawal pending.

Finally, to confirm the withdrawal, you can call `confirmWithdrawal()`:

```typescript
const transactionHash = await nocust.confirmWithdrawal(
  address: BOB_PUB,                       // Account from which to make the withdrawal
  gasPrice: web3.utils.toWei(10,'gwei'),  // Gas price, 10 Gwei
);
```

This contract call transfers the funds from the NOCUST smart contract to Bob's address.
