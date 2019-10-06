<template>
  <div class="wallet-card" @click="openWallet">
    <div class="title">My wallet</div>
    <div class="address mb-2">{{ wallet.contractId }}</div>
    <div class="title">Balance</div>
    <div class="balance mb-2">
      <div class="loading" v-if="loading">Loading...</div>
      <div class="balance-value" v-else>{{ balance }} ZIL</div>
    </div>
    <div class="title">{{ wallet.owners_list.length }} owners</div>
    <div class="address">
      A minimum of
      <span class="text-primary">{{ wallet.signatures }} owners</span> is required to sign any transaction on this wallet.
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import numbro from "numbro";

import { toBech32Address, fromBech32Address } from "@zilliqa-js/crypto";

export default {
  name: "WalletCard",
  data() {
    return {
      loading: true,
      balance: null
    };
  },
  props: ["wallet", "zilliqa"],
  methods: {
    openWallet() {
      return this.$router.push({
        name: "wallet",
        params: { address: this.wallet.contractId }
      });
    }
  },
  async mounted() {
    if (this.zilliqa !== null) {
      const state = await this.zilliqa.blockchain.getSmartContractState(
        this.wallet.contractId
      );

      if (state.result !== undefined && state.error === undefined) {
        this.balance = numbro(state.result._balance).format({
          thousandSeparated: true
        });
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/vars";

.wallet-card {
  border-radius: 0.375rem;
  background-color: $gray;
  padding: 2rem;
  width: 100%;

  overflow: hidden;

  &:hover {
    cursor: pointer;
    background-color: darken($gray, 2);
  }

  .title {
    color: $brand;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 2.125rem;
  }

  .address {
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 400;
  }

  .balance {
    color: #ffffff;
    font-size: 1.75rem;
    font-weight: 700;
    text-transform: uppercase;

    .loading {
      color: $dark;
    }
  }
}
</style>