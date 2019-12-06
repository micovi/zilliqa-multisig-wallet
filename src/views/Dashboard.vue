<template>
  <div class="dashboard">
    <h1 class="title">My Dashboard</h1>
    <h2 class="subtitle text-white">{{ personalBech32 }}</h2>

    <div class="row mt-5">
      <div class="col-12 col-md-7">
        <div class="dashboard-screen">
          <WalletCard :wallet="pinnedWallets[0]" v-if="pinnedWallets[0] !== undefined" />
          <WalletCardPlaceholder v-else />
          <div class="explainerVideo" @click="openVideoModal">
            <div class="title">
              <i class="far fa-play-circle fa-2x mb-2"></i>
            </div>
            <div class="title">Multisig Wallet</div>
            <div class="subtitle">Explainer Video</div>
          </div>
          <WalletCard :wallet="pinnedWallets[1]" v-if="pinnedWallets[1] !== undefined" />
          <WalletCardPlaceholder v-else />

          <div class="infopages">
            <div class="content mb-4">
              Before transactions can be submitted or signed for, the multisig wallet must be initialized.
            </div>
            <div class="title">
              <i class="fas fa-info-circle fa-2x mb-2"></i>
            </div>
            <div class="title">Check the</div>
            <div class="subtitle">info page for more</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import WalletCard from "@/components/WalletCard.vue";
import WalletCardPlaceholder from "@/components/WalletCardPlaceholder.vue";
import { toBech32Address } from "@zilliqa-js/crypto";

export default {
  name: "Dashboard",
  components: {
    WalletCard,
    WalletCardPlaceholder
  },
  computed: {
    ...mapGetters("general", {
      personalAddress: "personalAddress"
    }),
    ...mapGetters("wallets", {
      pinnedWallets: "getPinnedWallets"
    }),
    personalBech32() {
      return toBech32Address(this.personalAddress);
    }
  },
  methods:{
    openVideoModal() {
      EventBus.$emit("video-event");
    }
  }
};
</script>


<style lang="scss" scoped>
@import "@/assets/vars";

.dashboard {
  height: 100%;
}

.dashboard-screen {
  display: grid;
  grid-template-columns: 4fr 3fr;
  grid-gap: 20px;
  grid-template-areas:
    "pinned1 info1"
    "pinned2 info2";
}

.explainerVideo {
  border-radius: 6px;
  background-color: #077a8f;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  cursor:pointer;

  justify-content: flex-end;

  .title {
    color: #ffffff;
    font-size: 21px;
    font-weight: 700;
    line-height: 18px;
  }

  .subtitle {
    color: #ffffff;
    font-size: 24px;
    font-weight: 400;
    line-height: 34px;
  }

  .content {
    color: #ffffff;
    font-size: 12px;
    font-weight: 400;
  }
}
.infopages {
  border-radius: 6px;
  background-color: $gray;
  display: flex;
  flex-direction: column;
  padding: 1rem;

  justify-content: flex-end;

  .title {
    color: #ffffff;
    font-size: 21px;
    font-weight: 700;
    line-height: 18px;
  }

  .subtitle {
    color: #ffffff;
    font-size: 24px;
    font-weight: 400;
    line-height: 34px;
  }

  .content {
    color: #ffffff;
    font-size: 12px;
    font-weight: 400;
  }
}
</style>