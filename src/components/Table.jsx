import React, { useCallback, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import Tooltip from "@material-ui/core/Tooltip";
import fallbackUser from "../icons/user.svg";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const PartyFilter = ({ options, value, onChange }) => {
  const selected = value.map((label) => ({ label, value: label }));
  return (
    <Select
      isMulti
      options={options}
      className="basic-multi-select"
      classNamePrefix="select"
      menuPortalTarget={document.body}
      value={selected}
      onChange={(next) => onChange(next && next.length ? next.map((opt) => opt.label) : [])}
      styles={{
        control: (base) => ({ ...base, minHeight: 34, borderRadius: 10, borderColor: "#dce6f1", boxShadow: "none" }),
        valueContainer: (base) => ({ ...base, padding: "0 8px" }),
        menu: (base) => ({ ...base, borderRadius: 10, border: "1px solid #dce6f1", boxShadow: "0 10px 28px rgba(16, 32, 51, 0.12)" }),
        option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? "#eef5ff" : "#fff", color: "#102033" }),
        multiValue: (base) => ({ ...base, backgroundColor: "#e9f2ff", borderRadius: 8 }),
        multiValueLabel: (base) => ({ ...base, color: "#194f86" }),
      }}
    />
  );
};

const RangeFilter = ({ min, max, maxValue, onMinChange, onMaxChange }) => (
  <div className="rangeFilter">
    <input type="number" min={0} max={maxValue} value={min} onChange={(e) => onMinChange(e.target.value)} placeholder="Min" />
    <span className="rangeSep">to</span>
    <input type="number" min={0} max={maxValue} value={max} onChange={(e) => onMaxChange(e.target.value)} placeholder="Max" />
  </div>
);

const SliderFilter = ({ min, max, maxValue, onMinChange, onMaxChange }) => {
  const safeMin = min === "" ? 0 : Number(min);
  const safeMax = max === "" ? maxValue : Number(max);

  const handleMin = (value) => {
    const numberValue = Number(value);
    onMinChange(String(Math.min(numberValue, safeMax)));
  };

  const handleMax = (value) => {
    const numberValue = Number(value);
    onMaxChange(String(Math.max(numberValue, safeMin)));
  };

  return (
    <div className="sliderFilter">
      <div className="sliderRow">
        <label>Min</label>
        <input type="range" min={0} max={maxValue} value={safeMin} onChange={(e) => handleMin(e.target.value)} />
        <span>{safeMin}</span>
      </div>
      <div className="sliderRow">
        <label>Max</label>
        <input type="range" min={0} max={maxValue} value={safeMax} onChange={(e) => handleMax(e.target.value)} />
        <span>{safeMax}</span>
      </div>
    </div>
  );
};

const TextFilter = ({ value, onChange, placeholder = "Filter..." }) => (
  <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
);

const Table = ({ members, info }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);
  const [sortBy, setSortBy] = useState({ key: "percentVotes", dir: "asc" });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const [nameFilter, setNameFilter] = useState("");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [lastNameFilter, setLastNameFilter] = useState("");
  const [constituencyFilter, setConstituencyFilter] = useState("");
  const [partyFilter, setPartyFilter] = useState([]);
  const [percentMin, setPercentMin] = useState("");
  const [percentMax, setPercentMax] = useState("");
  const [votesMin, setVotesMin] = useState("");
  const [votesMax, setVotesMax] = useState("");
  const [percentFilterMode, setPercentFilterMode] = useState("input");
  const [votesFilterMode, setVotesFilterMode] = useState("input");

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  const getNewTDTooltip = useCallback(
    (totalVotes, firstName, secondName = "") => (
      <Tooltip title={`TD available for ${totalVotes} votes.`} enterDelay={300} leaveDelay={100} placement="top">
        <span>
          {firstName}* {secondName}
        </span>
      </Tooltip>
    ),
    []
  );

  const partyOptions = useMemo(() => {
    const fromInfo = (info.parties || []).map((party) => ({ label: party.label, value: party.label }));
    if (fromInfo.length > 0) return fromInfo;
    const uniq = Array.from(new Set((members || []).map((m) => m.party))).sort();
    return uniq.map((label) => ({ label, value: label }));
  }, [info.parties, members]);

  const filteredMembers = useMemo(() => {
    const pMin = percentMin === "" ? -Infinity : Number(percentMin);
    const pMax = percentMax === "" ? Infinity : Number(percentMax);
    const vMin = votesMin === "" ? -Infinity : Number(votesMin);
    const vMax = votesMax === "" ? Infinity : Number(votesMax);

    return members.filter((member) => {
      if (isMobile) {
        const fullName = `${member.firstName} ${member.lastName}`;
        if (nameFilter && !normalizeText(fullName).includes(normalizeText(nameFilter))) return false;
      } else {
        if (firstNameFilter && !normalizeText(member.firstName).includes(normalizeText(firstNameFilter))) return false;
        if (lastNameFilter && !normalizeText(member.lastName).includes(normalizeText(lastNameFilter))) return false;
        if (constituencyFilter && !normalizeText(member.constituency).includes(normalizeText(constituencyFilter))) return false;
        if (member.votes < vMin || member.votes > vMax) return false;
      }

      if (partyFilter.length > 0 && !partyFilter.includes(member.party)) return false;
      if (member.percentVotes < pMin || member.percentVotes > pMax) return false;
      return true;
    });
  }, [
    members,
    isMobile,
    nameFilter,
    firstNameFilter,
    lastNameFilter,
    constituencyFilter,
    partyFilter,
    percentMin,
    percentMax,
    votesMin,
    votesMax,
  ]);

  const sortedMembers = useMemo(() => {
    const data = [...filteredMembers];
    const { key, dir } = sortBy;
    data.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return dir === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aText = normalizeText(aValue);
      const bText = normalizeText(bValue);
      if (aText < bText) return dir === "asc" ? -1 : 1;
      if (aText > bText) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [filteredMembers, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sortedMembers.length / pageSize));

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageCount, pageIndex]);

  const pagedMembers = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedMembers.slice(start, start + pageSize);
  }, [sortedMembers, pageIndex, pageSize]);

  const pageSizeOptions = useMemo(() => {
    const options = [5, 10, 15, 20, 50, 100, members.length].filter((value) => value > 0);
    return Array.from(new Set(options)).sort((a, b) => a - b);
  }, [members.length]);

  const setSort = (key) => {
    setSortBy((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  };

  const renderSortIcon = (key) => {
    if (sortBy.key !== key) return "↕";
    return sortBy.dir === "asc" ? "▲" : "▼";
  };

  const headers = isMobile
    ? [
        { key: "fullName", label: "Name", sortable: false },
        { key: "party", label: "Party", sortable: true },
        { key: "percentVotes", label: "Percent", sortable: true },
      ]
    : [
        { key: "photo", label: "Photo", sortable: false },
        { key: "firstName", label: "First Name", sortable: true },
        { key: "lastName", label: "Last Name", sortable: true },
        { key: "party", label: "Party", sortable: true },
        { key: "constituency", label: "Constituency", sortable: true },
        { key: "percentVotes", label: "Percent", sortable: true },
        { key: "votes", label: "Votes", sortable: true },
      ];

  return (
    <div className="tableShell" aria-label="Voting table">
      {isMobile ? (
        <div className="tableMobileToolbar">
          <button
            type="button"
            className={showFilters ? "filterToggleBtn active" : "filterToggleBtn"}
            onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      ) : null}
      <div className="tableScrollX">
      <table className="modernTableV7">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                className={header.key === "photo" || header.key === "fullName" ? "stickyCol" : ""}
                onClick={header.sortable ? () => setSort(header.key) : undefined}
              >
                <div className="thContent">
                  <span>{header.label}</span>
                  {header.sortable ? <span className="sortIcon">{renderSortIcon(header.key)}</span> : null}
                </div>
                {showFilters ? (
                <div className="filterControl" onClick={(event) => event.stopPropagation()}>
                  {header.key === "fullName" ? <TextFilter value={nameFilter} onChange={setNameFilter} /> : null}
                  {header.key === "firstName" ? <TextFilter value={firstNameFilter} onChange={setFirstNameFilter} /> : null}
                  {header.key === "lastName" ? <TextFilter value={lastNameFilter} onChange={setLastNameFilter} /> : null}
                  {header.key === "constituency" ? <TextFilter value={constituencyFilter} onChange={setConstituencyFilter} /> : null}
                  {header.key === "party" ? <PartyFilter options={partyOptions} value={partyFilter} onChange={setPartyFilter} /> : null}
                  {header.key === "percentVotes" ? (
                    <div>
                      <div className="filterModeRow">
                        <button
                          type="button"
                          className={percentFilterMode === "input" ? "modeBtn active" : "modeBtn"}
                          onClick={() => setPercentFilterMode("input")}
                        >
                          Input
                        </button>
                        <button
                          type="button"
                          className={percentFilterMode === "slider" ? "modeBtn active" : "modeBtn"}
                          onClick={() => setPercentFilterMode("slider")}
                        >
                          Slider
                        </button>
                      </div>
                      {percentFilterMode === "slider" ? (
                        <SliderFilter
                          min={percentMin}
                          max={percentMax}
                          maxValue={100}
                          onMinChange={setPercentMin}
                          onMaxChange={setPercentMax}
                        />
                      ) : (
                        <RangeFilter
                          min={percentMin}
                          max={percentMax}
                          maxValue={100}
                          onMinChange={setPercentMin}
                          onMaxChange={setPercentMax}
                        />
                      )}
                    </div>
                  ) : null}
                  {header.key === "votes" ? (
                    <div>
                      <div className="filterModeRow">
                        <button
                          type="button"
                          className={votesFilterMode === "input" ? "modeBtn active" : "modeBtn"}
                          onClick={() => setVotesFilterMode("input")}
                        >
                          Input
                        </button>
                        <button
                          type="button"
                          className={votesFilterMode === "slider" ? "modeBtn active" : "modeBtn"}
                          onClick={() => setVotesFilterMode("slider")}
                        >
                          Slider
                        </button>
                      </div>
                      {votesFilterMode === "slider" ? (
                        <SliderFilter
                          min={votesMin}
                          max={votesMax}
                          maxValue={info.totalVotes || 0}
                          onMinChange={setVotesMin}
                          onMaxChange={setVotesMax}
                        />
                      ) : (
                        <RangeFilter
                          min={votesMin}
                          max={votesMax}
                          maxValue={info.totalVotes || 0}
                          onMinChange={setVotesMin}
                          onMaxChange={setVotesMax}
                        />
                      )}
                    </div>
                  ) : null}
                </div>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedMembers.map((member) => (
            <tr key={member.member_id}>
              {isMobile ? (
                <>
                  <td className="stickyCol">
                    {member.total_votes === null
                      ? `${member.firstName} ${member.lastName}`
                      : getNewTDTooltip(member.total_votes, member.firstName, member.lastName)}
                  </td>
                  <td>{member.party}</td>
                  <td>{member.percentVotes}%</td>
                </>
              ) : (
                <>
                  <td className="stickyCol">
                    <a href={`https://www.oireachtas.ie/en/members/member/${member.member_id}`}>
                      <img
                        alt="td"
                        className="member__avatar"
                        src={`https://data.oireachtas.ie/ie/oireachtas/member/id/${member.member_id}/image/thumb`}
                        onError={(event) => {
                          event.target.src = fallbackUser;
                        }}
                      />
                    </a>
                  </td>
                  <td>
                    {member.total_votes === null ? member.firstName : getNewTDTooltip(member.total_votes, member.firstName)}
                  </td>
                  <td>{member.lastName}</td>
                  <td>{member.party}</td>
                  <td>{member.constituency}</td>
                  <td>{member.percentVotes}%</td>
                  <td>{member.votes}</td>
                </>
              )}
            </tr>
          ))}
          {pagedMembers.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="emptyState">
                No results match the current filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      </div>

      <div className="tablePagination">
        <button type="button" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
          First
        </button>
        <button type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={pageIndex === 0}>
          Prev
        </button>
        <span>
          Page {pageIndex + 1} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))}
          disabled={pageIndex >= pageCount - 1}
        >
          Next
        </button>
        <button type="button" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>
          Last
        </button>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPageIndex(0);
          }}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Table;
