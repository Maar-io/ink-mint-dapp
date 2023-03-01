import store from "../store";

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
      let blockchain = store.getState().blockchain
      let userAddress = blockchain?.account.address;
      let gasRequired = await blockchain?.api.consts.system.blockWeights['maxBlock']
      if (blockchain.smartContract !== undefined) {
        // query total supply
        const { output } = await blockchain.smartContract.query['psp34::totalSupply'](userAddress,
          {
            gasLimit: blockchain.api.registry.createType('WeightV2', gasRequired),
          }
        )
        console.log("fetchData, totalSupply=", output?.toString())
        const totalSupply = output?.toString()

        // Update state
        dispatch(
          fetchDataSuccess({
            totalSupply,
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

