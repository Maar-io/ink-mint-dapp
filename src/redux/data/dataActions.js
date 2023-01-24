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
      let userAddress = store.getState().blockchain.account.address;
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
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
