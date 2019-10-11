<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header p-0">
            <h4 class="text-primary">Sign and deploy transaction</h4>
          </div>

          <div class="modal-body p-0">
            <div v-if="loginType === 'ledger'">
              <div class="loading" v-if="loading">
                <ol>
                  <li>Connect and Unlock Ledger Device to computer</li>
                  <li>Open Zilliqa App</li>
                  <li>Confirm actions on Ledger Device</li>
                </ol>
              </div>
            </div>
            <div v-if="loginType === 'keystore'">
              <div>
                <label>Enter your passphrase</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="passphrase"
                  placeholder="Passphrase"
                />
              </div>
            </div>
            <div class="loading my-4" v-if="loading">
              <div class="icon text-center">
                <i class="fas fa-spinner fa-spin"></i>
                {{ loading }}
              </div>
            </div>
            <div class="alert alert-danger my-2" v-if="error">{{ error }}</div>
          </div>

          <div class="footer d-flex justify-content-end">
            <button class="btn btn-link text-danger" @click="$emit('close-sign')">Cancel</button>
            <button class="btn btn-primary" @click="tryLedgerLogin" v-if="loginType === 'ledger'">
              Retry Connection
            </button>
            <button
              class="btn btn-primary"
              @click="tryKeystoreLogin"
              v-if="loginType === 'keystore'"
            >
              Sign
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Ledger from '@/utils/zil-ledger-interface';
import { getAddressFromPublicKey, fromBech32Address, toBech32Address } from '@zilliqa-js/crypto';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { mapGetters } from 'vuex';

export default {
  name: 'SignModal',
  props: ['tx'],
  data() {
    return {
      file: null,
      selected: undefined,
      passphrase: '',
      error: false,
      loading: false,
      zilliqa: undefined
    };
  },
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork',
      loginType: 'walletType',
      keystore: 'getKeystore'
    })
  },
  methods: {
    async tryLedgerLogin() {
      this.errors = false;
      this.loading = false;
      try {
        this.loading = 'Trying to create U2F transport.';
        const transport = await TransportU2F.create();
        this.loading = 'Trying to initialize Ledger Transport';
        const zil = new Ledger(transport);
        this.loading = 'Please confirm action on Ledger Device';
        const address = await zil.getPublicAddress();

        this.address = address.pubAddr;
        this.loading = false;

        EventBus.$emit('login-success', address);

        if (this.address !== null) {
          this.$emit('close-login');
        }
      } catch (error) {
        this.error = error.message;
      }
    },
    async tryKeystoreLogin() {
      this.error = false;
      this.login = false;

      try {
        this.loading = 'Trying to decrypt keystore file and access wallet...';

        if (this.zilliqa === undefined) {
          this.zilliqa = new Zilliqa(this.network.url);
        }

        if (this.passphrase === '' || this.passphrase === undefined) {
          throw new Error('Please enter passphrase.');
        }

        const address = await this.zilliqa.wallet.addByKeystore(this.keystore, this.passphrase);

        console.log(this.tx);

        this.loading = 'Trying to Sign and Deploy using Keystore Wallet...';

        const signedTx = await this.zilliqa.blockchain.createTransaction(this.tx);

        if (signedTx.receipt !== undefined && signedTx.receipt.success !== undefined) {
          EventBus.$emit('sign-success', signedTx);
        } else {
          EventBus.$emit('sign-error', signedTx);
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.error = error.message;
      }
    }
  },
  async mounted() {
    console.log(this.tx);
  }
};
</script>