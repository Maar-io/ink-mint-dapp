import store from "../store";

const proofSize = 131072
const refTime = 6219235328
const storageDepositLimit = 1000000

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      console.log("try fetchData",)

      let userAddress = store.getState().blockchain.account.address;
      console.log("fetchData, userAddress=", userAddress)
      let blockchain = store.getState().blockchain
      if (blockchain.smartContract !== undefined) {
        const { output } = await blockchain.smartContract.query['psp34::totalSupply'](userAddress,
          {
            gasLimit: blockchain.api.registry.createType('WeightV2', {
              refTime,
              proofSize,
            }),
            storageDepositLimit,
          }
        )
        // .call();
        console.log("fetchData, totalSupply=", output.toString())
        const totalSupply = output.toString()
        dispatch(
          fetchDataSuccess({
            totalSupply,
            // cost,
          })
        );
      }
      else {
        console.log("query totalSupply failed, blockchain=", blockchain)

      }

      if (blockchain.smartContract !== undefined) {
        const { gasRequired } = await blockchain.smartContract.query['payableMint::mintNext'](
          userAddress,
          // userAddress,
          // 1,
          {
            gasLimit: blockchain.api.registry.createType('WeightV2', {
              refTime,
              proofSize,
            }),
            storageDepositLimit,
          }
        )
        console.log("mint gasRequired", gasRequired.toString())

        // // const { gasConsumed, result, output } = await blockchain.smartContract.tx['payableMint::mintNext'](
        // console.log("account use for signing", blockchain.account)
        // console.log("address use for signing", blockchain.account.address)
        // console.log("signer", blockchain.signer)
        // const mintValue = new BN('1000000000000000000')
        // const res = await blockchain.smartContract.tx['payableMint::mintNext'](
        //   // userAddress,
        //   // userAddress,
        //   // 1,
        //   {
        //     value: mintValue,
        //     gasLimit: blockchain.api.registry.createType('WeightV2', {
        //       refTime,
        //       proofSize,
        //     }),
        //     storageDepositLimit,
        //   }
        // ).
        //   signAndSend(blockchain.account.address, { signer: blockchain.signer}, (result) => {
        //     if (result.status.isInBlock) {
        //       console.log('in a block');
        //     } else if (result.status.isFinalized) {
        //       console.log('finalized');
        //     }
        //   });
        // console.log("mint result", res)
        // console.log("mint output", output.toString())
        // console.log("mint gasConsumed", gasConsumed.toString())


        // await blockchain.smartContract.tx
        // .mint({ value, gasLimit }, incValue)
        // .signAndSend(alicePair, (result) => {
        //   if (result.status.isInBlock) {
        //     console.log('in a block');
        //   } else if (result.status.isFinalized) {
        //     console.log('finalized');
        //   }
        // });

      }

      // let cost = await store
      //   .getState()
      //   .blockchain.smartContract.methods.cost()
      //   .call();

    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
