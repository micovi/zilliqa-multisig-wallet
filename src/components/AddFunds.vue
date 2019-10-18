<template>
  <div class="add-funds-form" v-if="!isSuccess">
    <h2 class="subtitle mb-5">Add funds</h2>

    <div class="big-form mb-5">
      Wallet address:
      <input type="text" :value="bech32" disabled />
      Amount (ZIL):
      <input type="number" min="0" @change="checkAmount" v-model="amount" />
    </div>

    <h2 class="subtitle toggle-advanced-options mb-4" @click="toggleAdvancedOptions">Advanced options</h2>

    <div class="advanced-options d-none mb-5">
      <div class="option">
        Gas price:
        <input type="number" v-model="gasPrice" />
      </div>
      <div class="option">
        Gas limit:
        <input type="number" v-model="gasLimit" />
      </div>
    </div>

    <div class="buttons">
      <div v-if="isLoading" class="text-white">Please wait while the transaction is deployed.</div>
      <div v-if="!isLoading && !isSuccess">
        <button class="btn btn-primary mr-4" @click="proceed">Submit</button>
        <button class="btn btn-outline-secondary" @click="$emit('cancel-add-funds')">Cancel</button>
      </div>

      <div class="text-success mt-5" v-if="isSuccess">
        Transaction has been successfully deployed.
        <br />
        {{ tx.id }}
      </div>
    </div>
  </div>
  <success-screen v-else>
    <div class="subtitle text-primary mb-5">
      Transaction has been successfully deployed:
      <br />
      <viewblock-link :txid="tx.id" :network="network" />
    </div>
  </success-screen>
</template>

<script>
import { mapGetters } from "vuex";
import { bytes, BN, Long, units } from "@zilliqa-js/util";
import { toBech32Address, fromBech32Address } from "@zilliqa-js/crypto";

import SuccessScreen from "@/components/SuccessScreen";
import ViewblockLink from "@/components/ViewblockLink";

export default {
  name: "AddFunds",
  props: ["address", "bech32", "zilliqa"],
  data() {
    return {
      amount: 0,
      gasPrice: 1000000000,
      gasLimit: 50000,
      isLoading: false,
      isSuccess: false,
      txId: null
    };
  },
  components: {
    SuccessScreen,
    ViewblockLink
  },
  computed: {
    ...mapGetters("general", {
      network: "selectedNetwork",
      personalAddress: "personalAddress"
    })
  },
  methods: {
    checkAmount() {
      if(this.amount <= -1) {
        this.amount = 0;
      }
    },
    toggleAdvancedOptions() {
      const adv = document.querySelector('.advanced-options');

      adv.classList.toggle('d-none');
    },
    async proceed() {
      this.isLoading = true;
      const VERSION = bytes.pack(this.network.chainId, this.network.msgVersion);

      let tx = this.zilliqa.transactions.new({
        version: VERSION,
        toAddr: this.address,
        amount: new BN(units.toQa(this.amount, units.Units.Zil)),
        gasPrice: new BN(this.gasPrice),
        gasLimit: Long.fromNumber(this.gasLimit),
        data: JSON.stringify({
          _tag: "AddFunds",
          params: []
        })
      });

      EventBus.$emit("sign-event", tx);

      this.isLoading = false;
    }
  },
  async mounted() {
    EventBus.$on("sign-success", async tx => {
      if (tx.id !== undefined && tx.receipt.success === true) {
        Swal.fire({
            type: "success",
            html: `Transaction has been successfully sent <a href="https://viewblock.io/tx/${tx.id}?network=testnet">${tx.id}</a>`
          }).then(() => {
            window.location.reload();
          });
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.advanced-options {
  margin-bottom: 2rem;
}

.toggle-advanced-options {
  cursor: pointer;
}
</style>