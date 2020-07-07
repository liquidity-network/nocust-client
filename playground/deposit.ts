import { web3 } from '../src/services/blockchain'
import BigNumber from 'bignumber.js'
import { nocust } from '../src/nocust'
import { ERC20_ABI } from '../src'
import { getOperatorConfig } from './operatorConfigs'

const {
  AVERAGE_GAS_PRICE, lqdContractAddress, operatorAddress, operatorPrivateKey,
} = getOperatorConfig('rinkeby') // prettier-ignore

export async function testDeposit() {
  web3.eth.accounts.wallet.add(operatorPrivateKey)

  const bob = web3.eth.accounts.create()
  web3.eth.accounts.wallet.add(bob.privateKey)

  console.log('Sending ETH')
  await web3.eth.sendTransaction({
    from: operatorAddress,
    to: bob.address,
    gas: '200000',
    gasPrice: AVERAGE_GAS_PRICE,
    value: '10000000000000000000',
  })

  console.log('Sending LQD')
  const transactionParams = {
    from: operatorAddress,
    gas: 200000,
    gasPrice: AVERAGE_GAS_PRICE,
  }
  const contract = new web3.eth.Contract(ERC20_ABI, lqdContractAddress, transactionParams)
  await contract.methods.transfer(bob.address, '1000000000').send()

  console.log('Depositing LQD')
  await nocust.approveDeposits({ address: bob.address, token: lqdContractAddress, gasPrice: AVERAGE_GAS_PRICE })

  await nocust.deposit({
    amount: new BigNumber(10),
    token: lqdContractAddress,
    address: bob.address,
    gasPrice: new BigNumber(AVERAGE_GAS_PRICE),
  })
}
