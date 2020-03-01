import React, {useContext, useState} from "react";
import StyleObject from "../utils/StyleObject";
import {DailContext} from "../DailContext";
import {constituencyGreen, nonSelectedCounty, TRANSITION_SPEEDS} from "../utils/StyleConstants";


const mapPageStyle = new StyleObject()
    .setBasics("100%", "100%" , 0 ,0)
    .setPadding(15)
    .getStyle();

const mapContainerStyle = new StyleObject()
    .setBasics("50%", "100%", 0 , 0)
    .setDisplay("flex")
    .setFlexDirection("column")
    .getStyle();

const mapStyle = new StyleObject()
    .setHeight("100%")
    .getStyle();


const ConstituencyMapComponent = (props) =>
{
    let { state, dispatch } = useContext(DailContext);

    const [hoveredConst, setHoveredConst] = useState("");
    const [selectedConst, setSelectedConst] = useState("");
    const [showDublinConstituencies, toggleDublinConstituencies] = useState(false);

    let mainConstituencySVGs = [];
    let dublinConstituenciesSVGs = [];

    let generateConstituencySVG = (constituency, isDublinConstituency) =>
    {
        const constituencyStyle = new StyleObject()
            .setFill(selectedConst === "" || selectedConst === "dublin" && isDublinConstituency || selectedConst === constituency.id ?
                constituencyGreen : nonSelectedCounty)
            .setOpacity(isDublinConstituency && !showDublinConstituencies ? 0 : constituency.id === hoveredConst  ? 0.6 : 1)
            .setStroke("black")
            .setCursor("pointer")
            .setTransition("opacity", TRANSITION_SPEEDS.FAST)
            .setTransition("fill", TRANSITION_SPEEDS.FAST)
            .getStyle();

        return (<g id={constituency.id}
                   style={constituencyStyle}
                   onMouseEnter={() => setHoveredConst(constituency.id)}
                   onMouseLeave={() => setHoveredConst("")}
                   onClick={() =>
                   {
                       if(constituency.id === "dublin")
                       {
                           toggleDublinConstituencies(!showDublinConstituencies);
                           setSelectedConst("dublin");
                       }
                       else
                       {
                           if(selectedConst !== constituency.id)
                           {
                               setSelectedConst(constituency.id);
                           }
                           else
                           {
                               setSelectedConst("");
                           }

                       }
                   }}
        >
            <path d={constituency.path} transform={constituency.transform}/>
        </g>);
    };

    const constituencies = require("../constituencies/" + state.dailNum + ".json")[state.dailNum];
    let nonDublinConstituencies = constituencies.filter((constituency) => !constituency.id.startsWith("dublin-") && constituency.id !== "dun-laoghaire");
    let dubConstituencies = constituencies.filter((constituency) => !nonDublinConstituencies.includes(constituency));
    nonDublinConstituencies.forEach((constituency) =>
    {
        mainConstituencySVGs.push(generateConstituencySVG(constituency, false));
    });

    dubConstituencies.forEach((constituency) =>
    {
        dublinConstituenciesSVGs.push(generateConstituencySVG(constituency, true));
    });


    return (
            <div style={mapPageStyle}>
                <div style={mapContainerStyle}>
                    <span>Constituencies of Dail {state.dailNum}</span>
                    <svg style={mapStyle}>
                        {mainConstituencySVGs}
                        {showDublinConstituencies || hoveredConst === "dublin" ? dublinConstituenciesSVGs : null}
                    </svg>
                </div>
            </div>
    );
};


export default ConstituencyMapComponent;