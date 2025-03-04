import { AbiItem } from 'web3-utils'

export const NOCUST_ABI: AbiItem[] = [
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'slot',
        type: 'uint8',
      },
    ],
    name: 'getPendingWithdrawalsAtSlot',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getTokenTrail',
    outputs: [
      {
        name: '',
        type: 'uint64',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'BLOCKS_PER_EPOCH',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'currentEon',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'hasMissedCheckpointSubmission',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'DEPOSITS_KEPT',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
      {
        name: 'eon',
        type: 'uint256',
      },
    ],
    name: 'getWalletPendingWithdrawalAmountAtEon',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
      {
        name: 'trail',
        type: 'uint64',
      },
      {
        name: 'eon',
        type: 'uint256',
      },
      {
        name: 'txSetRoot',
        type: 'bytes32',
      },
      {
        name: 'deltas',
        type: 'uint256[2]',
      },
      {
        name: 'attester',
        type: 'address',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'verifyProofOfActiveStateUpdateAgreement',
    outputs: [
      {
        name: 'checksum',
        type: 'bytes32',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'sender',
        type: 'address',
      },
      {
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'getChallenge',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint64',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'addr',
        type: 'address',
      },
      {
        name: 'eon',
        type: 'uint256',
      },
    ],
    name: 'getDepositsAtEon',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'checksums',
        type: 'bytes32[2]',
      },
      {
        name: 'trail',
        type: 'uint64',
      },
      {
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        name: 'values',
        type: 'uint256[]',
      },
      {
        name: 'lrPassiveMark',
        type: 'uint256[2][2]',
      },
      {
        name: 'withdrawalAmount',
        type: 'uint256',
      },
    ],
    name: 'requestWithdrawal',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'slot',
        type: 'uint8',
      },
    ],
    name: 'getDepositsAtSlot',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'EXTENDED_BLOCKS_PER_EPOCH',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'getServerContractStateVariables',
    outputs: [
      {
        name: 'parentChainAccumulator',
        type: 'bytes32',
      },
      {
        name: 'lastSubmissionEon',
        type: 'uint256',
      },
      {
        name: 'lastCheckpointRoot',
        type: 'bytes32',
      },
      {
        name: 'isCheckpointSubmitted',
        type: 'bool',
      },
      {
        name: 'missedCheckpointSubmission',
        type: 'bool',
      },
      {
        name: 'liveChallenges',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
      {
        name: 'activeStateChecksum_passiveTransfersRoot',
        type: 'bytes32[2]',
      },
      {
        name: 'trail',
        type: 'uint64',
      },
      {
        name: 'eonPassiveMark',
        type: 'uint256[3]',
      },
      {
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        name: 'values',
        type: 'uint256[]',
      },
      {
        name: 'LR',
        type: 'uint256[2]',
      },
    ],
    name: 'verifyProofOfExclusiveAccountBalanceAllotment',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'eon',
        type: 'uint256',
      },
    ],
    name: 'getPendingWithdrawalsAtEon',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'operator',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'addr',
        type: 'address',
      },
      {
        name: 'slot',
        type: 'uint8',
      },
    ],
    name: 'getWalletDepositActiveStateAtSlot',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'withdrawalAmount',
        type: 'uint256',
      },
      {
        name: 'expiry',
        type: 'uint256',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'requestAuthorizedWithdrawal',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'confirmWithdrawal',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'slot',
        type: 'uint8',
      },
    ],
    name: 'getCheckpointAtSlot',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'bytes32',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
      {
        name: 'checksums',
        type: 'bytes32[2]',
      },
      {
        name: 'trail',
        type: 'uint64',
      },
      {
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        name: 'values',
        type: 'uint256[]',
      },
      {
        name: 'LR',
        type: 'uint256[2]',
      },
      {
        name: 'dummyPassiveMark',
        type: 'uint256[3]',
      },
    ],
    name: 'recoverAllFunds',
    outputs: [
      {
        name: 'recovered',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'beneficiary',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'SR',
        type: 'address[2]',
      },
      {
        name: 'txSetRootChecksum',
        type: 'bytes32[2]',
      },
      {
        name: 'senderTransferRecipientTrails',
        type: 'uint64[3]',
      },
      {
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        name: 'values',
        type: 'uint256[]',
      },
      {
        name: 'lrDeltasPassiveMarkDummyAmount',
        type: 'uint256[2][4]',
      },
      {
        name: 'transferMembershipChain',
        type: 'bytes32[]',
      },
    ],
    name: 'challengeTransferDeliveryWithProofOfPassiveStateUpdate',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
    ],
    name: 'getCurrentEonDepositsWithdrawals',
    outputs: [
      {
        name: 'currentEonDeposits',
        type: 'uint256',
      },
      {
        name: 'currentEonWithdrawals',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'message',
        type: 'bytes32',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'signedMessageECRECOVER',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'trail',
        type: 'uint64',
      },
    ],
    name: 'getTokenAtTrail',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'currentEra',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'hasOutstandingChallenges',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'SR',
        type: 'address[2]',
      },
      {
        name: 'nonceAmount',
        type: 'uint256[2]',
      },
      {
        name: 'trails',
        type: 'uint64[3]',
      },
      {
        name: 'chain',
        type: 'bytes32[]',
      },
      {
        name: 'deltas',
        type: 'uint256[2]',
      },
      {
        name: 'rsTxSetRoot',
        type: 'bytes32[3]',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'challengeTransferDeliveryWithProofOfActiveStateUpdateAgreement',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'allotmentTrail',
        type: 'uint64',
      },
      {
        name: 'membershipTrail',
        type: 'uint64',
      },
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'root',
        type: 'bytes32',
      },
      {
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        name: 'value',
        type: 'uint256[]',
      },
      {
        name: 'LR',
        type: 'uint256[2]',
      },
    ],
    name: 'verifyProofOfExclusiveBalanceAllotment',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'eonNumber',
        type: 'uint256',
      },
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getServerContractLedgerStateVariables',
    outputs: [
      {
        name: 'pendingWithdrawals',
        type: 'uint256',
      },
      {
        name: 'confirmedWithdrawals',
        type: 'uint256',
      },
      {
        name: 'deposits',
        type: 'uint256',
      },
      {
        name: 'totalBalance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
      {
        name: 'expiry',
        type: 'uint256',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
      {
        name: 'attester',
        type: 'address',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'verifyWithdrawalAuthorization',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'txSetRoot',
        type: 'bytes32',
      },
      {
        name: 'trail',
        type: 'uint64',
      },
      {
        name: 'deltas',
        type: 'uint256[2]',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'challengeStateUpdateWithProofOfActiveStateUpdateAgreement',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'allotmentTrail',
        type: 'uint64',
      },
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'root',
        type: 'bytes32',
      },
      {
        name: 'chainValues',
        type: 'bytes32[]',
      },
      {
        name: 'LR',
        type: 'uint256[2]',
      },
    ],
    name: 'verifyProofOfPassiveDelivery',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'genesis',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'eon',
        type: 'uint256',
      },
    ],
    name: 'getLiveChallenges',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'BLOCKS_PER_EON',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'EONS_KEPT',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
    ],
    name: 'getClientContractStateVariables',
    outputs: [
      {
        name: 'latestCheckpointEonNumber',
        type: 'uint256',
      },
      {
        name: 'latestCheckpointsMerkleRoots',
        type: 'bytes32[5]',
      },
      {
        name: 'latestCheckpointsLiveChallenges',
        type: 'uint256[5]',
      },
      {
        name: 'currentEonDeposits',
        type: 'uint256',
      },
      {
        name: 'previousEonDeposits',
        type: 'uint256',
      },
      {
        name: 'secondPreviousEonDeposits',
        type: 'uint256',
      },
      {
        name: 'pendingWithdrawals',
        type: 'uint256[2][]',
      },
      {
        name: 'holderBalance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
    ],
    name: 'getIsWalletRecovered',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'trail',
        type: 'uint256',
      },
      {
        name: 'chain',
        type: 'bytes32[]',
      },
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'merkleRoot',
        type: 'bytes32',
      },
    ],
    name: 'verifyProofOfMembership',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'pure',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'checksums',
        type: 'bytes32[2]',
      },
      {
        name: 'trail',
        type: 'uint64',
      },
      {
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        name: 'value',
        type: 'uint256[]',
      },
      {
        name: 'lrDeltasPassiveMark',
        type: 'uint256[2][3]',
      },
      {
        name: 'rsTxSetRoot',
        type: 'bytes32[3]',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'challengeStateUpdateWithProofOfExclusiveBalanceAllotment',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'tokens',
        type: 'address[2]',
      },
      {
        name: 'senderTransferRecipientTrails',
        type: 'uint64[3]',
      },
      {
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        name: 'txChain',
        type: 'bytes32[]',
      },
      {
        name: 'values',
        type: 'uint256[]',
      },
      {
        name: 'lrDeltasPassiveMark',
        type: 'uint256[2][3]',
      },
      {
        name: 'sellBuyBalanceNonce',
        type: 'uint256[4]',
      },
      {
        name: 'txSetRootChecksumDummy',
        type: 'bytes32[3]',
      },
    ],
    name: 'challengeSwapEnactmentWithProofOfActiveStateUpdateAgreement',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'MIN_CHALLENGE_GAS_COST',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
      {
        name: 'withdrawalAmount',
        type: 'uint256',
      },
      {
        name: 'expiry',
        type: 'uint256',
      },
      {
        name: 'r',
        type: 'bytes32',
      },
      {
        name: 's',
        type: 'bytes32',
      },
      {
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'requestDelegatedWithdrawal',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'holder',
        type: 'address',
      },
    ],
    name: 'recoverOnlyParentChainFunds',
    outputs: [
      {
        name: 'reclaimed',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'lastSubmissionEon',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'slot',
        type: 'uint8',
      },
    ],
    name: 'getConfirmedWithdrawalsAtSlot',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'blocksPerEon',
        type: 'uint256',
      },
      {
        name: 'operator',
        type: 'address',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'eon',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'merkleRoot',
        type: 'bytes32',
      },
    ],
    name: 'CheckpointSubmission',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        name: 'requestor',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        name: 'requestor',
        type: 'address',
      },
      {
        indexed: false,
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalConfirmation',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ChallengeIssued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        name: 'eon',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'trail',
        type: 'uint64',
      },
      {
        indexed: false,
        name: 'allotmentChain',
        type: 'bytes32[]',
      },
      {
        indexed: false,
        name: 'membershipChain',
        type: 'bytes32[]',
      },
      {
        indexed: false,
        name: 'values',
        type: 'uint256[]',
      },
      {
        indexed: false,
        name: 'lrDeltasPassiveMark',
        type: 'uint256[2][3]',
      },
      {
        indexed: false,
        name: 'activeStateChecksum',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'passiveChecksum',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'r',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 's',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'v',
        type: 'uint8',
      },
    ],
    name: 'StateUpdate',
    type: 'event',
  },
  {
    constant: false,
    inputs: [
      {
        name: 'token',
        type: 'address',
      },
    ],
    name: 'registerERC20',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
