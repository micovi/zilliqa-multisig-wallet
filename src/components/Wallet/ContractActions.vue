<template>
  <div class="contract-actions">
    <div class="heading">
      <h2 class="subtitle">Balance</h2>
    </div>
    <div class="content">
      <div class="balance mb-4">{{ formattedBalance }} ZIL</div>

      <button class="btn btn-primary btn-block mb-3"  @click="$emit('new-transaction')">
        <i class="fas fa-exchange-alt"></i> Transaction
      </button>
      <button href="#" class="btn btn-outline-primary text-primary btn-block" @click="$emit('add-funds')">
        <i class="fas fa-long-arrow-alt-down"></i> Add funds
      </button>
      {{ address }}
    </div>
  </div>
</template>

<script>
import numbro from "numbro";

export default {
  name: "ContractActions",
  props: ["address", "zilliqa", "balance"],
  computed: {
    formattedBalance() {
      return numbro(this.balance).format({ thousandSeparated: true, mantissa:0 });
    }
  }
};
</script>


<style lang="scss" scoped>
.balance {
  font-size: 1.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
}
.btn {
  padding: 1.25rem;
}
.btn-outline-primary {
  &:hover {
    color: #fff !important;
  }
}
</style>