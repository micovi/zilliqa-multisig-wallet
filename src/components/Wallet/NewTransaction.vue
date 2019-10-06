<template>
  <div class="add-funds-form">
    <h2 class="subtitle mb-5">New Transaction</h2>

    <div class="big-form mb-5">
      Destination:
      <input type="text" v-model="destination" />
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
      <div class="option">
        Tag:
        <input type="text" v-model="tag" />
      </div>
    </div>

    <div class="buttons">
      <button class="btn btn-primary mr-4">Submit</button>
      <button class="btn btn-outline-secondary" @click="$emit('cancel-new-transaction')">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewTransaction",
  data() {
    return {
      destination: "",
      amount: 0,
      gasPrice: 1000000000,
      tag: "",
      gasLimit: 50000
    };
  },
  methods: {
    proceed() {}
  }
};
</script>