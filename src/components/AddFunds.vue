<template>
  <div class="add-funds-form">
    <h2 class="subtitle mb-5">Add funds</h2>

    <div class="big-form mb-5">
      Wallet address:
      <input type="text" :value="bech32" disabled />
      Amount (ZIL):
      <input type="number" v-model="amount" />
    </div>

    <h2 class="subtitle">Advanced options</h2>

    <div class="advanced-options mb-5">
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
      <div v-if="isLoading" class="text-white">
        Please wait while the transaction is deployed.
      </div>
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
</template>

<script>
import { mapGetters } from "vuex";
import { bytes, BN, Long, units } from "@zilliqa-js/util";

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
  computed: {
    ...mapGetters("general", {
      network: "selectedNetwork",
      personalAddress: "personalAddress"
    })
  },
  methods: {
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

      // Send a transaction to the network
      tx = await this.zilliqa.blockchain.createTransaction(tx);

      this.isLoading = false;

      if (tx.id !== undefined && tx.receipt.success === true) {
        console.log(tx.receipt);
        this.tx = tx;
        this.isSuccess = true;
      }
    }
  }
};
</script>