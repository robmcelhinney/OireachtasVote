import React, {useContext} from "react";
import PropTypes from 'prop-types';
import {selectConstituency} from "../../contexts/DailContext/DailContextActions";
import StyleObject from "../../utils/StyleObject";
import {constituencyGreen, nonSelectedCounty, TRANSITION_SPEEDS} from "../../utils/StyleConstants";
import {DailContext} from "../../contexts/DailContext/DailContext";


const ConstituencyComponent = (props) =>
{
    let { state, dispatch } = useContext(DailContext);

    let selectedConst = state.selectedConsituency;

    const constituencyStyle = new StyleObject()
        .setFill(selectedConst === "" || selectedConst === "dublin" && props.isDublinConst || selectedConst === props.constituency.id ?
            constituencyGreen : nonSelectedCounty)
        .setOpacity(props.isDublinConst && !props.showDublinConsts ? 0 : props.constituency.id === props.hoveredConst  ? 0.6 : 1)
        .setStroke("black")
        .setCursor("pointer")
        .setTransition("opacity", TRANSITION_SPEEDS.FAST)
        .setTransition("fill", TRANSITION_SPEEDS.FAST)
        .getStyle();


    return (
        <g id={props.constituency.id}
           style={constituencyStyle}
           onMouseEnter={() => props.setHoveredConst(props.constituency.id)}
           onMouseLeave={() => props.setHoveredConst("")}
           onClick={() =>
           {
               if(props.constituency.id === "dublin")
               {
                   props.toggleDublinConsts(!props.showDublinConsts);
                   dispatch(selectConstituency("dublin"));
               }
               else
               {
                   if(selectedConst !== props.constituency.id)
                   {
                       dispatch(selectConstituency(props.constituency.id));
                   }
                   else
                   {
                       dispatch(selectConstituency(""));
                   }

               }
           }}
        >
            <path d={props.constituency.path} transform={props.constituency.transform}/>
        </g>
    );
};

ConstituencyComponent.propTypes = {
    constituency: PropTypes.object,
    isDublinConst: PropTypes.bool,
    showDublinConsts: PropTypes.bool,
    hoveredConst: PropTypes.string,
    setHoveredConst: PropTypes.func,
    toggleDublinConsts: PropTypes.func

};


export default ConstituencyComponent;