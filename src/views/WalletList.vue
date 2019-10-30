<template>
  <div class="wallets-list">
    <h1 class="title mb-5">My wallets</h1>

    <div class="wallets-container">
      <wallet-card
        v-for="wallet in wallets"
        :key="wallet.contractId"
        :zilliqa="zilliqa"
        :wallet="wallet"
        v-on:pin-wallet="pinWallet"
        v-on:color-wallet="colorWallet"
      ></wallet-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Swal from 'sweetalert2';

import { Zilliqa } from '@zilliqa-js/zilliqa';

// @ is an alias to /src
import WalletCard from '@/components/WalletCard';

export default {
  name: 'WalletsList',
  data() {
    return {
      zilliqa: null
    };
  },
  components: {
    WalletCard
  },
  computed: {
    ...mapGetters('wallets', {
      wallets: 'wallets'
    }),
    ...mapGetters('general', {
      network: 'selectedNetwork'
    })
  },
  methods: {
    pinWallet(payload) {
      this.$store.dispatch('wallets/addPin', payload);
      Swal.fire({
        type: 'success',
        text: 'Wallet has been pinned'
      });
    },
    colorWallet(payload) {
      this.$store.dispatch('wallets/colorWallet', payload);
      Swal.fire({
        type: 'success',
        text: 'Wallet color has been saved'
      });
    }
  },
  beforeMount() {
    this.zilliqa = new Zilliqa(this.network.url);
  }
};
</script>


<style lang="scss" scoped>
.wallets-list {
  height: 100%;

  .wallets-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 20px;
  }
}
</style>