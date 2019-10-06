const state = {
    network: {
        name: 'Mainnet',
        url: 'https://api.zilliqa.com',
        chainId: 1,
        msgVersion: 1
    },
    networks: [
        {
            name: 'Mainnet',
            url: 'https://api.zilliqa.com',
            chainId: 1,
            msgVersion: 1
        },
        {
            name: 'Testnet',
            url: 'https://dev-api.zilliqa.com',
            chainId: 333,
            msgVersion: 1
        },
        {
            name: 'Isolated Server',
            url: 'http://localhost:5555',
            chainId: 1,
            msgVersion: 1
        }
    ],
    wallet: null,
    address: null,
    login_type: null
};

const getters = {
    isLogged: state => {
        return (state.address !== null && state.login_type !== null);
    },
    networks: state => state.networks,
    wallet: state => state.wallet,
    selectedNetwork: state => state.network,
    walletType: state => state.login_type
};

const actions = {
    login({ commit }, { login_type, wallet }) {
        commit('setLoginType', login_type);

        if (login_type === 'keystore') {
            commit('setWallet', wallet);
            commit('setAddress', wallet.address);
        } else {
            commit('setAddress', wallet);
        }
    },
    logout({ commit }) {
        commit('setWallet', null);
        commit('setAddress', null);
        commit('setLoginType', null);
    },
    changeNetwork({ commit, state }, url) {
        const network = state.networks.find(function (item) {
            return item.url === url
        });

        commit('setNetwork', network);
    }
};


const mutations = {
    setNetwork(state, payload) {
        state.network = payload;
    },
    setWallet(state, payload) {
        state.wallet = payload;
    },
    setAddress(state, payload) {
        state.address = payload;
    },
    setLoginType(state, payload) {
        state.login_type = payload;
    },
};


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}