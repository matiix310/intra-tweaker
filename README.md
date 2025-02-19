
# Intra tweaker

Intra tweaker is a firefox extension made to improve the intranet of the EPITA school.
## Features

- **Grafana**:
    - Grafana stats directly above the tags
- **Tags**:
    - Progress bar and ETA when a tag is running (with live data from Grafana)
    - Notification when a tag has finished running
    - Reason for why the tag was rejected
- **Graph**:
    - Display the validated number of nodes (required and optional) recursively
    - No more zoom triggered with the mouse wheel
- **Speed**:
    - Images are blocked by default to speed up the loading time
## Installation

You can download the extension in the xpi format from the [release](https://github.com/matiix310/intra-tweaker/releases/) tab and firefox with add the extension automatically for you. You can also build the app yourself by following the `Build locally` steps below.
## Build locally

To build this project you need a node environement (I will use bun in the examples) and [web-ext](https://github.com/mozilla/web-ext) to build and run the final extension.

```bash
  git clone git@github.com:matiix310/intra-tweaker.git
```

Build the background main script and the modules

```bash
  cd background
  bun install
  bun run build
```

Now go back to the root of the repository and run the extension with web-ext

```bash
  web-ext run
```
## Contributing

The extension is build from modules. Each module has its configuration in `background/src/modules.ts` and can have multiple files with different purpose. 
You can for example have a file injected directly in the page content (content-src) or have a file launched by the main background script (background).

The source code of the modules are located in `background/src/modules/<moduleName>/<moduleFiles>`.

The common scripts are in `background/src/common/*`:
- `grafana.ts` handle the requests to the grafana server
- `graph.ts` handle the graph parsing
- `tags.ts` manages the parsing of the tags.

If you want to contribute, feel free to open a pull request or to message me on discord (@matiix310).
## Authors

- [@matiix310](https://matiix310.dev)

