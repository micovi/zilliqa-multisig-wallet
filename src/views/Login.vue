<template>
  <div class="login">
    <div class="container">
      <img class="logo mb-4" src="@/assets/zilliqa-logo.png" />

      <h1 class="title">
        Login to Zilliqa
        <br />multisig wallet
      </h1>

      <div class="actions-container">
        <div class="button" @click="loginWithKeystore">Keystore</div>
        <div class="button" @click="loginWithLedger">Ledger</div>
      </div>
    </div>
    <img class="zilliqa" src="@/assets/zilliqa.png" />
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { mapGetters } from 'vuex';

export default {
  name: 'login',
  data() {
    return {
      keystoreData: null,
      passphrase: null,
      zilliqa: null
    };
  },
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork',
      isLogged: 'isLogged'
    })
  },
  mounted() {
    if (this.isLogged === true) {
      return this.$router.push({ name: 'welcome' });
    }

    this.zilliqa = new Zilliqa(this.network);
  },
  methods: {
    async loginWithKeystore() {
      EventBus.$emit('login-event', 'keystore');
    },
    loginWithLedger() {
      EventBus.$emit('login-event', 'ledger');
    }
  }
};
</script>