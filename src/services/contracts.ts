import BigNumber from 'bignumber.js'

import { store } from '../store'
import { blockchain } from './blockchain'
import { isSameHexValue } from '../helpers/utils'
import { ProofOfExclusiveBalanceAllotment } from '../wallet/eon'
import { Signature } from '../wallet/signature'
import { addHexPrefix } from 'ethereumjs-util'
import getParentChainBalance from '../nocust/getParentChainBalance'

const DEPOSIT_GAS_LIMIT = 300000
const WITHDRAWAL_REQUEST_GAS_LIMIT = 1000000
const RESPONSE_GAS = 100100

type DepositConfig = {
  address: string
  token: string
  amount: BigNumber
  gasPrice: string
  nonce: number
}
async function deposit(config: DepositConfig): Promise<string> {
  const { address, token, amount, gasPrice, nonce } = config
  return blockchain.sendNocustMethod({
    name: 'deposit',
    address,
    params: [token, address, amount.toFixed(0)],
    gasLimit: DEPOSIT_GAS_LIMIT,
    gasPrice: gasPrice,
    amount: isSameHexValue(token, store.contractAddress) ? amount : '0',
    nonce,
  })
}

type RequestWithdrawalConfig = {
  address: string
  amount: BigNumber
  gasPrice: string
  proof: ProofOfExclusiveBalanceAllotment
}
async function requestWithdrawal(config: RequestWithdrawalConfig): Promise<string> {
  const { address, amount, gasPrice, proof } = config

  const data = await blockchain.sendNocustMethod({
    name: 'requestWithdrawal',
    address,
    amount: BigNumber.max(
      store.minChallengeGasCost.multipliedBy(RESPONSE_GAS),
      new BigNumber(gasPrice).multipliedBy(RESPONSE_GAS),
    ),
    gasLimit: WITHDRAWAL_REQUEST_GAS_LIMIT,
    gasPrice,
    params: [
      proof.token,
      [proof.activeStateHash, proof.passiveAggregate.passiveTreeRoot],
      proof.accountProof.trailIdentifier,
      proof.accountProof.path,
      proof.membershipProofPath,
      proof.accountProof.pathValues.map(v => v.toFixed(0)),
      [
        [proof.accountProof.left.toFixed(0), proof.accountProof.right.toFixed(0)],
        [
          proof.passiveAggregate.passiveAmountReceived.toFixed(0),
          proof.passiveAggregate.lastOutgoingTransferPassiveMarker.toFixed(0),
        ],
      ],
      amount.toFixed(0),
    ],
  })

  return data.transactionHash
}

async function fetchBlocksPerEon(): Promise<number> {
  try {
    const data = await blockchain.callNocustMethod('BLOCKS_PER_EON')
    store.blocksPerEon = parseInt(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function fetchGenesisBlock(): Promise<void> {
  try {
    const data = await blockchain.callNocustMethod('genesis')
    store.genesisBlock = parseInt(data)
  } catch (e) {
    return Promise.reject(e)
  }
}

async function fetchContractOwnerAddress(): Promise<void> {
  try {
    store.contractOwner = await blockchain.callNocustMethod('operator')
  } catch (e) {
    return Promise.reject(e)
  }
}

async function fetchSlackPeriod() {
  try {
    store.slackPeriod = await blockchain.callNocustMethod('BLOCKS_PER_EPOCH')
  } catch (e) {
    return Promise.reject(e)
  }
}

async function fetchExtendedSlackPeriod() {
  try {
    store.extendedSlackPeriod = await blockchain.callNocustMethod('EXTENDED_BLOCKS_PER_EPOCH')
  } catch (e) {
    return Promise.reject(e)
  }
}

async function fetchEonsKept() {
  try {
    store.eonsKept = await blockchain.callNocustMethod('EONS_KEPT')
  } catch (e) {
    return Promise.reject(e)
  }
}

async function fetchDepositsKept() {
  try {
    store.depositsKept = await blockchain.callNocustMethod('DEPOSITS_KEPT')
  } catch (e) {
    return Promise.reject(e)
  }
}

const checkOutstandingChallenges = (): Promise<boolean> =>
  blockchain.callNocustMethod('hasOutstandingChallenges') as Promise<boolean>

const checkMissedCheckpointSubmission = (): Promise<boolean> =>
  blockchain.callNocustMethod('hasMissedCheckpointSubmission')

const checkIsWalletRecovered = (address: string, token: string): Promise<boolean> =>
  blockchain.callNocustMethod('getIsWalletRecovered', [token, address])

const getLastSubmissionEon = (): Promise<number> => blockchain.callNocustMethod('lastSubmissionEon')

const getDepositsSumAtEon = (address: string, token: string, eon: number): Promise<number> =>
  blockchain.callNocustMethod('getDepositsAtEon', [token, address, eon])

const fetchMinChallengeGasCost = async (): Promise<void> => {
  try {
    const value = await blockchain.callNocustMethod('MIN_CHALLENGE_GAS_COST')
    store.minChallengeGasCost = new BigNumber(value)
  } catch (e) {
    return Promise.reject(e)
  }
}

const getWalletChallenges = (address: string, token: string): Promise<any> =>
  blockchain.callNocustMethod('getChallenge', [token, address, address])

type SubmitInitialMerkleStateChallenge = {
  address: string
  proof: ProofOfExclusiveBalanceAllotment
  txSetRoot: string
  spent: BigNumber
  gained: BigNumber
  operatorSignature: Signature
  gas: number
  gasPrice: BigNumber
}
const submitInitialMerkleStateChallenge = async (config: SubmitInitialMerkleStateChallenge) => {
  try {
    const challengeName = 'challengeStateUpdateWithProofOfExclusiveBalanceAllotment'
    const challengeParams = [
      config.proof.token,
      [config.proof.activeStateHash, config.proof.passiveAggregate.passiveTreeRoot],
      config.proof.accountProof.trailIdentifier,
      config.proof.accountProof.path.map(x => addHexPrefix(x)),
      config.proof.membershipProofPath.map(x => addHexPrefix(x)),
      config.proof.accountProof.pathValues.map(x => x.toFixed(0)),
      [
        [config.proof.accountProof.left.toFixed(0), config.proof.accountProof.right.toFixed(0)],
        [config.spent.toFixed(0), config.gained.toFixed(0)],
        [
          config.proof.passiveAggregate.passiveAmountReceived.toFixed(0),
          config.proof.passiveAggregate.lastOutgoingTransferPassiveMarker.toFixed(0),
        ],
      ],
      [
        addHexPrefix(config.operatorSignature.r),
        addHexPrefix(config.operatorSignature.s),
        config.txSetRoot,
      ],
      addHexPrefix(config.operatorSignature.v),
    ]

    console.log('challengeParams', challengeParams)

    return blockchain.sendNocustMethod({
      name: challengeName,
      address: config.address,
      amount: BigNumber.max(
        store.minChallengeGasCost.multipliedBy(config.gas),
        config.gasPrice.multipliedBy(config.gas),
      ),
      gasPrice: config.gasPrice.toFixed(0),
      gasLimit: config.gas,
      params: challengeParams,
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

type SubmitInitialEmptyStateChallenge = {
  address: string
  token: string
  trailIdentifier: number
  txSetRoot: string
  spent: BigNumber
  gained: BigNumber
  operatorSignature: Signature
  gas: number
  gasPrice: BigNumber
}
const submitInitialEmptyStateChallenge = async (config: SubmitInitialEmptyStateChallenge) => {
  try {
    const challengeName = 'challengeStateUpdateWithProofOfActiveStateUpdateAgreement'
    const challengeParams = [
      config.token,
      config.txSetRoot,
      config.trailIdentifier,
      [config.spent.toFixed(0), config.gained.toFixed(0)],
      addHexPrefix(config.operatorSignature.r),
      addHexPrefix(config.operatorSignature.s),
      addHexPrefix(config.operatorSignature.v),
    ]
    return blockchain.sendNocustMethod({
      name: challengeName,
      address: config.address,
      amount: BigNumber.max(
        store.minChallengeGasCost.multipliedBy(config.gas),
        config.gasPrice.multipliedBy(config.gas),
      ),
      gasPrice: config.gasPrice.toFixed(0),
      gasLimit: config.gas,
      params: challengeParams,
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

type SubmitDeliveryChallenge = {
  tokenAddress: string
  address: string
  senderAddress: string
  recipientAddress: string
  nonce: BigNumber
  senderTrailIdentifier: number
  transferMembershipTrail: number
  recipientTrailIdentifier: number
  chain: string[]
  txSetRoot: string
  spent: BigNumber
  gained: BigNumber
  amount: BigNumber
  operatorSignature: Signature
  gas: number
  gasPrice: BigNumber
}
const submitDeliveryChallenge = async (config: SubmitDeliveryChallenge) => {
  try {
    const {
      tokenAddress,
      address,
      senderAddress,
      recipientAddress,
      nonce,
      senderTrailIdentifier,
      transferMembershipTrail,
      recipientTrailIdentifier,
      chain,
      txSetRoot,
      spent,
      gained,
      amount,
      operatorSignature,
      gasPrice,
      gas,
    } = config

    const balance = await getParentChainBalance(address)
    const challengeName = 'challengeTransferDeliveryWithProofOfActiveStateUpdateAgreement'
    const challengeParams = [
      addHexPrefix(tokenAddress),
      [addHexPrefix(senderAddress), addHexPrefix(recipientAddress)],
      [nonce.toFixed(0), amount.toFixed(0)],
      [senderTrailIdentifier, transferMembershipTrail, recipientTrailIdentifier],
      chain.map(x => addHexPrefix(x)),
      [spent.toFixed(0), gained.toFixed(0)],
      [
        addHexPrefix(operatorSignature.r),
        addHexPrefix(operatorSignature.s),
        addHexPrefix(txSetRoot),
      ],
      addHexPrefix(operatorSignature.v),
    ]

    const responseReimbursement = await blockchain.estimateGasOfNocustMethod(
      challengeName,
      address,
      balance.toFixed(0),
      challengeParams,
    )

    return blockchain.sendNocustMethod({
      name: challengeName,
      address: config.address,
      amount: store.minChallengeGasCost.multipliedBy(responseReimbursement),
      gasPrice: gasPrice.toFixed(0),
      gasLimit: gas,
      params: challengeParams,
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

type RecoverFundsConfig = {
  token: string
  address: string
  activeStateChecksum: string
  trail: number
  round: number
  allotmentChain: string[]
  membershipChain: string[]
  values: BigNumber[]
  left: BigNumber
  right: BigNumber
  passiveChecksum: string
  passiveAmount: BigNumber
  passiveMarker: BigNumber
  gas: number
  gasPrice: BigNumber
}
const recoverAllFunds = async (config: RecoverFundsConfig) => {
  try {
    const recoverParams = [
      config.token,
      config.address,
      [config.activeStateChecksum, config.passiveChecksum],
      config.trail,
      config.allotmentChain,
      config.membershipChain,
      config.values.map(x => x.toFixed(0)),
      [config.left.toFixed(0), config.right.toFixed(0)],
      ['0', config.passiveAmount.toFixed(0), config.passiveMarker.toFixed(0)],
    ]

    return blockchain.sendNocustMethod({
      name: 'recoverAllFunds',
      address: config.address,
      gasPrice: config.gasPrice.toFixed(0),
      gasLimit: config.gas,
      params: recoverParams,
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

export const contracts = {
  checkMissedCheckpointSubmission,
  checkOutstandingChallenges,
  deposit,
  fetchBlocksPerEon,
  fetchContractOwnerAddress,
  fetchGenesisBlock,
  getDepositsSumAtEon,
  fetchMinChallengeGasCost,
  requestWithdrawal,
  getWalletChallenges,
  fetchSlackPeriod,
  fetchExtendedSlackPeriod,
  fetchEonsKept,
  fetchDepositsKept,
  submitInitialMerkleStateChallenge,
  submitInitialEmptyStateChallenge,
  submitDeliveryChallenge,
  recoverAllFunds,
  getLastSubmissionEon,
  checkIsWalletRecovered,
}
