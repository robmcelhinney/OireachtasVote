import * as React from "react";

let DailContext = React.createContext();

let initialState = {
    dailNum: 33,
    constituencies: [],
};

let reducer = (state, action) => {
    switch (action.type) {
        case "switchDail":
            return { ...state, dailNum: action.dail };
        default:
            return state
    }
};

function DailContextProvider(props) {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const value = { state, dispatch };

    return (
        <DailContext.Provider value={value}>{props.children}</DailContext.Provider>
    );
}

const DailContextConsumer = DailContext.Consumer;

export { DailContext, DailContextProvider, DailContextConsumer };