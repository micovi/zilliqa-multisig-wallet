<template>
  <div class="add-funds-form" v-if="!isSuccess">
    <h2 class="subtitle mb-5">New Transaction</h2>

    <div class="big-form mb-5">
      Destination:
      <div class="d-flex flex-column">
        <input type="text" class="d-block" v-model="destination" @change="checkAddress" />
        <div class="text-danger" v-if="destinationError">{{ destinationError }}</div>
      </div>
      Amount (ZIL):
      <input type="number" min="0" v-model="amount" @change="checkAmount" />
    </div>

    <h2 class="subtitle toggle-advanced-options mb-4" @click="toggleAdvancedOptions">
      Advanced options <i class="fas fa-chevron-down"></i>
    </h2>

    <div class="advanced-options d-none mb-5">
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
    </div>
  </div>
  <success-screen v-else>
    <div class="subtitle text-primary mb-5">
      Transaction has been successfully generated:
      <br />
      <viewblock-link :txid="tx.id" :network="network" />
    </div>
  </success-screen>
</template>

<script>
import Swal from 'sweetalert2';
import { validation, units, bytes, BN, Long } from '@zilliqa-js/util';
import { fromBech32Address } from '@zilliqa-js/crypto';
import { mapGetters } from 'vuex';
import SuccessScreen from '@/components/SuccessScreen';
import ViewblockLink from '@/components/ViewblockLink';

export default {
  name: 'NewTransaction',
  data() {
    return {
      destination: null,
      destinationError: false,
      amount: 0,
      gasPrice: 2000000000,
      tag: '',
      gasLimit: 50000,
      isLoading: false,
      isSuccess: false
    };
  },
  components: {
    SuccessScreen,
    ViewblockLink
  },
  props: ['zilliqa', 'address'],
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork'
    })
  },
  methods: {
    checkAddress() {
      const address = this.destination;
      this.destinationError = false;

      if (!validation.isAddress(address) && !validation.isBech32(address)) {
        this.destination = null;
        this.destinationError = `${address} is not a correct Zilliqa address.`;
      }
    },
    checkAmount() {
      if (this.amount <= -1) {
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
        data: JSON.stringify({
          _tag: 'SubmitTransaction',
          params: [
            {
              vname: 'recipient',
              type: 'ByStr20',
              value: `${destination}`
            },
            { vname: 'amount', type: 'Uint128', value: `${amount}` },
            { vname: 'tag', type: 'String', value: `${this.tag}` }
          ]
        })
      });

      EventBus.$emit('sign-event', tx);

      this.isLoading = false;
    },
    viewblock(txid) {
      let link = `https://viewblock.io/zilliqa/tx/${txid}`;
      
      if(this.network.url === 'https://dev-api.zilliqa.com') {
        link += '?network=testnet';
      }

      return link;
    }
  },
  async mounted() {
    EventBus.$on('sign-success', async tx => {
      if (tx.ledger !== true) {
        if (tx.id !== undefined && tx.receipt.success === true) {
          Swal.fire({
            type: 'success',
            html: `Transaction has been successfully sent <a target="_blank" href="${this.viewblock(tx.id)}">${tx.id}</a>`
          }).then(() => {
            window.location.reload();
          });
        }
      } else {
        Swal.fire({
          type: 'success',
          html: `Transaction has been successfully sent <a target="_blank" href="${this.viewblock(tx.id)}">${tx.id}</a>`
        }).then(() => {
          window.location.reload();
        });
      }
    });

    EventBus.$on('sign-error', async tx => {
      console.log(tx);
    });
  }
};
</script>

<style lang="scss" scoped>
.toggle-advanced-options {
  cursor: pointer;
}
</style>