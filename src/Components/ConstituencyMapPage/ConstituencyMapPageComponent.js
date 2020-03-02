import React from "react";
import StyleObject from "../../utils/StyleObject";
import ConstituencyMapComponent from "./ConstituencyMapComponent";
import ConstituencyVotingRecordComponent from "./ConstituencyVotingRecordComponent";


const mapPageStyle = new StyleObject()
    .setBasics("100%", "100%" , 0 ,0)
    .setDisplay("flex")
    .setPadding(15)
    .getStyle();


const ConstituencyMapPageComponent = () =>
{
    return (
        <div style={mapPageStyle}>
            <ConstituencyMapComponent/>
            <ConstituencyVotingRecordComponent/>
        </div>
    );
};


export default ConstituencyMapPageComponent;