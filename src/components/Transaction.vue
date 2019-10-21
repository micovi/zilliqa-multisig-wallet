<template>
  <div class="transaction mb-4" v-if="!isLoading">
    <div class="item">
      <div class="font-weight-bold">Tx ID.</div>
    </div>
    <div class="item transfer">
      <div class="font-weight-bold">Transfer</div>
      <div class="details d-flex align-items-center">
        <div class="mr-2 address-text">{{ wallet }}</div>
        <i class="fas fa-arrow-right"></i>
        <div class="address-text ml-2">{{ destination }}</div>
      </div>
    </div>
    <div class="item amount">
      <div class="font-weight-bold">Amount</div>
      <div class="font-weight-bold">{{ amount }} ZIL</div>
    </div>
    <div class="actions">
      <div>
        <div class="secondary-actions" v-if="canExecute">
          <div class="unsign" v-if="hasSigned" @click="onUnsign">
            <img src="@/assets/Unsign.svg" />
          </div>
          <div class="sign" v-if="!hasSigned" @click="onSign">
            <img src="@/assets/Sign.svg" />
          </div>
        </div>
      </div>
      <div
        class="signatures font-weight-bold"
      >{{ transaction.signatures_count }}/{{ owners.length }}</div>

      <div class="main-actions">
        <div class="action sign" v-if="!hasSigned && !canExecute" @click="onSign">
          <img src="@/assets/Sign.svg" />
          Sign
        </div>
        <div class="action unsign" @click="onUnsign" v-if="hasSigned && !canExecute">
          <img src="@/assets/Unsign.svg" />
          Unsign
        </div>

        <div class="action execute" @click="onExecute" v-if="canExecute">
          <img src="@/assets/Execute.svg" />
          Execute
        </div>
      </div>
    </div>
  </div>
  <div class="transaction-loading mb-4" v-else>
    <i class="fas fa-spinner fa-spin"></i>
  </div>
</template>

<script>
import numbro from "numbro";
import Swal from "sweetalert2";

import { Zilliqa } from "@zilliqa-js/zilliqa";
import { BN, Long, bytes, units, validation } from "@zilliqa-js/util";
import { fromBech32Address, toBech32Address } from "@zilliqa-js/crypto";
import { mapGetters } from "vuex";

export default {
  name: "Transaction",
  data() {
    return {
      isLoading: false
    };
  },
  props: [
    "transaction",
    "wallet",
    "owners",
    "signatures_need",
    "network",
    "zilliqa"
  ],
  computed: {
    ...mapGetters("general", {
      personalAddress: "personalAddress"
    }),
    amount() {
      return numbro(
        units.fromQa(new BN(this.transaction.amount), units.Units.Zil)
      ).format();
    },
    destination() {
      return fromBech32Address('zil1wahjxzanzuq4eysf9zknyfn4r8dnq6ypm6ggah');
    },
    hasSigned() {
      const personalAddress = this.personalAddress;
      let found = Object.keys(this.transaction.signatures).find(function(item) {
        return toBech32Address(item) === toBech32Address(personalAddress);
      });

      if (found !== undefined) return true;

      return false;
    },
    canExecute() {
      return this.transaction.signatures_count >= this.signatures_need;
    }
  },
  methods: {
    onSign() {
      const VERSION = bytes.pack(this.network.chainId, this.network.msgVersion);

      let tx = this.zilliqa.transactions.new({
        version: VERSION,
        toAddr: fromBech32Address(this.wallet),
        amount: new BN(0),
        gasPrice: new BN(1000000000),
        gasLimit: Long.fromNumber(50000),
        data: JSON.stringify({
          _tag: "SignTransaction",
          params: [
            {
              vname: "transactionId",
              type: "Uint32",
              value: `${this.transaction.key}`
            }
          ]
        })
      });

      EventBus.$emit("sign-event", tx);
    },
    onUnsign() {
      const VERSION = bytes.pack(this.network.chainId, this.network.msgVersion);

      let tx = this.zilliqa.transactions.new({
        version: VERSION,
        toAddr: fromBech32Address(this.wallet),
        amount: new BN(0),
        gasPrice: new BN(1000000000),
        gasLimit: Long.fromNumber(50000),
        data: JSON.stringify({
          _tag: "RevokeSignature",
          params: [
            {
              vname: "transactionId",
              type: "Uint32",
              value: `${this.transaction.key}`
            }
          ]
        })
      });

      EventBus.$emit("sign-event", tx);
    },
    onExecute() {
      const VERSION = bytes.pack(this.network.chainId, this.network.msgVersion);

      let tx = this.zilliqa.transactions.new({
        version: VERSION,
        toAddr: fromBech32Address(this.wallet),
        amount: new BN(0),
        gasPrice: new BN(1000000000),
        gasLimit: Long.fromNumber(50000),
        data: JSON.stringify({
          _tag: "ExecuteTransaction",
          params: [
            {
              vname: "transactionId",
              type: "Uint32",
              value: `${this.transaction.key}`
            }
          ]
        })
      });

      EventBus.$emit("sign-event", tx);
    }
  },
  mounted() {
    let vm = this;
    EventBus.$on("sign-success", async tx => {
      console.log(tx);

      if (tx.ledger === true) {
        Swal.fire({
          type: "success",
          html: `Transaction has been successfully sent <a href="https://viewblock.io/tx/${tx.tx}?network=testnet">${tx.tx}</a>`
        }).then(() => {
          window.location.reload();
        });
      } else {
        if (tx.id !== undefined && tx.receipt.success === true) {
          Swal.fire({
            type: "success",
            html: `Transaction has been successfully sent <a href="https://viewblock.io/tx/${tx.id}?network=testnet">${tx.id}</a>`
          }).then(() => {
            window.location.reload();
          });
        }
      }
    });
    EventBus.$on("sign-error", async err => {
      Swal.fire({
        type: "error",
        text: err
      });
    });
  }
};
</script>