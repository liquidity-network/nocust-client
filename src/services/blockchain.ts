// Abstracts web3
import Web3 from 'web3'
import { TransactionConfig } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import BigNumber from 'bignumber.js'

import { NOCUST_ABI } from '../helpers/nocustAbi'
import { ERC20_ABI } from '../helpers/erc20Abi'
import { createSignature, Signature } from '../wallet/signature'
import { TransferParentChainConfig } from '../nocust/transferParentChain'
import { store } from '../store'

// Exporting for external testing purposes only, do not use it in library!
export let web3: Web3
let nocustContract: Contract
const erc20Contracts = new Map<string, Contract>()

function init(rpcUrl: string, contractAddress: string): void {
  web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))

  nocustContract = new web3.eth.Contract(NOCUST_ABI, contractAddress)
}

const addedAccounts: string[] = []
function addPrivateKey(privateKey: string): string {
  const wallet = web3.eth.accounts.wallet.add(privateKey)
  addedAccounts.push(wallet.address.toLowerCase())
  return wallet.address
}

const isPrivateKeyAdded = (address: string) => addedAccounts.includes(address.toLowerCase())

const getBlockNumber = async () => web3.eth.getBlockNumber()

async function getETHBalance(address: string): Promise<BigNumber> {
  try {
    const balance = await web3.eth.getBalance(address)
    return new BigNumber(balance)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function getERC20Balance(address: string, token: string): Promise<BigNumber> {
  try {
    const contract = getErc20Contract(token)
    const balance = await contract.methods.balanceOf(address).call()
    return new BigNumber(balance)
  } catch (e) {
    return Promise.reject(e)
  }
}

const callNocustMethod = async (name: string, params?: Array<any>) =>
  nocustContract.methods[name](...(params || [])).call()

const estimateGasOfNocustMethod = async (
  name: string,
  from: string,
  value: string,
  params?: Array<any>,
): Promise<number> => nocustContract.methods[name](...(params || [])).estimateGas({ from, value })

type NocustSendMethodConfig = {
  address: string
  name: string
  params?: Array<any>
  amount?: BigNumber | string | any
  gasPrice: string
  gasLimit: number
  nonce?: number
}
async function sendNocustMethod(config: NocustSendMethodConfig): Promise<any> {
  const { address, gasPrice, gasLimit, name, amount, params = [], nonce } = config
  const data: TransactionConfig = {
    from: address,
    gasPrice,
    gas: gasLimit,
  }
  if (nonce) {
    data.nonce = nonce
  }
  if (amount) {
    data.value = amount
  }
  return nocustContract.methods[name](...params).send(data)
}

const callERC20Method = async (token: string, name: string, params?: Array<any>) =>
  getErc20Contract(token)
    .methods[name](...(params || []))
    .call()

type ERC20SendMethodConfig = Omit<NocustSendMethodConfig, 'amount'> & { token: string }
async function sendERC20Method(config: ERC20SendMethodConfig): Promise<any> {
  const { address, gasPrice, gasLimit, token, name, params = [] } = config
  return getErc20Contract(token)
    .methods[name](...params)
    .send(<TransactionConfig>{ from: address, gasPrice, gas: gasLimit })
}

function getErc20Contract(token: string): Contract {
  let contract = erc20Contracts.get(token)

  if (!contract) {
    contract = new web3.eth.Contract(ERC20_ABI, token)
    erc20Contracts.set(token, contract)
  }

  return contract
}

async function sign(address: string, hash: string): Promise<Signature> {
  hash = preprocessNocustSign(hash)

  const signature = await web3.eth.sign(hash, address)

  return createSignature(address, hash, signature)
}

const validateSignature = (hash: string, signature: string, address: string) =>
  web3.eth.accounts.recover(preprocessNocustSign(hash), '0x' + signature) === address

const preprocessNocustSign = (data: string) =>
  Web3.utils.soliditySha3('\x19Liquidity.Network Authorization:\n32', data)

const sendEther = async ({ from, to, amount, gasPrice }: TransferParentChainConfig) =>
  web3.eth.sendTransaction({ from, to, gas: 200000, gasPrice, value: amount })

const sendERC20 = async ({ from, to, token, amount, gasPrice }: TransferParentChainConfig) =>
  sendERC20Method({
    name: 'transfer',
    address: from,
    gasPrice,
    gasLimit: 200000,
    token,
    params: [to, amount],
  })

const fetchNetworkId = async () => {
  try {
    store.networkId = await web3.eth.net.getId()
  } catch (e) {
    return Promise.reject(e)
  }
}

// Knowing the on-chain transaction hash this function will return the require reason from the smart-contract.
// It is often a one-letter string but a very helpful one as it allows the find which require statement failed.
const fetchEVMRevertMessage = async (txId: string): Promise<string> => {
  const revertId = '0x08c379a0'
  const tx = await web3.eth.getTransaction(txId)
  console.log('tx', tx)

  if (!tx) throw new Error('[EVM REVERT] The transaction does not exist')

  const txResult = await web3.eth.call(
    {
      from: tx.from,
      to: tx.to,
      data: tx.input,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      value: tx.value,
      nonce: tx.nonce,
    },
    tx.blockNumber,
  )

  console.log('txResult', txResult)

  if (txResult.search(revertId) === -1) {
    throw new Error('[EVM REVERT] The transaction did not revert')
  }

  return web3.utils.hexToAscii('0x' + txResult.slice(revertId.length))
}

export const blockchain = {
  addPrivateKey,
  callERC20Method,
  callNocustMethod,
  fetchEVMRevertMessage,
  getBlockNumber,
  getETHBalance,
  getERC20Balance,
  fetchNetworkId,
  init,
  isPrivateKeyAdded,
  sendERC20Method,
  sendNocustMethod,
  sendEther,
  sendERC20,
  sign,
  validateSignature,
  estimateGasOfNocustMethod,
}
