import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { Abi, ContractPromise } from '@polkadot/api-contract'
import abiData from './abi'

// log
import { fetchData } from "../data/dataActions";

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const connectInfo = (payload) => {
  return {
    type: "CONNECTION_INFO",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

const proofSize = 131072
const refTime = 6219235328
const storageDepositLimit = null

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    // const abiResponse = await fetch("/config/abi.json", {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //   },
    // });

    const configResponse = await fetch("/ink-mint-dapp/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();

    const { injectedWeb3 } = window;
    const subWalletInstalled = injectedWeb3 && injectedWeb3['subwallet-js']

    if (subWalletInstalled) {
      console.log("subWalletInstalled OK")

      try {
        // read connected address, metadata, signer
        const SubWalletExtension = window.injectedWeb3['subwallet-js']
        const wallet = await SubWalletExtension.enable()
        const accounts = await wallet.accounts.get()
        if (accounts) {
          console.log("connected account[0]:", accounts[0],)
        }
        else {
          dispatch(connectInfo("No connected account found"));
          return null
        }

        // set new provider
        const provider = new WsProvider(CONFIG.WS_PROVIDER)

        // get api
        const api = new ApiPromise({ provider })
        await api.isReady
        console.log("Api", api)

        // read abi
        const abi = new Abi(abiData, api.registry.getChainProperties())
        console.log("abi", abi)

        // Get contract
        const contract = new ContractPromise(api, abi, CONFIG.CONTRACT_ADDRESS)

        // Update state
        if (contract) {
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: contract,
              api: api,
              signer: wallet.signer,
            })
          )
        } else {
          console.log("contract NOK", contract.api._events)
          dispatch(connectInfo(accounts[0] + "Contract is empty"));
        }
      } catch (err) {
        console.log(err)
        dispatch(connectFailed("Something went wrong."));
      }
    } else {
      dispatch(connectFailed("Install SubWallet."));
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
