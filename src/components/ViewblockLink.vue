<template>
    <a :href="link" target="_blank" class="text-white">{{ txid }}</a>
</template>

<script>
export default {
  props: ["txid", "network"],
  computed: {
    link() {
        let link = `https://viewblock.io/zilliqa/tx/0x${this.txid}`;
        
        if(this.network.name === 'Testnet') {
            link = link + '?network=testnet';
        }

        return link;
    }
  }
};
</script>