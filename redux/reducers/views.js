import produce from "immer";

const initialState = {
  // ui
  selectedIndex: 0,
};

export default (state, action) => produce(state || initialState, (draft) => {
  if(!action.type.startsWith("views/"))
    return;

  switch(action.type) {
    case "views/selectedIndex":
      draft.selectedIndex = action.payload;
      break;
  }
});