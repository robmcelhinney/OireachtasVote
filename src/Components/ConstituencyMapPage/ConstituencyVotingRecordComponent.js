import React, {useContext} from "react";
import StyleObject from "../../utils/StyleObject";
import {DailContext} from "../../contexts/DailContext/DailContext";


const membersVotingRecordContainerStyle = new StyleObject()
    .setHeight("40%")
    .setWidth("30%")
    .setMargin("2%")
    .setBorderRadius(10)
    .setBorder("1px solid rgba(107,107,107, 0.2)")
    .setBoxShadow("0px 3px 5px 2px rgba( 0, 0, 0, 0.1)")
    .setOverflow("hidden")
    .getStyle();

const titleStyle = new StyleObject()
    .setFontSize(20)
    .setFontWeight("bold")
    .setMargin("auto")
    .getStyle();

const titleBarStyle = new StyleObject()
    .setBackgroundColor("#6397bf")
    .setWidth("100%")
    .setHeight("10%")
    .setDisplay("flex")
    .getStyle();

const ConstituencyVotingRecordComponent = () =>
{
    let { state, dispatch } = useContext(DailContext);

    console.log(state.members.length);
    return (
        <div style={membersVotingRecordContainerStyle}>
            <div style={titleBarStyle}><span style={titleStyle}>{state.selectedConstituency}</span></div>
            {/* members info here */}
        </div>
    );
};


export default ConstituencyVotingRecordComponent;