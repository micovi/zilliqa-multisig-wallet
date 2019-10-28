<template>
  <div class="wallet-card d-flex flex-column justify-content-center align-items-center">
    <i class="fas fa-question fa-3x mb-4"></i>
    <div class="text-white mb-4">You can pin wallets here.</div>
    <router-link :to="{name:'wallet-list'}" class="btn btn-link text-primary"><i class="fas fa-link"></i> Browse Wallets</router-link>
  </div>
</template>

<script>
export default {
  name: "WalletCardPlaceholder"
};
</script>

<style lang="scss" scoped>
@import "@/assets/vars";

.wallet-card {
  border-radius: 0.375rem;
  background-color: $gray;
  padding: 2rem;
  width: 100%;
  min-height: 220px;

  overflow: hidden;
  .title {
    color: $brand;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 2.125rem;
  }

  .address {
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 400;
  }

  .balance {
    color: #ffffff;
    font-size: 1.75rem;
    font-weight: 700;
    text-transform: uppercase;

    .loading {
      color: $dark;
    }
  }
}
</style>