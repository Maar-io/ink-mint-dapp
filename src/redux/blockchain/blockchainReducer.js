const initialState = {
  loading: false,
  account: null,
  smartContract: null,
  message: "",
  api: null,
  signer: null
};

const blockchainReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CONNECTION_REQUEST":
      return {
        ...initialState,
        loading: true,
      };
    case "CONNECTION_SUCCESS":
      return {
        ...state,
        loading: false,
        account: action.payload.account,
        smartContract: action.payload.smartContract,
        api: action.payload.api,
        signer: action.payload.signer
      };
    case "CONNECTION_FAILED":
      return {
        ...initialState,
        loading: false,
        message: action.payload,
      };
    case "CONNECTION_INFO":
      return {
        ...initialState,
        message: action.payload,
      };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        account: action.payload.account,
      };
    default:
      return state;
  }
};

export default blockchainReducer;
