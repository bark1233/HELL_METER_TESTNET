<template>
  <div class="app">
    <nav-bar />
    <character-bar v-if="!featureFlagStakeOnly && currentCharacterId !== null" />
    <div class="content dark-bg-text">
      <router-view v-if="canShowApp" />
    </div>
    <div class="fullscreen-warning" v-if="!hideWalletWarning && (showMetamaskWarning || showNetworkError)">
      <div class="starter-panel">
        <span class="starter-panel-heading">Metamask Not Detected Or Incorrect Network</span>
        <div class="center">
          <big-button class="button" :mainText="`Add MetaMask`" @click="startOnboarding" v-if="showMetamaskWarning" />
          <big-button class="button" :mainText="`Switch to Testnet`" @click="configureMetaMask" v-if="showNetworkError" />
          <small-button class="button" @click="toggleHideWalletWarning" :text="'Hide Warning'" />
        </div>
      </div>
    </div>
    <div
      class="fullscreen-warning"
      v-if="!hideWalletWarning && !showMetamaskWarning && (errorMessage || (ownCharacters.length === 0 && hellBalance === '0' && !hasStakedBalance))"
    >
      <div class="starter-panel">
        <img class="mini-icon-starter" src="./assets/placeholder/sword-placeholder-6.png" alt="" srcset="" />
        <span class="starter-panel-heading">{{ errorMessage || 'Get Started With WTHell' }}</span>
        <img class="mini-icon-starter" src="./assets/placeholder/sword-placeholder-6.png" alt="" srcset="" />
        <big-button class="button" :mainText="`Configure MetaMask`" @click="configureMetaMask" />
        <div class="seperator"></div>
        <div class="instructions-list">
          <p>
            Get started in less than 10 minutes! To recruit your first character you need 2 Hell and .0001 MTR for gas. You will also need .001 MTR to do your
            first few battles, but don't worry, you earn the battle fees back in HELL rewards immediately!
          </p>
          <ul class="unstyled-list">
            <li>1. Buying MTR with fiat: <a href="#" target="_blank" rel="noopener noreferrer">null</a></li>
            <li>
              2. Once you have MTR, go to TraderJoe to obtain HELL tokens:<br />
              <a v-bind:href="`${getExchangeUrl}`" target="_blank">Trade HELL/MTR</a>
            </li>
            <li>
              3. Follow this tutorial to swap MTR for HELL: <a href="#" target="_blank" rel="noopener noreferrer">Watch Video</a>
            </li>
            <li>
              4. That's it! Now you can create your first character: (<a href="#" target="_blank" rel="noopener noreferrer"
                >Watch 'Getting Started' Video</a
              >)
            </li>
          </ul>
          <p>
            If you have any questions, please join our Discord:
            <a href="https://discord.gg/123abc" target="_blank" rel="noopener noreferrer">https://discord.gg/123abc</a>
          </p>
        </div>
        <div class="seperator"></div>
        <small-button class="button" @click="toggleHideWalletWarning" :text="'Hide Warning'" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import _ from 'lodash';
import Vue from 'vue';
import Events from './events';
import MetaMaskOnboarding from '@metamask/onboarding';
import BigButton from './components/BigButton.vue';
import SmallButton from './components/SmallButton.vue';
import NavBar from './components/NavBar.vue';
import CharacterBar from './components/CharacterBar.vue';

Vue.directive('visible', (el, bind) => {
  el.style.visibility=(bind.value) ? 'visible' : 'hidden';});

export default {
  inject: ['web3', 'featureFlagStakeOnly', 'expectedNetworkId', 'expectedNetworkName'],
  components: {
    NavBar,
    CharacterBar,
    BigButton,
    SmallButton,
  },

  data: () => ({
    errorMessage: '',
    hideWalletWarning: false,
  }),

  computed: {
    ...mapState(['hellBalance', 'defaultAccount', 'currentNetworkId', 'currentCharacterId', 'staking']),
    ...mapGetters(['contracts', 'ownCharacters', 'getExchangeUrl', 'availableStakeTypes', 'hasStakedBalance']),

    canShowApp() {
      return this.contracts !== null && !_.isEmpty(this.contracts) && !this.showNetworkError;
    },

    showMetamaskWarning() {
      return !this.web3.currentProvider;
    },

    showNetworkError() {
      return this.expectedNetworkId && this.currentNetworkId !== null && this.currentNetworkId !== this.expectedNetworkId;
    },
  },

  watch: {
    defaultAccount(account) {
      this.web3.eth.defaultAccount = account;
    },

    async currentCharacterId() {
      await this.updateCharacterStamina(this.currentCharacterId);
    },
    $route(to) {
      // react to route changes
      window.gtag('event', 'page_view', {
        page_title: to.name,
        page_location: to.fullPath,
        page_path: to.path,
        send_to: 'G-C5RLX74PEW',
      });
    },
  },

  methods: {
    ...mapActions({ initializeStore: 'initialize' }),
    ...mapActions([
      'fetchCharacterStamina',
      'pollAccountsAndNetwork',
      'fetchWeaponTransferCooldownForOwnWeapons',
      'fetchCharacterTransferCooldownForOwnCharacters',
      'setupWeaponDurabilities',
      'fetchStakeDetails',
      'fetchWaxBridgeDetails',
      'fetchRewardsClaimTax',
    ]),

    async updateCharacterStamina(id) {
      if (this.featureFlagStakeOnly) return;

      if (id !== null) {
        await this.fetchCharacterStamina(id);
      }
    },

    checkStorage() {
      this.hideWalletWarning = localStorage.getItem('hideWalletWarning') === 'true';
    },
    async startOnboarding() {
      const onboarding = new MetaMaskOnboarding();
      onboarding.startOnboarding();
    },
    async configureMetaMask() {
      const web3 = this.web3.currentProvider;
      if (this.currentNetworkId === 83) {
        try {
          await web3.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '83' }],
          });
        } catch (switchError) {
          try {
            await web3.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '83',
                  chainName: 'Meter Testnet',
                  nativeCurrency: {
                    name: 'METER',
                    symbol: 'MTR',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpctest.meter.io/'],
                  blockExplorerUrls: ['https://scan-warringstakes.meter.io/'],
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }

        try {
          await web3.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: '0x8928B81Ce85D7a35071Df21Eb69e60302A0b8E58',
                symbol: 'HELL',
                decimals: 18,
              },
            },
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        {
          try {
            await web3.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '83' }],
            });
          } catch (switchError) {
            try {
              await web3.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '83',
                    chainName: 'Meter Testnet',
                    nativeCurrency: {
                      name: 'METER',
                      symbol: 'MTR',
                      decimals: 18,
                    },
                    rpcUrls: ['https://rpctest.meter.io/'],
                    blockExplorerUrls: ['https://scan-warringstakes.meter.io/'],
                  },
                ],
              });
            } catch (addError) {
              console.error(addError);
            }
          }

          try {
            await web3.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  address: '0x8928B81Ce85D7a35071Df21Eb69e60302A0b8E58',
                  symbol: 'HELL',
                  decimals: 18,
                },
              },
            });
          } catch (error) {
            console.error(error);
          }
        }
      }
    },

    toggleHideWalletWarning() {
      this.hideWalletWarning = !this.hideWalletWarning;
      if (this.hideWalletWarning) localStorage.setItem('hideWalletWarning', 'true');
      else localStorage.setItem('hideWalletWarning', 'false');

      Events.$emit('setting:hideWalletWarning', { value: this.hideWalletWarning });
    },

    async showWarningDialog() {
      await new Promise((resolve) => setTimeout(resolve, 7500));

      if (
        this.hideWalletWarning &&
        !this.showMetamaskWarning &&
        (this.errorMessage || this.showNetworkError || (this.ownCharacters.length === 0 && this.hellBalance === '0' && !this.hasStakedBalance))
      ) {
        this.$dialog.notify.warning(
          `You have hidden the wallet warning and it would now be displayed. If you are trying to play, 
        please disable the option and follow the instructions, otherwise close and ignore.`,
          {
            timeout: 0,
          },
        );
      }
    },
  },

  mounted() {
    this.checkStorage();

    Events.$on('setting:hideRewards', () => this.checkStorage());
    Events.$on('setting:hideAdvanced', () => this.checkStorage());
    Events.$on('setting:useGraphics', () => this.checkStorage());
    Events.$on('setting:hideWalletWarning', () => this.checkStorage());

    document.body.addEventListener('click', (e) => {
      const tagname = e.target.getAttribute('tagname');
      if (!tagname) return;

      if (e.target.nodeName === 'BUTTON') {
        window.gtag('event', 'button_clicked', {
          value: tagname,
        });
      }

      if (e.target.className.includes('btn btn btn-primary gtag-link-others')) {
        window.gtag('event', 'nav', {
          event_category: 'navigation',
          event_label: 'navbar',
          value: tagname,
        });
      }
    });

    this.showWarningDialog();

  },

  async created() {
    try {
      await this.initializeStore();
    } catch (e) {
      this.errorMessage = 'Welcome to WTHell. Here is how you can get started.';
      if (e.code === 4001) {
        this.errorMessage = 'Error: MetaMask could not get permissions.';
      }

      console.error(e);
      throw e;
    }

    this.pollCharactersStaminaIntervalId = setInterval(async () => {
      this.ownCharacters.forEach(async (c) => {
        await this.updateCharacterStamina(c.id);
      });
    }, 3000);

    this.availableStakeTypes.forEach((item) => {
      this.fetchStakeDetails({ stakeType: item });
    });

    this.slowPollIntervalId = setInterval(async () => {
      await Promise.all([
        this.fetchCharacterTransferCooldownForOwnCharacters(),
        this.fetchWeaponTransferCooldownForOwnWeapons(),
        this.setupWeaponDurabilities(),
        this.fetchWaxBridgeDetails(),
        this.fetchRewardsClaimTax(),
      ]);
    }, 10 * 1000);

    this.doPollAccounts = true;
    const pollAccounts = async () => {
      if (!this.doPollAccounts) return;

      try {
        await this.pollAccountsAndNetwork();
      } catch (e) {
        console.error(e);
      }

      setTimeout(pollAccounts, 200);
    };
    pollAccounts();

    if (!localStorage.getItem('useGraphics')) localStorage.setItem('useGraphics', 'false');
    if (!localStorage.getItem('hideAdvanced')) localStorage.setItem('hideAdvanced', 'false');
    if (!localStorage.getItem('hideRewards')) localStorage.setItem('hideRewards', 'false');
    if (!localStorage.getItem('hideWalletWarning')) localStorage.setItem('hideWalletWarning', 'false');
  },

  beforeDestroy() {
    this.doPollAccounts = false;
    clearInterval(this.pollCharacterStaminaIntervalId);
    clearInterval(this.slowPollIntervalId);
  },
};
</script>

<style>
body {
  margin: 0;
  background: linear-gradient(90deg, #170000 0%, #190c0b 100%);
}

.no-margin {
  margin: 0;
}

.bold {
  font-weight: 1000;
}

.main-font {
  font-family: 'Roboto', sans-serif;
}

.info-divider {
  width: 100%;
  position: relative;
  top: -10px;
}

.title-bg-text {
  color: #efc245;
}

.dark-bg-text {
  color: #efc245;
}

.body {
  max-height: calc(100vh - 56px - 160px);
}

button,
.pointer {
  cursor: pointer;
}

.blank-slate {
  width: calc(100vw - 36px);
  height: calc(100vh - 56px);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  font-size: 2rem;
  text-align: center;
}

.error {
  color: red;
}

.fire,
.str {
  color: red;
}

.earth,
.dex {
  color: green;
}

.water,
.int {
  color: cyan;
}

.lightning,
.cha {
  color: yellow;
}

.fire-icon,
.str-icon {
  color: red;
  content: url('assets/elements/fire.png');
  width: 1em;
  height: 1em;
}

.earth-icon,
.dex-icon {
  color: green;
  content: url('assets/elements/earth.png');
  width: 1em;
  height: 1em;
}

.water-icon,
.int-icon {
  color: cyan;
  content: url('assets/elements/water.png');
  width: 1em;
  height: 1em;
}

.lightning-icon,
.cha-icon {
  color: yellow;
  content: url('assets/elements/lightning.png');
  width: 1em;
  height: 1em;
}

.loading-container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-content: center;
  width: 100%;
  padding-top: 50%;
  font-size: 2rem;
  z-index: 541;
  color: #be9a2c;
}

button.close {
  color: #efc245 !important;
}

.btn {
  border: 2px solid #efc245 !important;
  border-radius: 0.1em !important;
}

.btn.disabled,
.btn:disabled {
  cursor: auto;
}

.btn:not(.disabled):not(:disabled):hover {
  background: rgb(61, 61, 64);
  background-color: rgba(125, 4, 4, 0.8) !important;
}

.btn-primary {
  color: #EEC14E !important;
  min-width: 172px;
  width: auto !important;
  min-height: 40px;
  background-color: rgba(125, 4, 4, 0.3) !important;
  border: 1px solid #EEC14E !important;
  border-radius: 6px !important;
  transition: all .5s ease-in-out;
}

.btn-outline-primary {
  color: #efc245 !important;
}

.modal-header {
  color: #c0b235 !important;
  background: linear-gradient(180deg, #250000 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
  border-color: #250000 !important;
}

.modal-body {
  color: #c0b235 !important;
  background: linear-gradient(180deg, #250000 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
}

.modal-footer {
  color: #efc245 !important;
  background: linear-gradient(180deg, #250000 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
  border-color: #efc245 !important;
}

.b-pagination > li > .page-link{
  color:#efc245;
  background: linear-gradient(180deg, rgba(31, 31, 34, 1) 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
  border-color: #efc2456e;
}

.b-pagination > .page-item.active > .page-link {
  color: #efc245;
  background: linear-gradient(180deg, rgba(31, 31, 34, 1) 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
  border-color: #efc245;
}

.b-pagination > .page-item.disabled > .page-link {
  color: #b3b0a72a;
  background: linear-gradient(180deg, rgba(31, 31, 34, 1) 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
  border-color: #efc2456e;
}
.nav-tabs {
  border-bottom: 2px solid #250000 !important;
}

.nav-tabs .nav-link.active {
  color: #250000 !important;
  border: 2px solid #170000 !important;
  background: linear-gradient(180deg, #250000 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
}

.nav-tabs .nav-link:hover,
.nav-tabs .nav-link:focus {
  border-color: #efc245 #efc245 #efc245 !important;
}

.outline {
  color: #000;
  text-shadow: -1px 0 #fff, 0 1px #fff, 1px 0 #fff, 0 -1px #fff;
}

.black-outline {
  text-shadow: -1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000;
}

div.bg-success {
  background-color: #19682b !important;
}

.nav.nav-pills .nav-link {
  color: #efc245 !important;
  border: 2px solid #efc245;
  border-radius: 0.1em;
  background: rgb(31, 31, 34);
  background: linear-gradient(180deg, rgba(31, 31, 34, 1) 0%, rgba(24, 27, 30, 1) 5%, #221f17 100%);
}

.nav.nav-pills .nav-link.active {
  border: 2px solid #efc245 !important;
  background: rgb(61, 61, 64);
  background: linear-gradient(180deg, rgba(51, 51, 54, 1) 0%, rgba(44, 47, 50, 1) 5%, rgba(44, 58, 65, 1) 100%);
}
</style>
<style scoped>
.app {
  margin: 0;
}

.content {
  padding: 0 1em;
  height: calc(100vh - 56px);
  background: rgb(20, 20, 20);
  background: linear-gradient(270deg, #190c0b 0%, #1c0a09 100%);
  margin: auto;
}

.fullscreen-warning {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.425);
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 3rem;
  color: #fff;
}

.starter-panel {
  width: 100%;
  max-width: 28em;
  background: rgba(0, 0, 0, 1);
  box-shadow: 0 2px 4px #ffffff38;
  border: 1px solid #efc245;
  border-radius: 5px;
  padding: 0.5em;
  margin: auto;
  text-align: center;
  overflow: auto auto;
}

.starter-panel-heading {
  margin-left: 15px;
  font-size: 45px;
}

.starter-msg {
  font-size: 0.85em;
}
.instructions-list {
  text-align: start;
  padding: 15px;
  font-size: 0.5em;
}

.unstyled-list {
  list-style-type: none;
}
.seperator {
  border: 1px solid #efc245;
  border-radius: 3px;
  width: 100%;
}

.mini-icon-starter {
  height: 1.2em;
  width: 1.2em;
  margin: 5px;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

+<style>
@import url('https://fonts.googleapis.com/css2?family=Alegreya+Sans+SC:ital,wght@0,100;0,300;0,400;0,500;0,700;0,800;0,900;1,100;1,300;1,400;1,500;1,700;1,800;1,900&display=swap');
html .main-nav {
    position: fixed;
    flex-direction: column ;
    justify-content: space-between;
    align-items: center;
    top: 0;
    left: 0;
    height: 100vh;
    width: 388px;
    z-index: 2;
}

body {
  padding-top: 100px;
  overflow-x: hidden;
}

html .navbar {
  padding: 50px 50px 0 50px;
  list-style: none;
}

li[data-v-b8ce8636] a {
  margin-bottom: 0 !important;
}

svg[data-v-b8ce8636] {
  transform: translateY(-14px);
}

.root.main-font .character-name {
      background: linear-gradient(177.39deg, #EEC14E 42.02%, rgba(189, 48, 42, 0.51) 142.62%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    font-weight: 700;
    font-family: 'Alegreya Sans SC', sans-serif;
}

.character-list .character {
  padding-bottom: 7px !important;
}

.character-list .character .small-stamina-char.has-tooltip,
.character-list .character-highlight .small-stamina-char.has-tooltip {
  border: 1px solid #EEC14E;
  border-radius: 4px;
}

.character-list .character .name-list {
  font-family: 'Segoe UI';
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.03em;
  color: #EEC14E;
}

.navbar.main-nav[data-v-4295d220]::after {
  position: absolute;
  display: block;
  content: '';
  top: 10%;
  right: 0;
  width: 0.5px;
  height: 80%;
  background-color: rgba(238, 193, 78, .5);
}

.character-bar .character-list .character {
  background: rgba(45, 45, 45, 0.4);
  border: 1px solid #EEC14E;
  backdrop-filter: blur(34px);

  border-radius: 4px;
}

html .navbar.navbar-expand li:not(.ml-3) a {
  display: inline-block;
}

ul {
  list-style: none;
}

img[data-v-4295d220],
img[data-v-203b7b5a] {
  display: none;
}

.character-bar {
  border: 1px solid #EEC14E;
  border-radius: 8px;
  margin-right: 20px;
  padding: 60px 35px 25px 35px !important;
}

html .menu-toggle-top {
  position: fixed;
  top: 27px;
  right: 0;
  z-index: 2;
  justify-content: flex-end;
  margin-right: 20px;
}
html #__BVID__66 {
    position: fixed;
    top: 27px;
    left: 76%;
    z-index: 2;
}

html #__BVID__66__BV_toggle_ {
  padding: 20px;
  height: 70px;
  transform: translate(-47px, -17px);
  background: linear-gradient(90deg, #250000 0%, #170000 100%);
}

#__BVID__19__BV_toggle_,
#__BVID__66__BV_toggle_ {
  margin: 0;
}

.starter-panel {
  width: 55% !important;
}

.starter-panel button {
  margin-right: 10px;
  padding: 6px 12px !important;
}

.starter-panel button h1,
.starter-panel button h3 {
  padding-top: 10px;
  font-size: 25px !important;
}

.character .placeholder {
  height: 64% !important;
}

span[data-v-ae64b8e2] {
  border: none !important;
}

.character .name.black-outline {
  background: linear-gradient(177.39deg, #EEC14E 42.02%, rgba(189, 48, 42, 0.51) 142.62%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-shadow: 0px 0px 13px #721818;
  transform: translateY(-5px);
  font-family: 'Alegreya Sans SC', sans-serif;
}

.score-id-container {
  transform: translateY(-5px);
}

.character .black-outline {
  text-shadow: none;
  color: #fff;
}

.character .character-art > div:last-child {
  bottom: -14px;
}

html .hell-balance-display {
  position: fixed;
  border: 1px solid #EEC14E;
  border-radius: 8px;
  top: 10px;
  right: 15px;
  justify-content: flex-end;
  padding: 20px 75px 20px 20px;
  background: linear-gradient(90deg, #250000 0%, #170000 100%);
}

button[data-v-45fa2b1e] {
  min-width: 265px;
  padding: 20px;
  line-height: 20px;
  height: auto;
  margin-right: 5px;
}

body {
  background: url('./assets/base/bg-site.png') center;
  background-size: cover !important;
}

body .navbar,
body .content.dark-bg-text {
  background: transparent !important;
}

body .row.mt-3 h1 {
  background: linear-gradient(177.39deg, #EEC14E 42.02%, rgba(189, 48, 42, 0.51) 142.62%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-weight: 700;
}

.body.main-font,
.container_row,
.character-bar {
  width: calc(97% - 450px);
  margin-left: 450px;
}

.character .progress-bar.bg-success {
  background: linear-gradient(180deg, rgba(29, 147, 19, 0.19) 0%, #1D9313 62.85%, rgba(29, 147, 19, 0.41) 76.91%, rgba(29, 147, 19, 0.34) 100%);
  border: 0.5px solid #EEC14E;
  border-radius: 4px;
}

html .nav-link {
  margin-bottom: 40px;
}

html .navbar-nav.view-links {
  flex-direction: column;
}

/*Stake*/
.stake-select-list .stake-select-item {
  background: rgba(16, 16, 16, 0.5);
  border: 1px solid #EEC14E;
  border-radius: 8px;
}

.stake-select-list .stake-select-item .container {
  background: rgba(16, 16, 16, 0.5);
  padding: 25px;
}

.stake-select-list .stake-select-item .stake-data-table {
  margin-top: 18px;
}

.stake-select-list .stake-select-item .stake-data-table tr {
  display: flex;
  margin-bottom: 10px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 7px;
}

.stake-select-list .stake-select-item .stake-select-button {
  width: 113px;
  height: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: #EEC14E;
  background: rgba(114, 13, 13, 0.3);
  border: 1px solid #EEC14E;
  border-radius: 6px;
}

.stake-select-list .stake-select-item .stake-select-button svg {
  margin-left: 5px;
}

.stake.staking .staker {
  background: rgba(16, 16, 16, 0.6);
  border: 1px solid #EEC14E;
  border-radius: 8px;
  padding: 20px;
}

.stake.staking .staker .chooser[data-v-1f432ef1] {
  background-color: transparent;
}

.stake.staking .staker .navbar-staking {
  border: none;
}

.stake.staking .staker .navbar-staking .switch {
  background: rgba(57, 57, 57, 0.3);
  border-radius: 23px;
  height: 40px;
  font-weight: 700;
  border: 1px solid transparent;
  transition: all .5s ease-in-out;
}

.stake.staking .staker .navbar-staking {
  gap: 8px;
}

.stake.staking .staker .navbar-staking .switch.switch_active {
  background: rgba(57, 57, 57, 0.3);
  border-color: #EEC14E;
  border-radius: 23px;
}

.stake.staking .staker .stakePage.medium-dark-bg {
  background: none;
  margin: 0;
  width: 100%;
}

.stake.staking .staker {
  min-height: fit-content;
}

.stake.staking .staker .input {
  background-color: transparent;
  height: 120px;
}

.stake.staking .token-amount-input {
  width: 50%;
}

.stake.staking .ant-col {
  font-weight: 600;
  font-size: 20px;
  line-height: 27px;
  letter-spacing: 0.03em;
  color: #FFFFFF;
}

.stake.staking .balance {
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  letter-spacing: 0.03em;
  color: #FFFFFF;
  text-decoration: none;
}

.stake.staking .token-amount-input {
  font-weight: 600;
  font-size: 36px;
  line-height: 48px;
  letter-spacing: 0.03em;
  color: #989898;
}

.stake.staking .stakePage button {
  width: 100%;
  height: 60px;
}

.filters {
  margin-bottom: 50px;
}

.filters strong {
  display: block;
  color: #fff;
  margin-bottom: 5px;
}

.filters .form-control {
  height: 35px;
  background: rgba(1, 1, 1, 0.3);
  border: 1px solid #FFFFFF;
  border-radius: 4px;
  flex: none;
  order: 0;
  flex-grow: 0;
  color: #fff;
}

.filters .show-reforged {
  margin-top: 30px;
}

.blank-slate {
  width: 100% !important;
}

.weapon-grid .glow-container.glow-2 {
    background: rgba(29, 29, 29, 0.3);
    border: 1px solid #EEC14E;
    border-radius: 4px;
}

.weapon-grid {
  grid-gap: 50px !important;
}

.weapon-grid .weapon-icon-wrapper {
  width: 243px;
  height: 287px;
}

.weapon-grid .weapon {
  width: 243px;
  background: rgba(29, 29, 29, 0.3);
}

.weapon-grid .name {
  background: linear-gradient(177.39deg, #EEC14E 42.02%, rgba(189, 48, 42, 0.51) 142.62%);
  background-clip: text;
  text-fill-color: transparent;
  text-shadow: 0px 0px 13px #721818;
  transform: translateY(-5px);
  font-weight: 700;
  font-size: 18px;
  font-family: 'Alegreya Sans SC', sans-serif;
  margin-bottom: 20px;
}

.weapon-grid .placeholder {
  max-width: 180px;
  max-height: 180px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
}

.weapon-grid .trait,
.weapon-grid .stats {
  padding-left: 10px;
}

.weapon-grid .id {
  padding-right: 10px;
}

.header-row h1 {
  background: linear-gradient(177.39deg, #EEC14E 42.02%, rgba(189, 48, 42, 0.51) 142.62%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-weight: 700;
}

.nav.nav-tabs.nav-justified {
  background: rgba(57, 57, 57, 0.1);
  margin-bottom: 20px;
}

.nav.nav-tabs.nav-justified li .nav-link {
  border: 1px solid transparent !important;
  border-radius: 6px !important;
  transition: all .5s ease-in-out;
}

.nav.nav-tabs.nav-justified li .nav-link.active,
.nav.nav-tabs.nav-justified li .nav-link.active:hover {
  background: rgba(57, 57, 57, 0.3);
  border-color: #EEC14E !important;
  color: #EEC14E !important;
}

.row.button-row {
  margin-bottom: 20px;
}

.encounter .mobile-divider {
  max-width: none;
}

.encounter .encounter-container {
  border: 1px solid #EEC14E;
  filter: drop-shadow(0px 0px 94px #591C1C);
  border-radius: 8px;
  height: 480px;
  margin-top: 87px;
  overflow: hidden;
  margin-bottom: 100px;
}

.encounter .encounter-container::after {
  content: '';
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: url('./assets/base/nav_bg.png') center no-repeat;
  background-size: cover !important;
}

.encounter img {
    width: 80%;
    margin-top: 16%;
    max-width: none !important;
    z-index: -1;
    -webkit-filter: drop-shadow(0px 0px 94px #591C1C);
    filter: drop-shadow(0px 0px 94px #591C1C);
    z-index: -1;
}

.encounter .mobile-divider-wrapper {
  display: block;
}

.encounter .encounter-element,
.encounter .encounter-power,
.encounter .xp-gain,
.encounter .victory-chance {
  transform: translateX(20px);
  font-family: 'Alegreya Sans SC', sans-serif;
  z-index: 2;
}

.encounter .main-font {
  position: absolute;
  bottom: 40px;
  left: 50%;
  background-color: #3b0103 !important;
  height: 60px;
  transform: translateX(-50%);
  z-index: 1;
}

.encounter .main-font h1 {
      font-size: 1.5rem;
}

.encounter .victory-chance {
    background: linear-gradient(177.39deg, #EEC14E 42.02%, rgba(189, 48, 42, 0.51) 142.62%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    font-weight: 700;
    font-family: 'Alegreya Sans SC', sans-serif;
    font-size: 30px;
    margin-bottom: 40px;
    transform: translateX(-2px);
    text-shadow: none !important;
    z-index: 1;
}

.row .weapon-icon-wrapper[data-v-067077ae] {
  background: rgba(29, 29, 29, 0.3);
  border: 1px solid #EEC14E;
  border-radius: 4px;
  width: 243px;
  height: 287px;
  margin-top: 20px;
}

.row .weapon-icon-wrapper[data-v-067077ae] .name {
  background: linear-gradient(177.39deg, #EEC14E 42.02%, rgba(189, 48, 42, 0.51) 142.62%);
    -webkit-background-clip: text;
    background-clip: text;
    text-fill-color: transparent;
    text-shadow: 0px 0px 13px #721818;
    transform: translateY(-5px);
    font-weight: 700;
    font-size: 18px;
    font-family: 'Alegreya Sans SC', sans-serif;
    margin-bottom: 20px;
}

.row .weapon-icon-wrapper[data-v-067077ae] img {
    max-width: 180px;
    max-height: 180px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
}

span[data-v-b8ce8636] svg {
  transform: translateY(2px);
}

.trait .circle-element[data-v-0873d1aa] {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    transform: translateY(-9px);
}
</style>