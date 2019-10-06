<template>
  <div class="add-funds-form">
    <h2 class="subtitle mb-5">Add funds</h2>

    <div class="big-form mb-5">
      Wallet address:
      <input type="text" :value="bech32" disabled />
      Amount (ZIL):
      <input type="number" v-model="amount" />
    </div>

    <h2 class="subtitle">Advanced options</h2>

    <div class="advanced-options mb-5">
      <div class="option">
        Gas price:
        <input type="number" v-model="gasPrice" />
      </div>
      <div class="option">
        Gas limit:
        <input type="number" v-model="gasLimit" />
      </div>
    </div>

    <div class="buttons">
      <button class="btn btn-primary mr-4">Submit</button>
      <button class="btn btn-outline-secondary" @click="$emit('cancel-add-funds')">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddFunds",
  props: ["address", "bech32"],
  data() {
    return {
      amount: 0,
      gasPrice: 1000000000,
      gasLimit: 50000
    };
  },
  methods: {
    proceed() {},
  }
};
</script>