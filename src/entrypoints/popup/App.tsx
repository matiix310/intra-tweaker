import React, { useEffect, useState } from "react";
import "./App.css";
import { ShortModule } from "../../types/global";

export default () => {
  const [modules, setModules] = useState<ShortModule[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [userScriptsPermission, setUserScriptsPermission] = useState<boolean>(false);

  const version = browser.runtime.getManifest().version;

  const fetchModules = () => {
    browser.runtime
      .sendMessage({ action: "fetchModules" })
      .then((m) => setModules(m ?? []));
  };

  const fetchUserScriptsPermission = async () => {
    browser.runtime
      .sendMessage({ action: "fetchUserScriptsPermission" })
      .then(setUserScriptsPermission);
  };

  useEffect(() => {
    fetchUserScriptsPermission();
    fetchModules();
  }, []);

  const getFilteredModules = () => {
    return modules.filter((m) =>
      m.name
        .replaceAll(" ", "")
        .toLowerCase()
        .includes(searchValue.replaceAll(" ", "").toLowerCase())
    );
  };

  return (
    <>
      <div className="main-container">
        {userScriptsPermission ? (
          <>
            <span className="version">v{version}</span>
            <input
              type="text"
              id="moduleSearch"
              placeholder="Search a module"
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <span id="resultCount">
              {getFilteredModules().length} module
              {getFilteredModules().length < 2 ? "" : "s"} found
            </span>
            <div id="list">
              {getFilteredModules()
                .sort((m1, m2) => {
                  if (m1.active == m2.active) return m1.name.localeCompare(m2.name);
                  return m1.active ? -1 : 1;
                })
                .map(({ name, author, active }) => (
                  <div
                    key={name + author}
                    className={"module-card" + (active ? " active" : "")}
                    onClick={() => {
                      browser.runtime
                        .sendMessage({ action: "toggleModule", name })
                        .then(() => fetchModules());
                    }}
                  >
                    <div className="left">
                      <span className="module-name">{name}</span>
                      <span className="module-author">By {author}</span>
                    </div>
                    <div className="right">
                      <span className="on">ON</span>
                      <span className="off">OFF</span>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <button
            id="grantPermissionButton"
            onClick={() => {
              browser.permissions
                .request({
                  permissions: ["userScripts"],
                })
                .then((granted) => {
                  if (granted) {
                    browser.runtime.sendMessage({ action: "initModules" }).then(() => {
                      fetchModules();
                      setUserScriptsPermission(true);
                    });
                  }
                });
            }}
          >
            Give permission
          </button>
        )}
      </div>
    </>
  );
};
