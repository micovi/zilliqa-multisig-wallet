
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
        let network = rootGetters['general/selectedNetwork'].url;

        return state.wallets.filter(item => item.network === network);
    },
    getPinnedWallets: (state, getters, rootState, rootGetters) => {
        let network = rootGetters['general/selectedNetwork'].url;

        return state.wallets.filter(item => (item.network === network && item.pinned === true)).slice(0,1);
    },
    getOwnersList: state => address => {
        const good = state.wallets.find(item => item.contractId === address);

        return good.owners_list;
    }
};

const actions = {
    addWallet({ commit, state }, payload) {
        const wallet = state.wallets.find(wallet => wallet.contractId === payload.contractId);

        if (wallet !== undefined) {
            throw 'Wallet already imported.';
        }

        commit('addWallet', payload);
    },
    addPin({commit, state}, payload) {
        const wallet = state.wallets.findIndex(wallet => wallet.contractId === payload);

        if(wallet !== undefined) {
            commit('pinWallet', wallet);
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