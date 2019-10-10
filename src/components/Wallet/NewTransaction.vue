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
      <div v-if="isLoading" class="text-white">Please wait while the transaction is deployed.</div>
      <div v-if="!isLoading && !isSuccess">
        <button class="btn btn-primary mr-4" @click="proceed">Submit</button>
        <button class="btn btn-outline-secondary" @click="$emit('cancel-new-transaction')">Cancel</button>
      </div>

      <div class="text-success mt-5" v-if="isSuccess">
        Transaction has been successfully deployed.
        <br />
        {{ tx.id }}
      </div>
    </div>
  </div>
</template>

<script>
import { validation, units, bytes, BN, Long } from "@zilliqa-js/util";
import { fromBech32Address } from "@zilliqa-js/crypto";
import { mapGetters } from "vuex";

export default {
  name: "NewTransaction",
  data() {
    return {
      destination: null,
      amount: 0,
      gasPrice: 1000000000,
      tag: "",
      gasLimit: 50000,
      isLoading: false,
      isSuccess: false
    };
  },
  props: ["zilliqa", "address"],
  computed: {
    ...mapGetters("general", {
      network: "selectedNetwork"
    })
  },
  methods: {
    async proceed() {
      this.isLoading = true;
      const VERSION = bytes.pack(this.network.chainId, this.network.msgVersion);

      let destination = this.destination;

      if (validation.isBech32(destination)) {
        destination = fromBech32Address(destination);
      }

      let amount = units.toQa(this.amount, units.Units.Zil);

      const contract = this.zilliqa.contracts.at(this.address);

      let tx = await contract.call(
        "SubmitTransaction",
        [
          {
            vname: "recipient",
            type: "ByStr20",
            value: destination
          },
          { vname: "amount", type: "Uint128", value: amount },
          { vname: "tag", type: "String", value: this.tag }
        ],
        {
          version: VERSION,
          amount: new BN(units.toQa(this.amount, units.Units.Zil)),
          gasPrice: new BN(this.gasPrice),
          gasLimit: Long.fromNumber(this.gasLimit)
        }
      );

      /* let tx = this.zilliqa.transactions.new({
        version: VERSION,
        toAddr: this.address,
        amount: new BN(units.toQa(this.amount, units.Units.Zil)),
        gasPrice: new BN(this.gasPrice),
        gasLimit: Long.fromNumber(this.gasLimit),
        data: JSON.stringify({
          _tag: "SubmitTransaction",
          params: [
            {
              vname: "recipient",
              type: "ByStr20",
              value: `${destination}`
            },
            {
              vname: "amount",
              type: "Uint128",
              value: `${amount}`
            },
            {
              vname: "tag",
              vname: "String",
              value: `${this.tag}`
            }
          ]
        })
      }); */

      /*  let ddd = {
        id: 1,
        jsonrpc: "2.0",
        method: "CreateTransaction",
        params: [
          {
            version: 21823489,
            toAddr: "0xDC173497d2E62fECeac9570db440126EE3902CeA",
            nonce: 11,
            pubKey:
              "028351704d7f881138b6f7b1330464a9b92728ae30914e585fee5fa33027041149",
            amount: "13000000000000",
            gasPrice: "1000000000",
            gasLimit: "50000",
            code: "",
            data:
              '{"_tag":"SubmitTransaction","params":[{"vname":"recipient","type":"ByStr20","value":"0x9641E9c1e7712db9A8a429fdB42553d03a141fCd"},{"vname":"amount","type":"Uint128","value":"bd2cc61d000"},{"vname":"String","value":""}]}',
            signature:
              "6851a24a1f698f32acc2b65244027b18721794392f0e5a4c2349bb169bb8ac0da427f6f914f224dcf081b17c97889fc36d53d315c0ecd7d8c2f7dcdb9641a1c7",
            priority: false
          }
        ]
      };
 */
      // Send a transaction to the network
      tx = await this.zilliqa.blockchain.createTransaction(tx);

      this.isLoading = false;

      if (tx.id !== undefined && tx.receipt.success === true) {
        console.log(tx.receipt);
        this.tx = tx;
        this.isSuccess = true;
      }
    }
  }
};
</script>