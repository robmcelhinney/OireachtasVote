import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SiteHeader = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("oireachtas-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("oireachtas-theme", nextTheme);
  };

  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link className="brandLink" to="/">
          Oireachtas Vote
        </Link>
        <nav className="siteNav" aria-label="Primary">
          <Link to="/session/">Historic</Link>
          <Link to="/map">Map View</Link>
          <a
            className="githubIconLink"
            href="https://github.com/robmcelhinney/OireachtasVote"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            title="GitHub"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
                .07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
                -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04
                2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07
                -1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21
                .15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
          </a>
          <button
            type="button"
            className="themeToggleBtn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M12 4a1 1 0 0 1 1 1v1.2a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1Zm0 12.8a1 1 0 0 1 1 1V19a1 1 0 0 1-2 0v-1.2a1 1 0 0 1 1-1Zm8-4.8a1 1 0 0 1-1 1h-1.2a1 1 0 0 1 0-2H19a1 1 0 0 1 1 1Zm-12.8 0a1 1 0 0 1-1 1H5a1 1 0 0 1 0-2h1.2a1 1 0 0 1 1 1Zm9.05 5.65a1 1 0 0 1-1.41 0l-.85-.85a1 1 0 0 1 1.41-1.41l.85.85a1 1 0 0 1 0 1.41Zm-8.49-8.49a1 1 0 0 1-1.41 0l-.85-.85a1 1 0 0 1 1.41-1.41l.85.85a1 1 0 0 1 0 1.41Zm8.49 0a1 1 0 0 1 0-1.41l.85-.85a1 1 0 1 1 1.41 1.41l-.85.85a1 1 0 0 1-1.41 0Zm-8.49 8.49a1 1 0 0 1 0-1.41l.85-.85a1 1 0 1 1 1.41 1.41l-.85.85a1 1 0 0 1-1.41 0ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M9.37 5.51A7 7 0 0 0 18.49 14.63A9 9 0 1 1 9.37 5.51Z"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
