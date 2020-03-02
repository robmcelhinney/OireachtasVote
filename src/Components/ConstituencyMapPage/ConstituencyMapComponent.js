import React, {useContext, useState} from "react";
import StyleObject from "../../utils/StyleObject";
import {DailContext} from "../../contexts/DailContext/DailContext";
import ConstituencyComponent from "./ConstituencyComponent";

const mapContainerStyle = new StyleObject()
    .setBasics("60%", "100%", 0 , 0)
    .setDisplay("flex")
    .setFlexDirection("column")
    .getStyle();

const mapStyle = new StyleObject()
    .getStyle();


const ConstituencyMapComponent = () =>
{
    let { state } = useContext(DailContext);

    const [hoveredConst, setHoveredConst] = useState("");
    const [showDublinConstituencies, toggleDublinConstituencies] = useState(false);

    let mainConstituencySVGs = [];
    let dublinConstituenciesSVGs = [];

    let generateConstituencySVG = (constituency, isDublinConstituency) =>
    {
        return (
            <ConstituencyComponent
                constituency={constituency}
                isDublinConst={isDublinConstituency}
                showDublinConsts={showDublinConstituencies}
                hoveredConst={hoveredConst}
                setHoveredConst={setHoveredConst}
                toggleDublinConsts={toggleDublinConstituencies}
            />
        );
    };

    const constituencies = require("../../constituencies/" + state.dailNum + ".json")[state.dailNum];
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
            <div style={mapContainerStyle}>
                <span>Constituencies of Dail {state.dailNum}</span>
                <svg style={mapStyle} viewBox={"0 0 800 800"}>
                    {mainConstituencySVGs}
                    {showDublinConstituencies || hoveredConst === "dublin" ? dublinConstituenciesSVGs : null}
                </svg>
            </div>
    );
};


export default ConstituencyMapComponent;