import React, {useContext, useState} from "react";
import StyleObject from "../utils/StyleObject";
import {DailContext} from "../DailContext";


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

    let generateConstituencySVGs = () =>
    {
        const constituencies = require("../constituencies/" + state.dailNum + ".json")[state.dailNum];
        return constituencies.map((constituency) =>
        {
            const constituencyStyle = new StyleObject()
                .setFill("#3d8f3d")
                .setOpacity(constituency.id === hoveredConst ? 0.4 : 1)
                .setStroke("black")
                .setCursor("pointer")
                .getStyle();

            return <g id={constituency.id}
                      style={constituencyStyle}
                      onMouseEnter={() => setHoveredConst(constituency.id)}
                      onMouseLeave={() => setHoveredConst("")}
                    >
                        <path d={constituency.path} transform={constituency.transform}/>
                   </g>;
        })
    };

    let constituencySVGs = generateConstituencySVGs();

    return (
            <div style={mapPageStyle}>
                <div style={mapContainerStyle}>
                    <span>Constituencies of Dail {state.dailNum}</span>
                    <svg style={mapStyle}>
                        {constituencySVGs}
                    </svg>
                </div>
            </div>
    );
};


export default ConstituencyMapComponent;