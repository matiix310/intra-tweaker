import React, { useEffect, useState } from "react";
import "./App.css";
import { ShortModule } from "../../types/global";

export default () => {
  const [modules, setModules] = useState<ShortModule[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [userScriptsPermission, setUserScriptsPermission] = useState<boolean>(false);

  const fetchModules = () => {
    browser.runtime
      .sendMessage({ action: "fetchModules" })
      .then((m) => setModules(m ?? []));
  };

  const fetchUserScriptsPermission = async () => {
    browser.runtime
      .sendMessage({ action: "fetchUserScriptsPermission" })
      .then((p) => setUserScriptsPermission(p));
  };

  useEffect(() => {
    fetchUserScriptsPermission();
    fetchModules();
  }, []);

  return (
    <>
      <div className="main-container">
        {userScriptsPermission ? (
          <>
            <span className="quote">
              Moi ça ne me dérange pas de faire redoubler 50% de la promo.
            </span>
            <input
              type="text"
              id="moduleSearch"
              placeholder="Search a module"
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <span id="resultCount">0 module found</span>
            <div id="list">
              {modules
                .filter((m) =>
                  m.name
                    .replaceAll(" ", "")
                    .toLowerCase()
                    .includes(searchValue.replaceAll(" ", "").toLowerCase())
                )
                .sort((m1, m2) => {
                  if (m1.active == m2.active) return m1.name.localeCompare(m2.name);
                  return m1.active ? -1 : 1;
                })
                .map(({ name, author, active }) => (
                  <div
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
            onClick={async () => {
              const granted = await browser.permissions.request({
                permissions: ["userScripts"],
              });

              if (granted) {
                browser.runtime.sendMessage({ action: "initModules" });
                fetchModules();
                setUserScriptsPermission(true);
              }
            }}
          >
            Give permission
          </button>
        )}
      </div>
    </>
  );
};
