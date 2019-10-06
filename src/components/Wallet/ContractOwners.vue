<template>
  <div class="contract-actions">
    <div class="heading">
      <h2 class="subtitle">Owners</h2>
    </div>
    <div class="content">
      <p class="signatures-info">
        A minimum of
        <span class="text-primary">{{ signatures }} owners</span> is required to sign any transaction of this wallet.
      </p>

      <div class="owner-badge mb-2" v-for="(owner,key) in owners" :key="key">
        <div class="name">Address</div>
        {{ owner.address }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContractOwners",
  props: {
    signatures: String,
    owners: Array
  }
};
</script>


<style lang="scss" scoped>
.signatures-info {
  font-weight: 700;
}
</style>