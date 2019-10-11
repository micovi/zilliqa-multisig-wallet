<template>
  <div class="transactions-list" v-if="this.transactions.length !== 0">
    <div class="heading">
      <h2 class="subtitle">Transactions</h2>
      <div class="filters text-white">
        Filter by:
        <span>All Transactions</span>
      </div>
    </div>
    <div v-for="(trans,index) in transactions" :key="index" class="content transactions-list">
      <div class="transaction">
        <div class="item">
          <div class="font-weight-bold">Tx ID.</div>
          
        </div>
        <div class="item transfer">
          <div class="font-weight-bold">Transfer</div>
          <div class="details d-flex align-items-center">
            <div class="mr-2 address-text">{{ address }}</div>
            <i class="fas fa-arrow-right"></i>
            <div class="address-text">{{ trans.arguments[0] }}</div>
          </div>
        </div>
        <div class="item">
          <div class="font-weight-bold">Amount</div>
          <div>12,234 ZIL</div>
        </div>
        <div class="actions">
          <div class="secondary-actions">
            <div class="unsign">
              <img src="@/assets/Unsign.svg" />
            </div>
            <div class="sign">
              <img src="@/assets/Sign.svg" />
            </div>
          </div>
          <div class="signatures font-weight-bold">2/5</div>

          <div class="main-action">
            <div class="unsign">
              <img src="@/assets/Unsign.svg" />
            </div>
            <div class="sign">
              <img src="@/assets/Sign.svg" />
            </div>
            <div class="execute">
              <img src="@/assets/Execute.svg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="nothing" v-else>
    No transactions found.
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { mapGetters } from 'vuex';

import { Zilliqa } from '@zilliqa-js/zilliqa';
import { validation } from '@zilliqa-js/util';
import { toBech32Address, fromBech32Address } from '@zilliqa-js/crypto';

export default {
  name: 'TransactionsList',
  props: ['address'],
  data() {
    return {
      transactions: []
    };
  },
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork'
    })
  },
  async mounted() {
    let address = this.address;

    if (validation.isBech32(address)) {
      address = fromBech32Address(address);
    }

    const zilliqa = new Zilliqa(this.network.url);

    const state = await zilliqa.blockchain.getSmartContractState(address);
    console.log(state);
    if(state.result.transactions !== undefined) {
      this.transactions = Object.values(state.result.transactions);
    } 
  }
};
</script>

<style scoped lang="scss">
</style>
