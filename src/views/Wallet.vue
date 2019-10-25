<template>
  <div class="wallet">
    <h1 class="title">My Wallet</h1>
    <h2 class="subtitle text-white">{{ bech32Address }}</h2>

    <div class="wallet-details mt-5">
      <div class="transactions-container" v-if="!addFunds && !newTransaction">
        <transactions-list :address="this.$route.params.address" :signatures_need="this.wallet.signatures" :network="network"></transactions-list>
      </div>
      <add-funds
        :bech32="bech32Address"
        :address="address"
        :zilliqa="zilliqa"
        v-on:cancel-add-funds="onCancelAddFunds"
        v-if="addFunds"
      ></add-funds>
      <new-transaction :zilliqa="zilliqa" :address="address" v-on:cancel-new-transaction="onCancelNewTransaction" v-if="newTransaction"></new-transaction>
      <div class="sidebar">
        <contract-actions
          :balance="wallet.balance"
          class="mb-4"
          v-on:add-funds="onAddFunds"
          v-on:new-transaction="onNewTransaction"
        ></contract-actions>
        <contract-owners :owners="wallet.owners_list" :signatures="wallet.signatures"></contract-owners>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { mapGetters } from "vuex";

import { Zilliqa } from "@zilliqa-js/zilliqa";
import { toBech32Address, fromBech32Address } from "@zilliqa-js/crypto";

import TransactionsList from "@/components/TransactionsList";
import AddFunds from "@/components/AddFunds";

import ContractActions from "@/components/Wallet/ContractActions";
import ContractOwners from "@/components/Wallet/ContractOwners";
import NewTransaction from "@/components/Wallet/NewTransaction";
import { units, BN, validation } from '@zilliqa-js/util';

export default {
  name: "Wallet",
  components: {
    TransactionsList,
    ContractActions,
    ContractOwners,
    AddFunds,
    NewTransaction
  },
  data() {
    return {
      zilliqa: null,
      init: null,
      address: null,
      bech32Address: null,
      wallet: {
        balance: 0,
        owners_list: [],
        signatures: null
      },
      addFunds: false,
      newTransaction: false
    };
  },
  computed: {
    ...mapGetters("general", {
      network: "selectedNetwork",
      personalAddress: "personalAddress",
      localWallet: "wallet"
    }),
    ...mapGetters("wallets", {
      getWalletOwnersList: "getOwnersList"
    })
  },
  methods: {
    onAddFunds() {
      this.newTransaction = false;
      this.addFunds = true;
    },
    onCancelAddFunds() {
      this.addFunds = false;
    },
    onNewTransaction() {
      this.addFunds = false;
      this.newTransaction = true;
    },
    onCancelNewTransaction() {
      this.newTransaction = false;
    }
  },
  async mounted() {
    try {
      this.zilliqa = new Zilliqa(this.network.url);

      let address = this.$route.params.address;

      if (validation.isBech32(address)) {
        this.bech32Address = address;
        this.address = fromBech32Address(address);
      } else {
        this.bech32Address = toBech32Address(address);
        this.address = address;
      }


      const contract = await this.zilliqa.blockchain.getSmartContractInit(
        this.address
      );

      if (contract.error !== undefined) {
        throw contract.error;
      }

      if (contract.result !== undefined) {
        const required_signatures = contract.result.find(item => {
          return item.vname === "required_signatures";
        });

        this.init = contract.result;

        if (required_signatures === undefined) {
          throw "Required signatures value could not be found.";
        } else {
          this.wallet.signatures = required_signatures.value;
        }

        this.wallet.owners_list = this.getWalletOwnersList(toBech32Address(this.address));
      }

      const contractState = await this.zilliqa.blockchain.getSmartContractState(
        this.address
      );
      
      if (contractState.result !== undefined) {
        this.wallet.balance = units.fromQa(new BN(contractState.result._balance), units.Units.Zil);
      } else {
        throw contractState.error;
      }

      this.transactions = contractState.transactions;
    } catch (error) {
      console.warn(error);
      Swal.fire({
        type: "error",
        text: error.message
      });
      return this.$router.push({ name: "wallet-list" });
    }
  }
};
</script>
