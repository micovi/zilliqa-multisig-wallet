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
import Swal from "sweetalert2";
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { mapGetters } from "vuex";
import LedgerInterface from "../utils/zil-ledger-interface";

export default {
  name: "login",
  data() {
    return {
      keystoreData: null,
      passphrase: null,
      zilliqa: null
    };
  },
  computed: {
    ...mapGetters("general", {
      network: "selectedNetwork",
      isLogged: "isLogged"
    })
  },
  mounted() {
    if (this.isLogged === true) {
      return this.$router.push({ name: "welcome" });
    }

    this.zilliqa = new Zilliqa(this.network);
  },
  methods: {
    async loginWithKeystore() {
      const { value: file } = await Swal.fire({
        title: "Select Keystore file",
        input: "file",
        inputAttributes: {
          accept: "application/json"
        }
      });

      if (file) {
        let vm = this;
        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function(e) {
          vm.keystoreData = reader.result;
        };
      }

      const { value: passphrase } = await Swal.fire({
        title: "Verify Keystore",
        input: "password",
        inputPlaceholder: "Enter your passphrase",
        inputAttributes: {
          autocapitalize: "off",
          autocorrect: "off"
        }
      });

      if (passphrase) {
        this.passphrase = passphrase;
        try {
          const account = await this.zilliqa.wallet.addByKeystore(
            this.keystoreData,
            this.passphrase
          );

          this.$store.dispatch("general/login", {
            login_type: "keystore",
            wallet: this.zilliqa.wallet.defaultAccount
          });

          this.$router.push({ name: "welcome" });
        } catch (error) {
          Swal.fire({
            type: "error",
            text: error
          });
        }
      } else {
        Swal.fire({
          type: "error",
          text: "You should type your passphrase"
        });
      }
    },
    loginWithLedger() {
      
    }
  }
};
</script>