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
  </div>
</template>

<script>
import NetworkSelector from "./components/NetworkSelector";
import { mapGetters } from "vuex";

export default {
  name: "App",
  components: {
    NetworkSelector
  },
  computed: {
    ...mapGetters("general", {
      isLogged: "isLogged"
    }),
    loggedIn() {
      if (this.isLogged === true && this.$route.name !== "login" && this.$route.name !== "welcome") {
        return true;
      }
      return false;
    }
  },
  mounted() {
    if (!this.isLogged && this.$route.name !== "login") {
      return this.$router.push({ name: "login" });
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/style.scss";
</style>
