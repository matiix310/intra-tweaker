export const setItem = (key: string, value: any): Promise<void> => {
  if (import.meta.env.BROWSER === "firefox")
    return Promise.resolve(localStorage.setItem(key, value));
  else if (import.meta.env.BROWSER === "chrome")
    return chrome.storage.sync.set({ [key]: value });
  else throw new Error("UNSUPPORTED BROWSER");
};

export const getItem = async (key: string): Promise<string | null> => {
  if (import.meta.env.BROWSER === "firefox")
    return Promise.resolve(localStorage.getItem(key));
  else if (import.meta.env.BROWSER === "chrome")
    return (await chrome.storage.sync.get(key))[key];
  else throw new Error("UNSUPPORTED BROWSER");
};
