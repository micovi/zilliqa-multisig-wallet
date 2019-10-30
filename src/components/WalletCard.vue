<template>
  <div class="wallet-card" :class="walletColor">
    <div class="actions">
      <div class="pallete-colors action" :class="{open: isOpen}">
        <div class="color pallete-blue" @click="colorWallet('blue')"></div>
        <div class="color pallete-purple" @click="colorWallet('purple')"></div>
        <div class="color pallete-green" @click="colorWallet('green')"></div>
        <div class="color pallete-black" @click="colorWallet('black')"></div>
        <div class="color pallete-none" @click="colorWallet(undefined)"></div>
      </div>
      <div class="pallete action" @click="openPallete">
        <svg
          id="painter-palette"
          xmlns="http://www.w3.org/2000/svg"
          width="11.693"
          height="11.693"
          viewBox="0 0 11.693 11.693"
        >
          <g id="palette" transform="translate(0 0)">
            <path
              id="Path_39"
              data-name="Path 39"
              d="M5.847,0a5.847,5.847,0,1,0,0,11.693,1,1,0,0,0,.974-.974.834.834,0,0,0-.26-.65,1.154,1.154,0,0,1-.26-.65,1,1,0,0,1,.974-.974H8.445A3.217,3.217,0,0,0,11.693,5.2C11.693,2.339,9.095,0,5.847,0ZM2.274,5.847A1,1,0,0,1,1.3,4.872,1,1,0,0,1,2.274,3.9a1,1,0,0,1,.974.974A1,1,0,0,1,2.274,5.847Zm1.949-2.6a1,1,0,0,1-.974-.974A1,1,0,0,1,4.223,1.3a1,1,0,0,1,.974.974A1,1,0,0,1,4.223,3.248Zm3.248,0A1,1,0,0,1,6.5,2.274a.974.974,0,1,1,1.949,0A1,1,0,0,1,7.471,3.248Zm1.949,2.6a.974.974,0,0,1,0-1.949,1,1,0,0,1,.974.974A1,1,0,0,1,9.42,5.847Z"
              transform="translate(0 0)"
              fill="#fff"
            />
          </g>
        </svg>
      </div>
      <div
        class="pin action"
        v-bind:class="{ isPinned: wallet.pinned }"
        @click="$emit('pin-wallet', wallet.contractId)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="7.926"
          height="11.449"
          viewBox="0 0 7.926 11.449"
        >
          <g id="paper-push-pin" transform="translate(-73.088)">
            <path
              id="Path_38"
              data-name="Path 38"
              d="M80.474,5.962a1.551,1.551,0,0,0-1.221-.678V1.761a.846.846,0,0,0,.619-.261.846.846,0,0,0,.262-.619.846.846,0,0,0-.262-.619A.846.846,0,0,0,79.253,0h-4.4a.846.846,0,0,0-.619.261.846.846,0,0,0-.261.619.846.846,0,0,0,.261.619.847.847,0,0,0,.619.261V5.284a1.551,1.551,0,0,0-1.221.678,2.383,2.383,0,0,0-.54,1.524.446.446,0,0,0,.44.44h2.78l.523,3.337a.2.2,0,0,0,.22.186h.007a.193.193,0,0,0,.141-.058.254.254,0,0,0,.072-.141l.351-3.323h2.952a.447.447,0,0,0,.441-.44A2.382,2.382,0,0,0,80.474,5.962Zm-4.084-.9a.22.22,0,1,1-.44,0V1.982a.22.22,0,1,1,.44,0Z"
              fill="#fff"
            />
          </g>
        </svg>
      </div>
    </div>
    <div class="body" @click="openWallet">
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
        <span class="text-primary">{{ wallet.signatures }} owners</span> is required to sign any
        transaction on this wallet.
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import numbro from 'numbro';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { units, BN } from '@zilliqa-js/util';

export default {
  name: 'WalletCard',
  data() {
    return {
      loading: true,
      balance: null,
      isOpen: false
    };
  },
  props: ['wallet', 'zilliqa'],
  methods: {
    openWallet() {
      return this.$router.push({
        name: 'wallet',
        params: { address: this.wallet.contractId }
      });
    },
    openPallete() {
      this.isOpen = !this.isOpen;
    },
    colorWallet(color) {
      this.wallet.color = color;
      this.$emit('color-wallet', {wallet: this.wallet.contractId, color});

      this.isOpen = false;
    }
  },
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork'
    }),
    walletColor() {
      return `pallete-${this.wallet.color}`;
    }
  },
  async mounted() {
    if (this.zilliqa !== undefined) {
      const state = await this.zilliqa.blockchain.getSmartContractState(this.wallet.contractId);

      if (state.result !== undefined && state.error === undefined) {
        const fbalance = units.fromQa(new BN(state.result._balance), units.Units.Zil);

        this.balance = numbro(fbalance).format({
          thousandSeparated: true,
          mantissa: 0
        });
        this.loading = false;
      }
    } else {
      const zilliqa = new Zilliqa(this.network.url);

      const state = await zilliqa.blockchain.getSmartContractState(this.wallet.contractId);

      if (state.result !== undefined && state.error === undefined) {
        const fbalance = units.fromQa(new BN(state.result._balance), units.Units.Zil);

        this.balance = numbro(fbalance).format({
          thousandSeparated: true,
          mantissa: 0
        });
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import '@/assets/vars';

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