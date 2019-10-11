<template>
  <div class="add-funds-form" v-if="!isSuccess">
    <h2 class="subtitle mb-5">Import Wallet</h2>

    <div class="big-form mb-5">
      Wallet address:
      <input type="text" v-model="address" />
    </div>

    <div class="buttons">
      <div v-if="isLoading" class="text-white">
        <i class="fas fa-spinner fa-spin"></i> Please wait while we verify and import the contract.
      </div>
      <div v-if="!isLoading && !isSuccess">
        <button class="btn btn-primary mr-4" @click="proceed">Import wallet</button>
        <button class="btn btn-outline-secondary" @click="$emit('cancel-add-funds')">
          Cancel
        </button>
      </div>
    </div>
  </div>

  <success-screen v-else>
    <div class="subtitle text-primary mb-5">
      Your wallet was deployed with the following address
      <br />
      <span class="text-white">{{ address }}</span>
    </div>
    <router-link class="btn btn-primary" :to="{ name: 'wallet', params: { address: address } }"
      >Go to wallet now</router-link
    >
  </success-screen>
</template>

<script>
import Swal from 'sweetalert2';
import { mapGetters } from 'vuex';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { bytes, BN, Long, units, validation } from '@zilliqa-js/util';
import { toBech32Address, fromBech32Address } from '@zilliqa-js/crypto';
import { SuccessScreen } from '@/components/SuccessScreen';

export default {
  name: 'ImportWallet',
  components: {
    SuccessScreen
  },
  data() {
    return {
      address: '',
      isSuccess: false,
      isLoading: false,
      deployedWallet: null,
      owners_list: []
    };
  },
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork',
      personalAddress: 'personalAddress'
    })
  },
  methods: {
    constructOwners(list) {
      if (list.arguments.length === 2) {
        this.owners_list.push({
          address: toBech32Address(list.arguments[0])
        });

        return this.constructOwners(list.arguments[1]);
      }
      return null;
    },
    async proceed() {
      this.isLoading = true;

      let address = this.address;

      if (validation.isBech32(address)) {
        address = fromBech32Address(address);
      }

      const zilliqa = new Zilliqa(this.network.url);

      const init = await zilliqa.blockchain.getSmartContractInit(address);
      const signatures = init.result.find(item => item.vname === 'required_signatures');
      const owners = init.result.find(item => item.vname === 'owners_list');

      this.constructOwners(owners.value);

      this.deployedWallet = {
        transId: null,
        contractId: toBech32Address(address),
        owners_list: this.owners_list,
        signatures: signatures.value,
        network: this.network.url
      };

       try {
        this.$store.dispatch('wallets/addWallet', this.deployedWallet);
        this.isSuccess = true;
        this.isLoading = false;
      } catch (error) {
        Swal.fire({
          type: 'error',
          text: error
        });
      }
    }
  }
};
</script>