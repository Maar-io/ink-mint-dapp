const initialState = {
  loading: false,
  totalSupply: 0,
  cost: 0,
  error: false,
  message: "",
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHECK_DATA_REQUEST":
      return {
        ...state,
        loading: true,
        error: false,
        message: "",
      };
    case "CHECK_DATA_SUCCESS":
      return {
        ...state,
        loading: false,
        totalSupply: action.payload.totalSupply,
        // cost: action.payload.cost,
        error: false,
        message: "",
      };
    case "CHECK_DATA_FAILED":
      return {
        ...initialState,
        loading: false,
        error: true,
        message: action.payload,
      };
    default:
      return state;
  }
};

export default dataReducer;
