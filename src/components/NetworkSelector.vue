<template>
  <div id="networkSelector">
    <div class="logout-button" v-if="isLogged">
      <a href="#" @click="logout">Logout</a>
    </div>
    <div
      :class="{ dropdown: true, zilpay: isZilPay }"
    >
      <div class="toggle">
        Network:
        <span>{{ selectedNetwork.name }}</span>
      </div>

      <div v-if="zilpay" class="dropdown-list">
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
import ZilPayMixin from '@/mixins/zilpay';

export default {
  mixins:[ZilPayMixin],
  data() {
    return {
      isZilPay: false
    }
  },
  computed: mapGetters("general", {
    networks: "networks",
    selectedNetwork: "selectedNetwork",
    isLogged: "isLogged"
  }),
  mounted() {
    this
      .isLoad()
      .then(() => this.zilPayTest())
      .then(test => {
        if (!test) {
          return null;
        }

        this.isZilPay = true;

        this.walletState.network = window.zilPay.wallet.net;
        this.$store.dispatch("general/zilpayAutoChangeNetwork", this.walletState.network);
        this.observables.network = window
          .zilPay
          .wallet
          .observableNetwork()
          .subscribe((net) => {
            this.walletState.network = net;
            this.$store.dispatch("general/zilpayAutoChangeNetwork", net);
          });
      })
  },
  methods: {
    selectNetwork(newUrl) {
      this.$store.dispatch("general/changeNetwork", net);
    },
    logout() {
      this.$store.dispatch("general/logout");

      return this.$router.push({ name: "login" });
    }
  }
};
</script>

<style lang="scss" scoped>
.zilpay {
  opacity: 0.8;
}
</style>