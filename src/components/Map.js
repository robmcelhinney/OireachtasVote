import React, {useContext, useState} from "react";
import StyleObject from "../utils/StyleObject";
import {DailContext} from "../DailContext";
import {constituencyGreen, nonSelectedCounty, TRANSITION_SPEEDS} 
        from "../utils/StyleConstants";
import {DUBLIN_CONSTITS} from "../utils/Constants";
import Table from "./Table";
import {getData, handleCheckedConstituency, handleCheckedDublin, camelCase} 
        from "./helper";
import {Link} from "react-router-dom";
import ordinal from "ordinal";


const mapPageStyle = new StyleObject()
    .setBasics("100%", "auto" , 0 ,0)
    .getStyle();

const mapContainerStyle = new StyleObject()
    .setBasics("50%", "auto", 0 , 0)
    .setDisplay("flex")
    .setFlexDirection("column")
    .getStyle();

const mapStyle = new StyleObject()
    .setHeight("100%")
    .getStyle();


const Map = (props) =>
{
    const { state } = useContext(DailContext);

    document.title = "Oireacthas Vote Map View"

    const [hoveredConst, setHoveredConst] = useState("");
    const [selectedConst, setSelectedConst] = useState("");
    const [showDublinConstituencies, toggleDublinConstituencies] = 
            useState(false); 

    let [info, members] = getData();

    const [data, setData] = useState(members);

    let mainConstituencySVGs = [];
    let dublinConstituenciesSVGs = [];

    const setHover = constit => {
        if (window.innerWidth > 760) {
            setHoveredConst(constit) 
        }
    }

    let generateConstituencySVG = (constituency, isDublinConstituency) => {
        const constituencyStyle = new StyleObject()
            .setFill(selectedConst === "" || (selectedConst === "dublin" && 
                    isDublinConstituency) || selectedConst === constituency.id 
                    ? constituencyGreen : nonSelectedCounty)
            .setOpacity(isDublinConstituency && !showDublinConstituencies ?
                    0 : constituency.id === hoveredConst  ? 0.6 : 1)
            .setStroke("black")
            .setCursor("pointer")
            .setTransition("opacity", TRANSITION_SPEEDS.FAST)
            .setTransition("fill", TRANSITION_SPEEDS.FAST)
            .getStyle();

        return (<g id={constituency.id} key={constituency.id} 
                style={constituencyStyle}
                onMouseEnter={() => setHover(constituency.id)}
                onMouseLeave={() => setHover("")}
                onClick={() => {
                    if(constituency.id === "dublin") {
                        toggleDublinConstituencies(!showDublinConstituencies)
                        setSelectedConst("dublin")
                        setData(handleCheckedDublin(members))
                    }
                    else {
                        if(selectedConst !== constituency.id){
                            setSelectedConst(constituency.id)
                            setData(handleCheckedConstituency(members, 
                                    constituency.id))
                            if (!DUBLIN_CONSTITS.includes(constituency.id)) {
                                toggleDublinConstituencies(false)
                            }
                        }
                        else {
                            setSelectedConst("")
                            setData(members)
                        }
                    }
                }}
        >
            <path d={constituency.path} transform={constituency.transform}/>
        </g>);
    };

    const constituencies = require(
            "../constituencies/" + state.dailNum + ".json")[state.dailNum];
    const nonDublinConstituencies = constituencies.filter(
            (constituency) => !DUBLIN_CONSTITS.includes(constituency.id));
    nonDublinConstituencies.forEach((constituency) => {
            mainConstituencySVGs.push(
            generateConstituencySVG(constituency, false));
    });

    const dubConstituencies = constituencies.filter(
            (constituency) => !nonDublinConstituencies
            .includes(constituency));
    dubConstituencies.forEach((constituency) => {
            dublinConstituenciesSVGs.push(generateConstituencySVG(
            constituency, true));
    });

    const currentConst = () => {
        if (selectedConst === "northern ireland") {
            return (
                <p className={"text-align-centre"}>
                    {camelCase(selectedConst)}: Since the Third Dáil (1922–1923) no members are elected in Northern Ireland.
                </p>
            )
        }
        else if (selectedConst) {
            return (
                <p className={"text-align-centre"}>
                    {camelCase(selectedConst)}
                </p>
            )
        }
        return (
            <p className={"text-align-centre"}>
                Tap a constituency
            </p>
        )
    }

    return (
        <div style={mapPageStyle} id={"mapTableContainer"}>
            <div style={mapContainerStyle} id={"mapTable"}>
                <p className={"text-align-centre constit"}>
                    Constituencies of {ordinal(state.dailNum)} Dáil
                </p>
                {currentConst()}
                <p className={"text-align-centre returnHome"}>
                    <Link to={"/"}>Home</Link>
                </p>
                <svg style={mapStyle}
                        className={"block-auto-margin"} 
                        id={"mapIreland"} viewBox="0 0 850 760">
                    {mainConstituencySVGs}
                    {showDublinConstituencies || hoveredConst === "dublin" ? 
                            dublinConstituenciesSVGs : null}
                </svg>
            </div>
            <div id={"mapReactTable"}>
                <Table members={data} info={info} className={"block-auto-margin"}/>
            </div>
        </div>
    );
};


export default Map;
