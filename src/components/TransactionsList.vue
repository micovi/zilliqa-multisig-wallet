<template>
  <div class="transactions-list" v-if="this.transactions.length !== 0">
    <div class="heading">
      <h2 class="subtitle">Transactions</h2>
      <div class="filters text-white">
        Filter by:
        <span>All Transactions</span>
      </div>
    </div>
    <div v-for="(transaction,index) in transactions" :key="index" class="content transactions-list">
      <Transaction
        :transaction="transaction"
        :wallet="address"
        :owners="owners"
        :signature_counts="signature_counts"
        :signatures="signatures"
        :signatures_need="signatures_need"
        :network="network"
        :zilliqa="zilliqa"
      />
    </div>
  </div>

  <div class="nothing text-white" v-else>No transactions found.</div>
</template>

<script>
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { validation } from "@zilliqa-js/util";
import { fromBech32Address } from "@zilliqa-js/crypto";

import Transaction from "@/components/Transaction.vue";

export default {
  name: "TransactionsList",
  props: ["address", "signatures_need", "network"],
  components: {
    Transaction
  },
  data() {
    return {
      transactions: [],
      owners: [],
      signature_counts: {},
      signatures: []
    };
  },
  async mounted() {
    let address = this.address;

    if (validation.isBech32(address)) {
      address = fromBech32Address(address);
    }


    const zilliqa = new Zilliqa(this.network.url);
    this.zilliqa = zilliqa;

    const state = await zilliqa.blockchain.getSmartContractState(address);

    console.log(state.result);

    if (state.result.transactions !== undefined) {
      const transactions = Object.keys(state.result.transactions).map(
        function(key) {
          return {
            key: key,
            destination: state.result.transactions[key].arguments[0],
            amount: state.result.transactions[key].arguments[1],
            third: state.result.transactions[key].arguments[2],
            signatures: state.result.signatures[key],
            signatures_count: state.result.signature_counts[key]
          };
        }
      );

      this.transactions = transactions;
      this.owners = Object.keys(state.result.owners);
      this.signature_counts = state.result.signature_counts;
      this.signatures = Object.values(state.result.signatures);
    }
  }
};
</script>

<style scoped lang="scss">
</style>
