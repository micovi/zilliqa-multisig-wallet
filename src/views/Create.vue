<template>
  <div class="create-wallet" v-if="isDeployed === false">
    <h1 class="title mb-5">Create a new wallet</h1>
    <p>
      This wallet does not allow adding or removing owners, or changing the number of required
      signatures.
    </p>
    <p class="mb-5">
      WARNING: If a sufficient number of owners lose their private keys, or for any other reason are
      unable or unwilling to sign new transactions, the funds in the wallet will be locked
      forever. It is therefore a good idea to set required_signatures to a value strictly less than
      the number of owners, so that the remaining owners can retrieve the funds should such a
      scenario occur.
    </p>

    <h2 class="subtitle">Add owners</h2>

    <div class="owners-container">
      <div class="owner" v-for="(owner, index) in owners" :key="index">
        <p class="name mb-0">Address</p>
        <span class="address">{{ owner.address }}</span>
        <div class="overlay" @click="removeOwner(index)">Click to remove</div>
      </div>
      <div class="add-owner" @click="addOwner">Add Owner</div>
    </div>

    <div class="text-info small mt-4" v-if="owners.length <= 1">
      You should add minimum 2 owners to a Multisig Wallet.
    </div>

    <div class="create-options mt-5">
      <div class="row">
        <div class="col-12 col-md-3">
          <h2 class="subtitle mb-3">Min. signatures</h2>
          <div class="signature-input">
            <div class="controller minus" @click="signatureMinus" v-if="signatures >= 3">-</div>
            <input type="number" class="mx-1" min="2" :max="owners.length" v-model="signatures" />
            <div class="controller plus" @click="signaturePlus" v-if="signatures < owners.length">
              <span>+</span>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-7">
          <h2 class="subtitle mb-3 toggle-advanced-options"  @click="toggleAdvancedOptions">Advanced options <i class="fas fa-chevron-down"></i></h2>

          <div class="advanced-options d-none mb-5">
            <div class="option">
              Gas price:
              <input type="number" v-model="gasPrice" />
            </div>
            <div class="option">
              Gas limit:
              <input type="number" v-model="gasLimit" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5 d-flex align-items-center">
      <button class="btn btn-primary mr-4" @click="proceed" v-if="!isLoading">Create Wallet</button>

      <div class="loading text-white" v-else>
        <i class="fas fa-spinner fa-spin"></i> Please wait until wallet is deployed.
      </div>
    </div>
  </div>
  <success-screen v-else>
    <div class="subtitle text-primary mb-5">
      Your wallet was deployed with the following address
      <br />
      <span class="text-white">{{ deployedWallet.contractId }}</span>
    </div>
    <router-link
      class="btn btn-primary"
      :to="{ name: 'wallet', params: { address: deployedWallet.contractId } }"
      >Go to wallet now</router-link
    >
  </success-screen>
</template>

<script>
import Swal from 'sweetalert2';

import { Zilliqa } from '@zilliqa-js/zilliqa';
import { BN, Long, bytes, validation } from '@zilliqa-js/util';
import { fromBech32Address, toBech32Address } from '@zilliqa-js/crypto';
import { mapGetters } from 'vuex';
import SuccessScreen from '@/components/SuccessScreen.vue';

export default {
  name: 'CreateWallet',
  components: {
    SuccessScreen
  },
  data() {
    return {
      owners: [],
      signatures: 2,
      gasPrice: 1000000000,
      gasLimit: 25000,
      isLoading: false,
      isDeployed: false,
      zilliqa: null,
      deployedWallet: {}
    };
  },
  computed: {
    ...mapGetters('general', {
      network: 'selectedNetwork',
      walletType: 'walletType',
      personalAddress: 'personalAddress',
      wallet: 'wallet'
    })
  },
  methods: {
    toggleAdvancedOptions() {
      const adv = document.querySelector('.advanced-options');

      adv.classList.toggle('d-none');
    },
    buildOwnersTree(list) {
      var nodes = {};

      if (list[0] !== undefined) {
        let address = list[0].address;

        if (validation.isBech32(address)) {
          address = fromBech32Address(address);
        }

        list.splice(0, 1);
        nodes = {
          constructor: 'Cons',
          argtypes: ['ByStr20'],
          arguments: [address, this.buildOwnersTree(list)]
        };
      } else {
        nodes = {
          constructor: 'Nil',
          argtypes: ['ByStr20'],
          arguments: []
        };
      }

      return nodes;
    },
    signatureMinus() {
      if (this.signatures - 1 >= 2) this.signatures--;
    },
    signaturePlus() {
      if (this.signatures + 1 <= this.owners.length) this.signatures++;
    },
    async addOwner() {
      let { value: address } = await Swal.fire({
        title: 'Add Owner',
        input: 'text',
        inputPlaceholder: 'Enter address'
      });

      try {
        if (validation.isAddress(address) || validation.isBech32(address)) {
          // Validate address to bech32
          if (validation.isAddress(address)) {
            address = toBech32Address(address);
          }

          // Validate for duplicates
          const found = this.owners.find(function(item) {
            return item.address === address;
          });

          if (found !== undefined) {
            throw 'Already added to owners list.';
          }

          this.owners.push({
            address
          });
        } else {
          throw 'Invalid address';
        }
      } catch (error) {
        Swal.fire({
          type: 'error',
          text: error
        });
      }
    },
    removeOwner(index) {
      this.owners.splice(index, 1);
    },
    async proceed() {
      this.isLoading = true;

      try {
        // validations
        if (this.owners.length <= 1) throw 'You should add minimum 2 owners.';
        if (!this.gasPrice) throw 'Gas Price should be set.';
        if (!this.gasLimit) throw 'Gas Limit should be set.';

        const chainId = this.network.chainId; // chainId of the developer testnet
        const msgVersion = this.network.msgVersion; // current msgVersion
        const VERSION = bytes.pack(chainId, msgVersion);

        // Get Minimum Gas Price from blockchain
        const minGasPrice = await this.zilliqa.blockchain.getMinimumGasPrice();
        const myGasPrice = new BN(this.gasPrice); // Gas Price that will be used by all transactions
        const isGasSufficient = myGasPrice.gte(new BN(minGasPrice.result)); // Checks if your gas price is less than the minimum gas price

        if (!isGasSufficient)
          throw `Gas price is set too low. Minimum gas price: ${minGasPrice.result}`;

        let ownersTree = this.buildOwnersTree([...this.owners]);

        const owners_list = {
          vname: 'owners_list',
          type: 'List ByStr20',
          value: ownersTree
        };

        const init = [
          // this parameter is mandatory for all init arrays
          {
            vname: '_scilla_version',
            type: 'Uint32',
            value: '0'
          },
          owners_list,
          {
            vname: 'required_signatures',
            type: 'Uint32',
            value: `${this.signatures}`
          }
        ];

        const tx = this.zilliqa.transactions.new({
          version: VERSION,
          toAddr: '0x0000000000000000000000000000000000000000',
          amount: new BN(0),
          gasPrice: myGasPrice, // in Qa
          gasLimit: Long.fromNumber(this.gasLimit),
          code: `scilla_version 0

import ListUtils IntUtils BoolUtils

(***************************************************)
(*               Associated library                *)
(***************************************************)
library WalletLib

(* Event emitted when the contract is initialized *)
let mk_contract_initialized_event =
  { _eventname : "Contract initialized" }

(* Event for communicating a new transaction id *)
let mk_transaction_added_event =
  fun (tc : Uint32) =>
  fun (recipient : ByStr20) =>
  fun (amount : Uint128) =>
  fun (tag : String) =>
    { _eventname : "Transaction created" ; transactionId : tc; recipient : recipient; amount : amount; tag : tag  }

(* Event for communicating the execution of a transaction *)
let mk_transaction_executed_event =
  fun (tc : Uint32) =>
  fun (recipient : ByStr20) =>
  fun (amount : Uint128) =>
  fun (tag : String) =>
    { _eventname : "Transaction executed"; transactionId : tc; recipient : recipient; amount : amount; tag : tag }

(* Event for communicating that a transaction was signed *)
let mk_signed_transaction_event =
  fun (tc : Uint32) =>
    { _eventname : "Transaction signed"; transactionId : tc }

(* Event for communicating that a signature was revoked *)
let mk_signature_revoked_event =
  fun (tc : Uint32) =>
    { _eventname : "Signature revoked"; transactionId : tc }

type Error =
| NonOwnerCannotSign
| UnknownTransactionId
| InsufficientFunds
| NoSignatureListFound
| AlreadySigned
| NotAlreadySigned
| InvalidContract
| InvalidAmount
| NotEnoughSignatures
| SenderMayNotExecute
| NonOwnerCannotSubmit
| IncorrectSignatureCount

(* Error events *)
let mk_error_event =
  fun (err : Error) =>
  let err_code = 
    match err with
    | NonOwnerCannotSign        => Int32 -1
    | UnknownTransactionId      => Int32 -2
    | InsufficientFunds         => Int32 -3
    | NoSignatureListFound      => Int32 -4
    | AlreadySigned             => Int32 -5
    | NotAlreadySigned          => Int32 -6
    | InvalidContract           => Int32 -7
    | InvalidAmount             => Int32 -8
    | NotEnoughSignatures       => Int32 -9
    | SenderMayNotExecute       => Int32 -10
    | NonOwnerCannotSubmit      => Int32 -11
    | IncorrectSignatureCount   => Int32 -12
    end in
  { _eventname : "WalletError" ; err_code : err_code }

let t = True
let f = False
let zero = Uint32 0
let one = Uint32 1
let transaction_inc = one

(* One (potential) transaction, consisting of a recipient address, an amount, *)
(* and a tag (in case the recipient is another contract *)
type Transaction =
| Trans of ByStr20 Uint128 String

(* Make map of owners *)
let mk_owners_map =
  fun (owners : List ByStr20) =>
    let init = Emp ByStr20 Bool in
    let iter =
      fun (acc : Map ByStr20 Bool) =>
      fun (cur_owner : ByStr20) =>
        (* Add owner unconditionally. We check for duplicates later *)
        builtin put acc cur_owner t
        in
    let folder = @list_foldl ByStr20 (Map ByStr20 Bool) in
    folder iter init owners

(* Check that the number of distinct owners is greater than 0 *)
let check_validity_and_build_owners_map =
  fun (owners : List ByStr20) =>
  fun (required_signatures : Uint32) =>
    let len = @list_length ByStr20 in
    let no_of_owners = len owners in
    let owners_ok = builtin lt zero no_of_owners in
    let required_sigs_not_too_low = builtin lt zero required_signatures in
    let required_sigs_too_high = builtin lt no_of_owners required_signatures in
    let required_sigs_not_too_high = negb required_sigs_too_high in
    let required_sigs_ok = andb required_sigs_not_too_high required_sigs_not_too_low in
    let all_ok = andb required_sigs_ok owners_ok in
    match all_ok with
    | True =>
      let owners_map = mk_owners_map owners in
      let size_of_owners_map = builtin size owners_map in
      let equal_size = builtin eq size_of_owners_map no_of_owners in
      match equal_size with
      | True =>
        (* No duplicates *)
        Some {Map ByStr20 Bool} owners_map
      | False =>
        (* Duplicate owners found *)
        None {Map ByStr20 Bool}
      end
    | False =>
      None {Map ByStr20 Bool}
    end
    
(* Create one transaction message *)
let transaction_msg =
  fun (recipient : ByStr20) =>
  fun (amount : Uint128) =>
  fun (tag : String) =>
    {_tag : tag; _recipient : recipient; _amount : amount }

(* Wrap one transaction message as singleton list *)
let transaction_msg_as_list =
  fun (recipient : ByStr20) =>
  fun (amount : Uint128) =>
  fun (tag : String) =>
    let one_msg = 
      fun (msg : Message) => 
        let nil_msg = Nil {Message} in
        Cons {Message} msg nil_msg in
    let msg = transaction_msg recipient amount tag in
    one_msg msg

type ContractValidity =
| Valid
| Invalid
| Unchecked

let valid = Valid
let invalid = Invalid


(***************************************************)
(*             The contract definition             *)
(*                                                 *)
(* This contract holds funds that can be paid out  *)
(* to arbitrary users, provided that enough people *)
(* in the collection of owners sign off on the     *)
(* payout.                                         *)
(*                                                 *)
(* Before transactions can be submitted or signed  *)
(* for, the contract must be initialized. This is  *)
(* done by invoking the AddFunds transition. This  *)
(* transition initializes the contract fields -    *)
(* if the fields have not been initialized, all    *)
(* other transitions will fail whenever they are   *)
(* invoked.                                        *)
(*                                                 *)
(* The transaction must be added to the contract   *)
(* before signatures can be collected. Once enough *)
(* signatures are collected, the recipient can ask *)
(* for the transaction to be executed and the      *)
(* money paid out.                                 *)
(*                                                 *)
(* If an owner changes his mind about a            *)
(* transaction, the signature can be revoked until *)
(* the transaction is executed.                    *)
(*                                                 *)
(* This wallet does not allow adding or removing   *)
(* owners, or changing the number of required      *)
(* signatures. To do any of those things, perform  *)
(* the following steps:                            *)
(*                                                 *)
(* 1. Deploy a new wallet with owners and          *)
(*    required_signatures set to the new values.   *)
(*    MAKE SURE THAT THE NEW WALLET HAS BEEN       *)
(*    SUCCESFULLY DEPLOYED WITH THE CORRECT        *)
(*    PARAMETERS BEFORE CONTINUING!                *)
(* 2. Invoke the SubmitTransaction transition on   *)
(*    the old wallet with the following            *)
(*    parameters:                                  *)
(*    recipient : The address of the new wallet    *)
(*    amount : The _balance of the old wallet      *)
(*    tag : "AddFunds"                             *)
(* 3. Have (a sufficient number of) the owners of  *)
(*    the old contract invoke the SignTransaction  *)
(*    transition on the old wallet. The parameter  *)
(*    transactionId should be set to the Id of the *)
(*    transaction created in step 2.               *)
(* 4. Have one of the owners of the old contract   *)
(*    invoke the ExecuteTransaction transition on  *)
(*    the old contract. This will cause the entire *)
(*    balance of the old contract to be            *)
(*    transferred to the new wallet. Note that no  *)
(*    un-executed transactions will be transferred *)
(*    to the new wallet along with the funds.      *)
(*                                                 *)
(* WARNING: If a sufficient number of owners lose  *)
(* their private keys, or for any other reason are *)
(* unable or unwilling to sign for new             *)
(* transactions, the funds in the wallet will be   *)
(* locked forever. It is therefore a good idea to  *)
(* set required_signatures to a value strictly     *)
(* less than the number of owners, so that the     *)
(* remaining owners can retrieve the funds should  *)
(* such a scenario occur.                          *)
(*                                                 *)
(* If an owner loses his private key, the          *)
(* remaining owners should move the funds to a new *)
(* wallet (using the workflow described above) to  *)
(* ensure that funds are not locked if another     *)
(* owner loses his private key. The owner who      *)
(* originally lost his private key can generate a  *)
(* new key, and the corresponding address be added *)
(* to the new wallet, so that the same set of      *)
(* persons own the new wallet.                     *)
(*                                                 *)
(***************************************************)
contract Wallet
(
owners_list         : List ByStr20,
required_signatures : Uint32
)

(* Funds are not allowed to be added if the contract is not valid *)
field contract_valid : ContractValidity = Unchecked

(* adr -> True indicates an owner *)
(* adr not in map indicates non-owner *)
(* adr -> False is not used *)
(* The initial owners will be added as owners when funds are *)
(* initially added to the contract. *) 
field owners           : Map ByStr20 Bool = Emp ByStr20 Bool

field transactionCount : Uint32 = Uint32 0

(* Collected signatures for transactions *)
field signatures       : Map Uint32 (Map ByStr20 Bool) =
  Emp Uint32 (Map ByStr20 Bool)

(* Running count of collected signatures for transactions *)
field signature_counts : Map Uint32 Uint32 =
  Emp Uint32 Uint32

(* Transactions *) 
field transactions     : Map Uint32 Transaction =
                           Emp Uint32 Transaction
procedure MakeError (err : Error)
  e = mk_error_event err;
  event e
end

(* Add signature to signature list *)
procedure AddSignature (transactionId : Uint32, signee : ByStr20)
  sig <- exists signatures[transactionId][signee];
  match sig with
  | False =>
    count <- signature_counts[transactionId];
    match count with
    | None =>
      (* 0 signatures *)
      signature_counts[transactionId] := one
    | Some c =>
      new_c = builtin add c one;
      signature_counts[transactionId] := new_c
    end;
    signatures[transactionId][signee] := t;
    e = mk_signed_transaction_event transactionId;
    event e
  | True =>
    (* Already signed *)
    err = AlreadySigned;
    MakeError err
  end
end

(* Submit a transaction for future signoff *)
transition SubmitTransaction (recipient : ByStr20, amount : Uint128, tag : String)
  (* Only allow owners to submit new transactions *)
  sender_is_owner <- exists owners[_sender];
  match sender_is_owner with
  | False =>
    err = NonOwnerCannotSubmit;
    MakeError err
  | True =>
    tc <- transactionCount;
    zero = Uint128 0;
    amount_is_zero = builtin eq amount zero;
    match amount_is_zero with
    | True =>
      (* Illegal transaction *)
      err = InvalidAmount;
      MakeError err
    | False =>
      (* Create new transaction *)
      transaction = Trans recipient amount tag;
      (* Add transaction to outstanding list of transactions *)
      transactions[tc] := transaction; 
      (* Sender implicitly signs *)
      AddSignature tc _sender;
      (* Increment transaction counter *)
      tc_new = builtin add tc transaction_inc;
      (* Update transaction count *)
      transactionCount := tc_new;
      (* Create event with transaction Id *)
      e = mk_transaction_added_event tc recipient amount tag;
      event e
    end
  end
end

(* Sign off on an existing transaction *)
transition SignTransaction (transactionId : Uint32)
  (* Only the owner is allowed to sign off transactions *)
  sender_is_owner <- exists owners[_sender];
  match sender_is_owner with
  | False =>
    err = NonOwnerCannotSign;
    MakeError err
  | True =>
    (* Transaction must have been submitted *)
    transaction <- transactions[transactionId];
    match transaction with
    | None =>
      err = UnknownTransactionId;
      MakeError err
    | Some _ =>
      (* Remaining error cases handled by AddSignature *)
      AddSignature transactionId _sender
    end
  end
end

(* Delete transaction and signatures *)
procedure DeleteTransaction (transactionId : Uint32)
  delete transactions[transactionId];
  delete signatures[transactionId];
  delete signature_counts[transactionId]
end

(* Execute signed-off transaction *)
transition ExecuteTransaction (transactionId : Uint32)
  transaction_opt <- transactions[transactionId];
  match transaction_opt with
  | None =>
    (* Transaction was not found. *)
    err = UnknownTransactionId;
    MakeError err
  | Some (Trans recipient amount tag) =>
    (* Only the recipient or an owner can execute the transaction *)
    recipient_is_sender = builtin eq recipient _sender;
    sender_is_owner <- exists owners[_sender];
    sender_may_execute = orb recipient_is_sender sender_is_owner;
    match sender_may_execute with
    | False =>
      err = SenderMayNotExecute;
      MakeError err
    | True =>
      (* Check for sufficient funds  *)
      bal <- _balance;
      not_enough_money = builtin lt bal amount;
      match not_enough_money with
      | True =>
        err = InsufficientFunds;
        MakeError err
      | False =>
        sig_count_opt <- signature_counts[transactionId];
        match sig_count_opt with
        | None =>
          (* Signature count not found, even though the transaction exists.*)
          err = NoSignatureListFound;
          MakeError err
        | Some sig_count =>
          not_enough_signatures = builtin lt sig_count required_signatures;
          match not_enough_signatures with
          | True =>
            err = NotEnoughSignatures;
            MakeError err
          | False =>
            (* Transaction approved, and enough money available. *)
            (* Remove transaction and signatures, and execute. *)
            DeleteTransaction transactionId;
            msgs = transaction_msg_as_list recipient amount tag;
            send msgs;
            e = mk_transaction_executed_event transactionId recipient amount tag;
            event e
          end
        end
      end
    end
  end
end

(* Revoke signature of existing transaction, if it has not yet been executed. *)
transition RevokeSignature (transactionId : Uint32)
  sig <- exists signatures[transactionId][_sender];
  match sig with
  | False =>
    err = NotAlreadySigned;
    MakeError err
  | True =>
    count <- signature_counts[transactionId];
    match count with
    | None =>
      err = IncorrectSignatureCount;
      MakeError err
    | Some c =>
      c_is_zero = builtin eq c zero;
      match c_is_zero with
      | True =>
        err = IncorrectSignatureCount;
        MakeError err
      | False =>
        new_c = builtin sub c one;
        signature_counts[transactionId] := new_c;
        delete signatures[transactionId][_sender];
        e = mk_signature_revoked_event transactionId;
        event e
      end
    end
  end
end

(* Add funds to wallet *)
transition AddFunds ()
  (* Check validity of contract. If the contract is invalid, funds will not be accepted. *)
  validity <- contract_valid;
  match validity with
  | Unchecked =>
    (* Check validity and build owners map *)
    owners_map_opt = check_validity_and_build_owners_map owners_list required_signatures;
    match owners_map_opt with
    | Some owners_map =>
      contract_valid := valid;
      owners := owners_map;
      e = mk_contract_initialized_event;
      event e
    | None =>
      contract_valid := invalid
    end
  | Valid =>
    (* Already checked *)
  | Invalid =>
    (* Already checked *)
  end;

(* Read validity field again, as it may have been updated. *)
(* Only accept funds if the contract is valid. *)
  validity <- contract_valid;
  match validity with
  | Unchecked =>
    (* This should not happen *)
    err = InvalidContract;
    MakeError err
  | Invalid =>
    err = InvalidContract;
    MakeError err
  | Valid =>
    accept
  end
end`,
          data: JSON.stringify(init).replace(/\\"/g, '"'),
          signature: ''
        });

        EventBus.$emit('sign-event', tx);
      } catch (error) {
        Swal.fire({
          type: 'error',
          text: error
        });

        this.isLoading = false;
      }
    },
    async checkForHash(hash) {
      const cid = await this.zilliqa.blockchain.getContractAddressFromTransactionID(hash);

      if(cid.error !== undefined && cid.error.code === -5) {
        return await this.checkForHash(hash);
      }

      return cid;
    }
  },
  beforeMount() {
    this.owners.push({ address: toBech32Address(this.personalAddress) });
  },
  async mounted() {
    this.zilliqa = new Zilliqa(this.network.url);

    EventBus.$on('sign-success', async tx => {
      if (tx.ledger !== true) {
        const contractId = await this.zilliqa.blockchain.getContractAddressFromTransactionID(tx.id);

        this.isDeployed = true;
        this.isLoading = false;

        let contractBech32 = toBech32Address(contractId.result);

        this.deployedWallet = {
          transId: tx.id,
          contractId: contractBech32,
          owners_list: this.owners,
          signatures: this.signatures,
          network: this.network.url
        };

        try {
          this.$store.dispatch('wallets/addWallet', this.deployedWallet);
        } catch (error) {
          throw error;
        }
      }else {
        const contractId = await this.checkForHash(tx.id);

        this.isDeployed = true;
        this.isLoading = false;

        let contractBech32 = toBech32Address(contractId.result);

        this.deployedWallet = {
          transId: tx.id,
          contractId: contractBech32,
          owners_list: this.owners,
          signatures: this.signatures,
          network: this.network.url
        };

        try {
          this.$store.dispatch('wallets/addWallet', this.deployedWallet);
        } catch (error) {
          throw error;
        }
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.advanced-options {
  margin-bottom: 2rem;
}

.toggle-advanced-options {
  cursor: pointer;
}
</style>