import * as React from "react";

let DailContext = React.createContext();

let initialState = {
    dailNum: 33,
    constituencies: [],
    selectedConstituency: "",
    members: []
};

let reducer = (state, action) => {
    switch (action.type) {
        case "switchDail":
            return { ...state, dailNum: action.dail };
        case "updateMembers":
            return { ...state, members: action.members};
        case "selectConstituency":
            return { ...state, selectedConstituency: action.constituency};
    }
};

function DailContextProvider(props) {
    let [state, dispatch] = React.useReducer(reducer, initialState);
    let value = { state, dispatch };

    return (
        <DailContext.Provider value={value}>{props.children}</DailContext.Provider>
    );
}

let DailContextConsumer = DailContext.Consumer;

export { DailContext, DailContextProvider, DailContextConsumer };