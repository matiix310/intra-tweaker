export const getUiBlock = (title: string, doc = document): Element | null => {
  const titleElement = Array.from(doc.getElementsByClassName("title")).find(
    (t) => (t as HTMLElement).innerText == title
  );

  if (!titleElement) return null;

  return titleElement.nextElementSibling;
};
