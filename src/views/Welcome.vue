<template>
  <div class="login">
    <div class="container">
      <img class="logo mb-4" src="@/assets/zilliqa-logo.png" />

      <h1 class="title">
        Welcome to Zilliqa
        <br />multisig wallet
      </h1>
      <h2>
        You can now create, import, view wallets or go to
        <span>dashboard</span>
      </h2>

      <div class="actions-container">
        <router-link class="button d-flex flex-column" :to="{ name: 'create-wallet' }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22.398"
            height="20.531"
            viewBox="0 0 22.398 20.531"
          >
            <g id="_001-cash" data-name="001-cash" transform="translate(0 -21.388)">
              <g id="Group_44" data-name="Group 44" transform="translate(0 21.388)">
                <g id="Group_43" data-name="Group 43" transform="translate(0 0)">
                  <path
                    id="Path_33"
                    data-name="Path 33"
                    d="M301.3,281.781a1.867,1.867,0,1,0-1.867-1.866A1.872,1.872,0,0,0,301.3,281.781Z"
                    transform="translate(-286.371 -266.849)"
                    fill="#c9e2ff"
                  />
                  <path
                    id="Path_34"
                    data-name="Path 34"
                    d="M3.733,26.987a1.867,1.867,0,0,1,0-3.733H18.665v1.867h1.867V21.388H3.733A3.744,3.744,0,0,0,0,25.121V37.253a4.621,4.621,0,0,0,4.666,4.666H22.4V26.987Zm16.8,13.065H4.666a2.75,2.75,0,0,1-2.8-2.8V28.294a3.365,3.365,0,0,0,1.866.56h16.8v11.2Z"
                    transform="translate(0 -21.388)"
                    fill="#c9e2ff"
                  />
                </g>
              </g>
            </g>
          </svg>
          Create Wallet
        </router-link>
        <router-link class="button d-flex flex-column" :to="{ name: 'import-wallet' }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18.235"
            height="17.868"
            viewBox="0 0 18.235 17.868"
          >
            <g id="_004-download" data-name="004-download" transform="translate(-16 -1)">
              <g id="Group_46" data-name="Group 46" transform="translate(20.255 1)">
                <g id="Group_45" data-name="Group 45">
                  <path
                    id="Path_35"
                    data-name="Path 35"
                    d="M137.669,8.866a.606.606,0,0,0-.553-.356h-2.431V.608A.608.608,0,0,0,134.076,0h-2.431a.608.608,0,0,0-.608.608v7.9h-2.431a.608.608,0,0,0-.457,1.008L132.4,14.38a.606.606,0,0,0,.914,0l4.255-4.863A.606.606,0,0,0,137.669,8.866Z"
                    transform="translate(-127.998)"
                    fill="#c9e2ff"
                  />
                </g>
              </g>
              <g id="Group_48" data-name="Group 48" transform="translate(16 12.789)">
                <g id="Group_47" data-name="Group 47">
                  <path
                    id="Path_36"
                    data-name="Path 36"
                    d="M31.8,352v3.647H18.431V352H16v4.863a1.215,1.215,0,0,0,1.216,1.216h15.8a1.215,1.215,0,0,0,1.216-1.216V352Z"
                    transform="translate(-16 -352)"
                    fill="#c9e2ff"
                  />
                </g>
              </g>
            </g>
          </svg>
          Import Wallet
        </router-link>
        <router-link class="button d-flex flex-column" :to="{ name: 'wallet-list' }">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20.3"
            height="15.95"
            viewBox="0 0 20.3 15.95"
          >
            <g
              id="_002-list-with-dots"
              data-name="002-list-with-dots"
              transform="translate(0 -54.817)"
            >
              <g id="Group_38" data-name="Group 38" transform="translate(0 54.817)">
                <path
                  id="Path_25"
                  data-name="Path 25"
                  d="M2.175,201a2.1,2.1,0,0,0-1.541.634,2.188,2.188,0,0,0,0,3.081,2.1,2.1,0,0,0,1.541.634,2.1,2.1,0,0,0,1.541-.634,2.188,2.188,0,0,0,0-3.081A2.1,2.1,0,0,0,2.175,201Z"
                  transform="translate(0 -195.199)"
                  fill="#c9e2ff"
                />
                <path
                  id="Path_26"
                  data-name="Path 26"
                  d="M2.178,54.817a2.1,2.1,0,0,0-1.541.634,2.188,2.188,0,0,0,0,3.081,2.1,2.1,0,0,0,1.541.634,2.1,2.1,0,0,0,1.541-.634,2.188,2.188,0,0,0,0-3.081A2.1,2.1,0,0,0,2.178,54.817Z"
                  transform="translate(-0.003 -54.817)"
                  fill="#c9e2ff"
                />
                <path
                  id="Path_27"
                  data-name="Path 27"
                  d="M2.178,347.18a2.1,2.1,0,0,0-1.541.634,2.188,2.188,0,0,0,0,3.081,2.1,2.1,0,0,0,1.541.634,2.1,2.1,0,0,0,1.541-.634,2.188,2.188,0,0,0,0-3.081A2.1,2.1,0,0,0,2.178,347.18Z"
                  transform="translate(-0.003 -335.58)"
                  fill="#c9e2ff"
                />
                <path
                  id="Path_28"
                  data-name="Path 28"
                  d="M160.57,73.2a.349.349,0,0,0-.255-.107H146.54a.367.367,0,0,0-.362.362v2.175a.367.367,0,0,0,.362.362h13.775a.367.367,0,0,0,.363-.362V73.454A.349.349,0,0,0,160.57,73.2Z"
                  transform="translate(-140.378 -72.367)"
                  fill="#c9e2ff"
                />
                <path
                  id="Path_29"
                  data-name="Path 29"
                  d="M160.315,219.271H146.54a.367.367,0,0,0-.362.362v2.175a.368.368,0,0,0,.362.362h13.775a.367.367,0,0,0,.363-.362v-2.175a.367.367,0,0,0-.363-.362Z"
                  transform="translate(-140.378 -212.746)"
                  fill="#c9e2ff"
                />
                <path
                  id="Path_30"
                  data-name="Path 30"
                  d="M160.315,365.447H146.54a.368.368,0,0,0-.362.362v2.175a.367.367,0,0,0,.362.362h13.775a.367.367,0,0,0,.363-.362v-2.175a.367.367,0,0,0-.363-.362Z"
                  transform="translate(-140.378 -353.122)"
                  fill="#c9e2ff"
                />
              </g>
            </g>
          </svg>

          Wallet List
        </router-link>
        <router-link class="button d-flex flex-column" :to="{ name: 'dashboard' }">
          <svg
            id="_03-speed"
            data-name="03-speed"
            xmlns="http://www.w3.org/2000/svg"
            width="21.391"
            height="21.391"
            viewBox="0 0 11.391 11.391"
          >
            <path
              id="Path_9"
              data-name="Path 9"
              d="M5.7,0a5.7,5.7,0,1,0,5.7,5.7A5.7,5.7,0,0,0,5.7,0Zm0,10.441A4.746,4.746,0,1,1,10.441,5.7,4.746,4.746,0,0,1,5.7,10.441Z"
              fill="#c9e2ff"
            />
            <path
              id="Path_10"
              data-name="Path 10"
              d="M35.8,32A3.8,3.8,0,0,0,32,35.8h.949A2.848,2.848,0,1,1,35.8,38.645v.949A3.8,3.8,0,0,0,35.8,32Z"
              transform="translate(-30.102 -30.102)"
              fill="#c9e2ff"
            />
            <path
              id="Path_11"
              data-name="Path 11"
              d="M74.565,65.246a5.591,5.591,0,0,0,.474-2.355.475.475,0,0,0-.625-.469,5.592,5.592,0,0,0-2.128,1.115,1.424,1.424,0,0,0,1.136,2.278,1.447,1.447,0,0,0,.2-.015A1.414,1.414,0,0,0,74.565,65.246Zm-1.424-.475a.475.475,0,0,1-.095-.664,3.543,3.543,0,0,1,.991-.53,3.555,3.555,0,0,1-.231,1.1.475.475,0,0,1-.664.095Z"
              transform="translate(-67.73 -58.697)"
              fill="#c9e2ff"
            />
          </svg>

          Dashboard
        </router-link>
      </div>
    </div>
    <img class="zilliqa" src="@/assets/zilliqa.png" />
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  data() {
    return {
      keystoreData: null,
      passphrase: null
    };
  },
  computed: {
    network() {
      return this.$store.state.network;
    },
    Zilliqa() {
      return this.$store.state.Zilliqa;
    }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.button {
  z-index:999;
  width: 120px;
  padding: 0;
  padding-top: 2rem;
  padding-bottom: 2rem;
  svg {
    margin-bottom: 0.5rem;
  }
}
</style>
