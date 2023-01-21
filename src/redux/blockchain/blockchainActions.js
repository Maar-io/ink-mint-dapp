import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { Abi, ContractPromise } from '@polkadot/api-contract'
// import type { WeightV2 } from '@polkadot/types/interfaces'

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

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
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
        const SubWalletExtension = window.injectedWeb3['subwallet-js']
        const extension = await SubWalletExtension.enable()
        const accounts = await extension.accounts.get()
        if (accounts) {
          accounts.forEach(element => {
            console.log("account:", element.address, )
            console.log("name:", element.name, )
            
          });
        }
        const meta = await extension.metadata.get()
        console.log("meta:", meta)

        console.log("all acc", accounts);
        dispatch(
            connectSuccess({
                account: accounts[0],
                // smartContract: SmartContractObj,
                // web3: web3,
              })
            );
        
        dispatch(connectInfo(accounts[0].address + "connected"));


        // const networkId = await ethereum.request({
        //   method: "net_version",
        // });
        // console.log("ethereum networkId:", networkId)
        // if (networkId == CONFIG.NETWORK.ID) {
          // const SmartContractObj = new Web3EthContract(
          //   abi,
          //   CONFIG.CONTRACT_ADDRESS
          // );
          // dispatch(
          //   connectSuccess({
          //     account: accounts[0],
          //     smartContract: SmartContractObj,
          //     web3: web3,
          //   })
          // );
        //   // Add listeners start
        //   ethereum.on("accountsChanged", (accounts) => {
        //     dispatch(updateAccount(accounts[0]));
        //   });
        //   ethereum.on("chainChanged", () => {
        //     window.location.reload();
        //   });
        //   // Add listeners end
        // } else {
        //   dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
        // }
      } catch (err) {
        dispatch(connectFailed("Something went wrong."));        
      }
    } else {
      console.log("subWalletInstalled NOK")
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
