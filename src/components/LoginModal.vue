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
              <div class="loading" v-if="loading">
                <ol>
                  <li>Connect and Unlock Ledger Device to computer</li>
                  <li>Open Zilliqa App</li>
                  <li>Confirm Address generation on Ledger Device</li>
                </ol>
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
                    {{
                    selected.name
                    }}
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
            <button
              class="btn btn-primary"
              @click="tryLedgerLogin"
              v-if="type === 'ledger'"
            >Retry Connection</button>
            <button
              class="btn btn-primary"
              @click="tryKeystoreLogin"
              v-if="type === 'keystore'"
            >Login</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Ledger from "@/utils/zil-ledger-interface";
import {
  getAddressFromPublicKey,
  fromBech32Address,
  toBech32Address
} from "@zilliqa-js/crypto";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { mapGetters } from "vuex";

export default {
  name: "LoginModal",
  props: ["type"],
  data() {
    return {
      file: null,
      selected: undefined,
      passphrase: "",
      error: false,
      loading: false,
      zilliqa: undefined
    };
  },
  computed: {
    ...mapGetters("general", {
      network: "selectedNetwork"
    })
  },
  methods: {
    readUploadedFileAsText(inputFile) {
      const temporaryFileReader = new FileReader();

      return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
          temporaryFileReader.abort();
          reject(new Error("Problem parsing input file."));
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
    async tryLedgerLogin() {
      this.errors = false;
      this.loading = false;
      try {
        this.loading = "Trying to create U2F transport.";
        const transport = await TransportU2F.create();
        this.loading = "Trying to initialize Ledger Transport";
        const zil = new Ledger(transport);
        this.loading = "Please confirm action on Ledger Device";
        const address = await zil.getPublicAddress();

        this.address = address.pubAddr;
        this.loading = false;

        EventBus.$emit("login-success", { keystore: null, address: address });

        if (this.address !== null) {
          this.$emit("close-login");
        }
      } catch (error) {
        this.error = error.message;
      }
    },
    async tryKeystoreLogin() {
      this.error = false;
      this.login = false;

      try {
        this.loading = "Trying to decrypt keystore file and access wallet...";

        if (this.zilliqa === undefined) {
          this.zilliqa = new Zilliqa(this.network.url);
        }

        const vm = this;

        if (this.selected === "" || this.selected === undefined) {
          throw new Error("Please select your keystore file.");
        }

        if (this.passphrase === "" || this.passphrase === undefined) {
          throw new Error("Please enter passphrase.");
        }

        this.file = await this.readUploadedFileAsText(this.selected);

        const address = await this.zilliqa.wallet.addByKeystore(
          this.file,
          this.passphrase
        );

        EventBus.$emit("login-success", {
          keystore: this.file,
          address: address
        });

        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.error = error.message;
      }
    }
  },
  async mounted() {
    if (this.type === "ledger") {
      this.tryLedgerLogin();
    }
  }
};
</script>