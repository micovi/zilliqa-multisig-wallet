<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header p-0">
            <h4 class="text-primary">Sign and send transaction</h4>
          </div>

          <div class="modal-body p-0">
            <div v-if="loginType === 'ledger'">
              <div class="loading">
                <ol>
                  <li>Connect and Unlock Ledger Device to computer</li>
                  <li>Open Zilliqa App</li>
                  <li>Click Sign with Ledger and follow instructions</li>
                </ol>
              </div>
            </div>
            <div v-if="loginType === 'keystore'">
              <div>
                <label>Enter your passphrase</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="passphrase"
                  placeholder="Passphrase"
                />
              </div>
            </div>
            <div class="loading my-4" v-if="loading">
              <div class="icon text-center">
                <i class="fas fa-spinner fa-spin"></i>
                {{ loading }}
              </div>
            </div>

            <div class="my-4" v-if="success">
              <div class="icon text-center">
                <p>{{ success }}</p>
                <viewblock-link :txid="txId" :network="network" />
              </div>
            </div>
            <div class="alert alert-danger my-2" v-if="error">{{ error }}</div>
          </div>

          <div class="footer d-flex justify-content-end">
            <button class="btn btn-link text-danger" @click="$emit('close-sign')">Cancel</button>
            <button
              class="btn btn-primary"
              @click="tryLedgerSign"
              v-if="!actionHappening && loginType === 'ledger' && loading === false && success === false"
            >Sign with Ledger</button>
            <button
              class="btn btn-primary"
              @click="tryKeystoreSign"
              v-if="!actionHappening && loginType === 'keystore' && loading === false && success === false"
            >Sign</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Ledger from "@/utils/zil-ledger-interface";
import {
  getAddressFromPublicKey,
  fromBech32Address,
  toBech32Address
} from "@zilliqa-js/crypto";

import { BN, units, Long } from "@zilliqa-js/util";
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import { Zilliqa } from "@zilliqa-js/zilliqa";
import { mapGetters } from "vuex";
import ViewblockLink from "@/components/ViewblockLink";

export default {
  name: "SignModal",
  props: ["tx"],
  components: {
    ViewblockLink
  },
  data() {
    return {
      file: null,
      selected: undefined,
      passphrase: "",
      error: false,
      actionHappening: false,
      loading: false,
      success: false,
      txId: "",
      zilliqa: undefined
    };
  },
  computed: {
    ...mapGetters("general", {
      network: "selectedNetwork",
      loginType: "walletType",
      keystore: "getKeystore"
    })
  },
  methods: {
    async tryLedgerSign() {
      this.errors = false;
      this.loading = false;
      this.actionHappening = true;

      if (this.zilliqa === undefined) {
        this.zilliqa = new Zilliqa(this.network.url);
      }

      try {
        this.loading = "Trying to create U2F transport.";
        const transport = await TransportU2F.create();
        this.loading = "Trying to initialize Ledger U2F Transport";
        const zil = new Ledger(transport);
        this.loading = "Please confirm Public Key generation on Ledger Device";
        // const address = await zil.signTxn(0, this.tx.txParams);
        const pubkey = await zil.getPublicKey(0);

        const address = getAddressFromPublicKey(pubkey.publicKey);

        let balance = await this.zilliqa.blockchain.getBalance(address);

        if (balance.error && balance.error.code === -5) {
          throw new Error("Account has no balance.");
        } else {
          let nonce = parseInt(balance.result.nonce) + 1;

          this.loading = "Please Sign the Tx on Ledger Device";

          const oldp = this.tx.txParams;
          console.log("old", oldp);

          const newP = {
            version: oldp.version,
            toAddr: oldp.toAddr,
            amount: oldp.amount,
            code: oldp.code,
            data: oldp.data,
            gasLimit: oldp.gasLimit,
            gasPrice: oldp.gasPrice,
            nonce: nonce,
            pubKey: pubkey.publicKey,
            signature: ""
          };

          const signed = await zil.signTxn(0, newP);
          const signature = signed.sig;

          const newtx = {
            id: "1",
            jsonrpc: "2.0",
            method: "CreateTransaction",
            params: [
              {
                toAddr: oldp.toAddr,
                amount: oldp.amount.toString(),
                code: oldp.code,
                data: oldp.data,
                gasLimit: oldp.gasLimit.toString(),
                gasPrice: oldp.gasPrice.toString(),
                nonce: nonce,
                pubKey: pubkey.publicKey,
                signature: signature,
                version: oldp.version,
                priority: false
              }
            ]
          };

          const response = await fetch(this.network.url, {
            method: "POST", 
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(newtx)
          });

          let data = await response.json();

          if (data.result.TranID !== undefined) {
            this.loading = false;
            EventBus.$emit("sign-success", {
              ledger: true,
              tx: data.result.TranID,
              id: data.result.TranID
            });
            $emit('close-sign');
          }

          if(data.result.error !== undefined) {
            this.actionHappening = false;
            throw new Error(data.result.error.message);
          }
        }
      } catch (error) {
        this.loading = false;
        this.error = error.message;
      }
    },
    async tryKeystoreSign() {
      this.error = false;
      this.login = false;
      this.actionHappening = true;

      try {
        this.loading = "Trying to decrypt keystore file and access wallet...";

        if (this.zilliqa === undefined) {
          this.zilliqa = new Zilliqa(this.network.url);
        }

        if (this.passphrase === "" || this.passphrase === undefined) {
          throw new Error("Please enter passphrase.");
        }

        const address = await this.zilliqa.wallet.addByKeystore(
          this.keystore,
          this.passphrase
        );

        this.loading = "Trying to sign and send transaction...";
        
        const signedTx = await this.zilliqa.blockchain.createTransaction(
          this.tx
        );

        this.actionHappening = false;

        if (
          signedTx.receipt !== undefined &&
          signedTx.receipt.success !== undefined
        ) {
          EventBus.$emit("sign-success", signedTx);
        } else {
          EventBus.$emit("sign-error", signedTx);
        }
        this.loading = false;
      } catch (error) {
        this.actionHappening = false;
        this.loading = false;
        this.error = error.message;
      }
    }
  },
  async mounted() {}
};
</script>