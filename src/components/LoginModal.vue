<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header p-0">
            <h4 class="text-primary">Login with {{ type }}</h4>
          </div>

          <div class="modal-body p-0">
            <div v-if="type === 'ledger'">
              <div class="account-selector">
                <p class="mb-4 text-dark">Select the Ledger Account you want to proceed with</p>
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <td class="small">#</td>
                      <td class="small">Address</td>
                      <td class="small">Balance</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(account, index) in accounts" :key="index" @click="useLedgerAccount(index)">
                      <td class="small">{{ index }}</td>
                      <td class="small">{{ account.address }}</td>
                      <td class="small">{{ account.balance }} ZIL</td>
                    </tr>
                  </tbody>
                </table>      
                <div class="d-flex justify-content-between">
                  <button class="btn btn-secondary mr-4" @click="generateLedgerAccount">
                    Generate #{{ currentIndex + 1 }}
                  </button>

                  <button
                    class="btn btn-success"
                    @click="useLedgerAccount(0)"
                    v-if="accounts.length >= 1"
                  >
                    Use #0
                  </button>
                </div>
              </div>
            </div>
            <div v-if="type === 'keystore'">
              <div class="mb-4">
                <label class="d-block">1. Select your keystore.json file</label>
                <div class="file-text">
                  <button class="btn btn-secondary p-2 mr-2" @click="$refs.file.click()">
                    <i class="fas fa-file-upload"></i> BROWSE
                  </button>
                  <span v-if="selected !== undefined && selected.name !== undefined">
                    {{ selected.name }}
                  </span>
                </div>
                <input type="file" ref="file" @change="onFileChange" class="d-none" />
              </div>

              <div>
                <label>2. Enter your passphrase</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="passphrase"
                  placeholder="Passprase"
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
            <button class="btn btn-link text-danger" @click="$emit('close-login')">Cancel</button>
            <button class="btn btn-primary" @click="tryKeystoreLogin" v-if="type === 'keystore'">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { BN, units } from '@zilliqa-js/util';
import Ledger from '@/utils/zil-ledger-interface';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import { Zilliqa } from '@zilliqa-js/zilliqa';
import { mapGetters } from 'vuex';

export default {
  name: 'LoginModal',
  props: ['type'],
  data() {
    return {
      file: null,
      selected: undefined,
      passphrase: '',
      error: false,
      loading: false,
      zilliqa: undefined,
      currentIndex: -1,
      accounts: []
    };
  },
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork'
    })
  },
  methods: {
    readUploadedFileAsText(inputFile) {
      const temporaryFileReader = new FileReader();

      return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
          temporaryFileReader.abort();
          reject(new Error('Problem parsing input file.'));
        };

        temporaryFileReader.onload = () => {
          resolve(temporaryFileReader.result);
        };
        temporaryFileReader.readAsText(inputFile);
      });
    },
    onFileChange() {
      this.selected = this.$refs.file.files[0];
    },
    async generateLedgerAccount() {
      this.loading = 'Trying to create U2F transport.';
      const transport = await TransportU2F.create();
      this.loading = 'Trying to initialize Ledger Transport';
      const zil = new Ledger(transport);
      this.loading = 'Please confirm action on Ledger Device';
      const address = await zil.getPublicAddress(this.currentIndex + 1);

      if (this.zilliqa === undefined) {
        this.zilliqa = new Zilliqa(this.network.url);
      }

      let balance = await this.zilliqa.blockchain.getBalance(address.pubAddr);

      if (balance.error && balance.error.code === -5) {
        this.accounts.push({
          index: this.currentIndex+1,
          address: address.pubAddr,
          balance: 0
        });
      } else {
        const zils = units.fromQa(new BN(balance.result.balance), units.Units.Zil);

        this.accounts.push({
           index: this.currentIndex+1,
          address: address.pubAddr,
          balance: zils
        });
      }

      this.currentIndex = this.currentIndex + 1;

      transport.close();
      this.loading = false;
    },
    useLedgerAccount(index) {
      const account = this.accounts[index];
      EventBus.$emit('login-success', { keystore: account.index, address: account.address });

      if (this.address !== null) {
        this.$emit('close-login');
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

        if (this.selected === '' || this.selected === undefined) {
          throw new Error('Please select your keystore file.');
        }

        if (this.passphrase === '' || this.passphrase === undefined) {
          throw new Error('Please enter passphrase.');
        }

        this.file = await this.readUploadedFileAsText(this.selected);

        const address = await this.zilliqa.wallet.addByKeystore(this.file, this.passphrase);

        EventBus.$emit('login-success', {
          keystore: this.file,
          address: address
        });

        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.error = error.message;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .account-selector {
    .table {
      tr {
        &:hover {
          td {
            background-color: rgba(0,0,0,0.2);
          }
        }
      }
    }
  }
</style>