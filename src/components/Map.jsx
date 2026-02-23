import React, {useContext, useEffect, useMemo, useState} from "react";
import StyleObject from "../utils/StyleObject";
import {DailContext} from "../DailContext";
import {constituencyGreen, nonSelectedCounty, TRANSITION_SPEEDS}
        from "../utils/StyleConstants";
import {DUBLIN_CONSTITS} from "../utils/Constants";
import Table from "./Table";
import {getData, handleCheckedConstituency, handleCheckedDublin, camelCase}
        from "./helper";
import ordinal from "ordinal";

const constituencyModules = import.meta.glob("../constituencies/*.json");

const mapPageStyle = new StyleObject()
    .setBasics("100%", "auto" , 0 ,0)
    .getStyle();

const mapContainerStyle = new StyleObject()
    .setBasics("100%", "auto", 0 , 0)
    .setDisplay("flex")
    .setFlexDirection("column")
    .getStyle();

const mapStyle = new StyleObject()
    .setHeight("100%")
    .getStyle();

const normalizeId = (value) =>
    String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const normalizedDublinIds = new Set(DUBLIN_CONSTITS.map(normalizeId));

const Map = () =>
{
    const { state } = useContext(DailContext);

    document.title = "Oireacthas Vote Map View";

    const [hoveredConst, setHoveredConst] = useState("");
    const [selectedConst, setSelectedConst] = useState("");
    const [showDublinConstituencies, toggleDublinConstituencies] =
            useState(false);

    const [info, setInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [data, setData] = useState([]);
    const [constituencies, setConstituencies] = useState([]);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            const [nextInfo, nextMembers] = await getData(state.dailNum);
            const constituenciesPath = `../constituencies/${state.dailNum}.json`;
            const constituencyLoader = constituencyModules[constituenciesPath];
            let loadedConstituencies = [];
            if (constituencyLoader) {
                const constituencyModule = await constituencyLoader();
                const constituencyData = constituencyModule.default || constituencyModule;
                loadedConstituencies = constituencyData[state.dailNum] || [];
            }

            if (!alive) {
                return;
            }

            setInfo(nextInfo);
            setMembers(nextMembers || []);
            setData(nextMembers || []);
            setConstituencies(loadedConstituencies);
            setHoveredConst("");
            setSelectedConst("");
            toggleDublinConstituencies(false);
        };

        load();

        return () => {
            alive = false;
        };
    }, [state.dailNum]);

    const setHover = constit => {
        if (window.innerWidth > 760) {
            setHoveredConst(constit);
        }
    };

    const nonDublinConstituencies = useMemo(
        () => constituencies.filter((constituency) =>
            !normalizedDublinIds.has(normalizeId(constituency.id))
        ),
        [constituencies]
    );

    const dubConstituencies = useMemo(
        () => constituencies.filter((constituency) =>
            normalizedDublinIds.has(normalizeId(constituency.id))
        ),
        [constituencies]
    );

    const isDublinSelected = normalizeId(selectedConst) === "dublin";
    const dublinDetailVisible = showDublinConstituencies || hoveredConst === "dublin";

    const generateConstituencySVG = (constituency, isDublinConstituency) => {
        const constituencyId = normalizeId(constituency.id);
        const isDublinAggregate = constituencyId === "dublin";
        const opacity = isDublinConstituency && !dublinDetailVisible
            ? 0
            : constituency.id === hoveredConst
                ? 0.6
                : 1;
        const constituencyStyle = new StyleObject()
            .setFill(selectedConst === "" || (isDublinSelected &&
                    isDublinConstituency) || selectedConst === constituency.id
                    ? constituencyGreen : nonSelectedCounty)
            .setOpacity(opacity)
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
                    if(isDublinAggregate) {
                        const selectingDublin = selectedConst !== "dublin";
                        if (selectingDublin) {
                            toggleDublinConstituencies(true);
                            setSelectedConst("dublin");
                            setData(handleCheckedDublin(members));
                        } else {
                            toggleDublinConstituencies(false);
                            setSelectedConst("");
                            setData(members);
                        }
                    }
                    else {
                        if(selectedConst !== constituency.id){
                            setSelectedConst(constituency.id);
                            setData(handleCheckedConstituency(members,
                                    constituency.id));
                            if (!normalizedDublinIds.has(normalizeId(constituency.id))) {
                                toggleDublinConstituencies(false);
                            } else {
                                toggleDublinConstituencies(true);
                            }
                        }
                        else {
                            setSelectedConst("");
                            setData(members);
                        }
                    }
                }}
        >
            <path d={constituency.path} transform={constituency.transform}/>
        </g>);
    };

    const currentConst = () => {
        if (selectedConst === "northern ireland") {
            return (
                <p className={"text-align-centre"}>
                    {camelCase(selectedConst)}: Since the Third Dáil (1922-1923) no members are elected in Northern Ireland.
                </p>
            );
        }
        else if (selectedConst) {
            return (
                <p className={"text-align-centre"}>
                    {camelCase(selectedConst)}
                </p>
            );
        }
        return (
            <p className={"text-align-centre"}>
                Select a constituency
            </p>
        );
    };

    if (!info) {
        return <div className={"maincontent container"}>Ag lódáil léarscáil...</div>;
    }

    return (
        <div style={mapPageStyle} id={"mapTableContainer"}>
            <div style={mapContainerStyle} id={"mapTable"}>
                <p className={"text-align-centre constit"}>
                    Constituencies of {ordinal(state.dailNum)} Dáil
                </p>
                {currentConst()}
                <svg style={mapStyle}
                        className={"block-auto-margin"}
                        id={"mapIreland"} viewBox="0 0 850 760">
                    {nonDublinConstituencies.map((constituency) => generateConstituencySVG(constituency, false))}
                    {dublinDetailVisible
                        ? dubConstituencies.map((constituency) => generateConstituencySVG(constituency, true))
                        : null}
                </svg>
            </div>
            <div id={"mapReactTable"}>
                <Table members={data} info={info} className={"block-auto-margin"}/>
            </div>
        </div>
    );
};

export default Map;
