<template>
  <div class="add-funds-form">
    <h2 class="subtitle mb-5">New Transaction</h2>

    <div class="big-form mb-5">
      Destination:
      <input type="text" v-model="destination" />
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
      <div class="option">
        Tag:
        <input type="text" v-model="tag" />
      </div>
    </div>

    <div class="buttons">
      <div v-if="isLoading" class="text-white">Please wait while the transaction is deployed.</div>
      <div v-if="!isLoading && !isSuccess">
        <button class="btn btn-primary mr-4" @click="proceed">Submit</button>
        <button class="btn btn-outline-secondary" @click="$emit('cancel-new-transaction')">
          Cancel
        </button>
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
import { validation, units, bytes, BN, Long } from '@zilliqa-js/util';
import { fromBech32Address } from '@zilliqa-js/crypto';
import { mapGetters } from 'vuex';

export default {
  name: 'NewTransaction',
  data() {
    return {
      destination: null,
      amount: 0,
      gasPrice: 1000000000,
      tag: '',
      gasLimit: 50000,
      isLoading: false,
      isSuccess: false
    };
  },
  props: ['zilliqa', 'address'],
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork'
    })
  },
  methods: {
    async proceed() {
      this.isLoading = true;
      const VERSION = bytes.pack(this.network.chainId, this.network.msgVersion);

      let destination = this.destination;

      if (validation.isBech32(destination)) {
        destination = fromBech32Address(destination);
      }

      let amount = units.toQa(this.amount, units.Units.Zil);

      let tx = this.zilliqa.transactions.new({
        version: VERSION,
        toAddr: this.address,
        amount: new BN(0),
        gasPrice: new BN(this.gasPrice),
        gasLimit: Long.fromNumber(this.gasLimit),
        data: JSON.stringify([
            {
              vname: "recipient",
              type: "ByStr20",
              value: `${destination}`
            },
            { vname: "amount", type: "Uint128", value: `${amount}` },
            { vname: "tag", type: "String", value: `${this.tag}` }
          ]
        )
      });

      console.log(tx);

      EventBus.$emit('sign-event', tx);

      this.isLoading = false;
    }
  },
  async mounted() {
    EventBus.$on("sign-success", async tx => {
      if (tx.id !== undefined && tx.receipt.success === true) {
        console.log(tx.receipt);
        this.tx = tx;
        this.isSuccess = true;
      }
    });

    EventBus.$on("sign-error", async tx => {
      console.log(tx);
    });
  }
};
</script>