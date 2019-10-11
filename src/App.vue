<template>
  <div id="app" :class="{loggedIn}">
    <div id="nav" v-if="isLogged && $route.name !== 'welcome'">
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/create-wallet">Create Wallet</router-link>
      <router-link to="/wallets">Wallets List</router-link>
      <router-link to="/import-wallet">Import Wallet</router-link>
    </div>
    <div id="screen-view">
      <NetworkSelector />
      <div class="container flexed pt-4">
        <router-view />
      </div>
    </div>
    <LoginModal v-if="loginModal" v-on:close-login="onCloseLogin" :type="loginType" />
    <SignModal v-if="signModal" v-on:close-sign="onCloseSign" :tx="signTx" />
  </div>
</template>

<script>
import NetworkSelector from "./components/NetworkSelector";
import { mapGetters } from "vuex";

import LoginModal from "@/components/LoginModal";
import SignModal from "@/components/SignModal";

export default {
  name: "App",
  components: {
    NetworkSelector,
    LoginModal,
    SignModal
  },
  data() {
    return {
      loginType: null,
      signModal: false,
      signTx: null,
      loginModal: false
    };
  },
  computed: {
    ...mapGetters("general", {
      isLogged: "isLogged"
    }),
    loggedIn() {
      if (
        this.isLogged === true &&
        this.$route.name !== "login" &&
        this.$route.name !== "welcome"
      ) {
        return true;
      }
      return false;
    }
  },
  methods: {
    onCloseSign() {
      this.signModal = false;
    },
    onCloseLogin() {
      this.loginModal = false;
    }
  },
  mounted() {
    if (!this.isLogged && this.$route.name !== "login") {
      return this.$router.push({ name: "login" });
    }

    EventBus.$on("sign-event", txParams => {
      this.signTx = txParams;
      this.signModal = true;
    });

    EventBus.$on('sign-success', tx => {
      this.signModal = false;
      this.signTx = null;
    })

    EventBus.$on("login-event", loginType => {
      this.loginType = loginType;
      this.loginModal = true;
    });

    EventBus.$on("login-success", ({ keystore, address }) => {
      this.loginModal = false;

      this.$store.dispatch("general/login", {
        login_type: this.loginType,
        keystore: keystore,
        address: address
      });
    });
  }
};
</script>

<style lang="scss">
@import "@/assets/style.scss";
</style>
