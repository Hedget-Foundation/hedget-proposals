import StakerContract from '../abi/Staker.json';
import * as config from '../config';

export default class Staker {
  constructor(web3) {
    this.contract = new web3.eth.Contract(StakerContract.abi, config.eth.stakerContractAddress);
  }

  async getStakeState(address) {
    const stake = await this.contract.methods.getStakeState(address).call();

    const amount = +stake['0'];
    const until = +stake['1'];

    if (amount === 0 && until === 0) return null;
    return {
      amount: amount/1000000,
      until,
      isFresh: Date.now() + 86400 * 7 * 1000 > until * 1000,
    };
  }

  async stake(address, amount, until) {
    await this.contract.methods.stake(amount, until).send({ from: address });
  }

  async withdraw(address) {
    await this.contract.methods.withdraw(address).send({ from: address });
  }
}
