import {toBech32Address} from '@zilliqa-js/crypto';


/* 
    Wallet: {
        contractId: Address, 
        transId: Address,
        owners_list: [Address]
        signatures: Number,
        pinned: boolean
        color: string
    }
*/

const state = {
    wallets: [],
};

const getters = {
    wallet: (state) => address => {
        return state.wallets.find(item => item.contractId === address);
    },
    wallets: (state, getters, rootState, rootGetters) => {
        const personalAddress = toBech32Address(rootGetters['general/personalAddress']);
        let network = rootGetters['general/selectedNetwork'].url;

        return state.wallets.filter(item => {
            const isInNetwork = item.network === network;
            const isOwner = item.owners_list.find(owner => owner.address === personalAddress);

            if(isInNetwork && isOwner !== undefined) return true;

            return false;
        });
    },
    getPinnedWallets: (state, getters, rootState, rootGetters) => {
        let network = rootGetters['general/selectedNetwork'].url;

        return state.wallets.filter(item => (item.network === network && item.pinned === true)).slice(0,2);
    },
    getOwnersList: state => address => {
        const good = state.wallets.find(item => item.contractId === address);

        return good.owners_list;
    }
};

const actions = {
  addWallet({ commit, state }, payload) {
    const wallet = state.wallets.find(
      wallet => wallet.contractId === payload.contractId
    );

    if (wallet !== undefined) {
      throw 'Wallet already imported.';
    }

    commit('addWallet', payload);
  },
  addPin({ commit, state }, payload) {
    const wallet = state.wallets.findIndex(
      wallet => wallet.contractId === payload
    );

    if (wallet !== undefined) {
      commit('pinWallet', wallet);
    }
  },
  colorWallet({ commit, state }, payload) {
    const wallet = state.wallets.findIndex(
      wallet => wallet.contractId === payload.wallet
    );

    if (wallet !== undefined) {
      commit('colorWallet', {index: wallet, color: payload.color});
    }
  }
};


const mutations = {
  addWallet(state, payload) {
    state.wallets.push({ ...payload, pinned: false, color: 'default' });
  },
  pinWallet(state, index) {
    state.wallets[index].pinned = !state.wallets[index].pinned;
  },
  colorWallet(state, payload) {
    state.wallets[payload.index].color = payload.color;
  },
  clear(state) {
    state.wallets = [];
  }
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}