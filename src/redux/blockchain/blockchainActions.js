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
        // read connected address, metadata, signer
        const SubWalletExtension = window.injectedWeb3['subwallet-js']
        const wallet = await SubWalletExtension.enable()
        const accounts = await wallet.accounts.get()
        if (accounts) {
          accounts.forEach(element => {
            console.log("account address:", element.address,)
            console.log("account name:", element.name,)
            
          });
          console.log("account = ", accounts[0])
        }
        else{
          dispatch(connectInfo(accounts[0] + " No connected address found"));
          return null
        }
        const meta = await wallet.metadata.get()
        console.log("meta:", meta)
        console.log("all acc", accounts);
        console.log("account signer:", wallet.signer,)
        const signer = wallet.signer;

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
        console.log("contract", contract);

        // Update state
        if (contract) {
          console.log("contract OK", contract.api._events)
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: contract,
              api: api,
              signer: signer,
            })
          )
        } else {
          console.log("contract NOK", contract.api._events)

          dispatch(connectInfo(accounts[0] + "Contract is empty"));
        }


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

// const getContract = async (address, ws_provider) => {
//   const provider = new WsProvider(ws_provider)
//   const api = new ApiPromise({ provider })

//   await api.isReady
//   console.log("Api", api)

//   const abi = new Abi(abiData, api.registry.getChainProperties())
//   console.log("abi", abi)

//   const contract = new ContractPromise(api, abi, address.value)

//   return contract
// }

// const queryTotalSupply = async (api, contract) => {
//   // (We perform the send from an account, here using Alice's address)
//   const { gasRequired, result, output } = await contract.query['psp34::totalSupply'](
//     {
//       gasLimit: api.registry.createType('WeightV2', {
//         refTime,
//         proofSize,
//       }),
//       storageDepositLimit,
//     }
//   )
//   console.log("result", result)
//   return result
// }