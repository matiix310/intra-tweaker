const run = async () => {
  const customStyles = `
    #trace-failures {
        position: fixed;
        right: 0;
        overflow-x: scroll;
        height: 50vh;
    }

    @media screen and (max-width: 1600px) {
        #trace-failures {
            position: unset;
        } 
    }
    `;

  var style = document.createElement("style");
  document.head.appendChild(style);
  style.innerHTML = customStyles;
};

export default defineUnlistedScript(() => {
  run();
});
