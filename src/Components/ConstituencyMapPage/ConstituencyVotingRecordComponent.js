import React from "react";
import StyleObject from "../../utils/StyleObject";


const votingRecordStyle = new StyleObject()
    .getStyle();


const ConstituencyVotingRecordComponent = () =>
{
    return (
        <div style={votingRecordStyle}>
            <span>blah</span>
        </div>
    );
};


export default ConstituencyVotingRecordComponent;