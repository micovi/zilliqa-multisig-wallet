<template>
  <div id="networkSelector">
    <div class="logout-button" v-if="isLogged">
      <a @click="logout">Logout</a>
    </div>
    <div class="dropdown">
      <div class="toggle">
        Network:
        <span>{{ selectedNetwork.name }}</span>
      </div>

      <div class="dropdown-list">
        <a
          v-for="(network,index) in networks"
          :key="index"
          class="dropdown-item"
          @click="selectNetwork(network.url)"
        >{{ network.name }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: mapGetters("general", {
    networks: "networks",
    selectedNetwork: "selectedNetwork",
    isLogged: "isLogged"
  }),
  methods: {
    selectNetwork(newUrl) {
      this.$store.dispatch("general/changeNetwork", newUrl);
    },
    logout() {
      this.$store.dispatch("general/logout");

      return this.$router.push({ name: "login" });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>