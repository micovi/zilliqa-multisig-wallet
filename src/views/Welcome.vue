<template>
  <div class="login">
    <div class="container">
      <img class="logo mb-4" src="@/assets/zilliqa-logo.png" />

      <h1 class="title">
        Welcome to Zilliqa
        <br />multisig wallet
      </h1>
      <h2>
        You can now create, import, view wallets or go to
        <span>dashboard</span>
      </h2>

      <div class="actions-container">
        <router-link class="button" :to="{name: 'create-wallet'}">Create Wallet</router-link>
        <router-link class="button" :to="{name: 'import-wallet'}">Import Wallet</router-link>
        <router-link class="button" :to="{name: 'wallet-list'}">Wallet List</router-link>
      </div>
    </div>
    <img class="zilliqa" src="@/assets/zilliqa.png" />
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { Zilliqa } from "@zilliqa-js/zilliqa";

export default {
  name: "login",
  data() {
    return {
      keystoreData: null,
      passphrase: null
    };
  },
  computed: {
    network() {
      return this.$store.state.network;
    },
    Zilliqa() {
      return this.$store.state.Zilliqa;
    }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>


</style>
