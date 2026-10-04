# BlueMap Marker Editor

A web-based GUI for creating and managing markers in BlueMap.

## TODO

- [ ] Redesign into a generic editor with layout customization options (e.g., JSON configuration at the top of the file).
- [ ] Add support for additional marker types and their respective GUIs.
- [ ] Update import/export functionality to match native BlueMap formats.

## Installation

1. In `./plugins/BlueMap/webapp.conf`, add or update the `scripts` section:

```hocon
scripts: [
  "js/BlueMapMarkerEditor.js"
]
```

2. Upload the file `BlueMapMarkerEditor.js` to `./bluemap/web/js/`.

## Importing Markers

1. Navigate to `./plugins/BlueMap/maps/` and open the configuration file of the world where you want the markers to appear (e.g., `world.conf`).
2. Add the `include` directive:

```hocon
include required(file("path/to/markers.conf"))
```

**Example:**
```hocon
include required(file("plugins/BlueMap/markers/custom_mark.conf"))
```
