# File-level data dictionary

The original CSV has six header lines. Line 6 is x,y,U_mean; data starts on line 7. The line 3 value `2,1` is retained but its meaning is unconfirmed. The clean CSV removes only the first five preamble lines and retains the column header and original data values. datapackage.json describes that standard CSV; the viewer reads the original.

| Field | Meaning | Unit |
| --- | --- | --- |
| x | Original x coordinate | m |
| y | Original y coordinate | m |
| U_mean | Signed mean velocity component | m/s |

Grid: 249 x coordinates and 197 y coordinates, 49,053 unique coordinate pairs. x ranges from -0.07113929073472 to 0.13411917 approximately; y from -0.08522908 to 0.0766297663398862 approximately. All values are finite, with no zero-valued U_mean in this file. Velocity range: -0.599288198248556 to 0.146555781628470 m/s.

The supplied MATLAB script skips six lines and reconstructs the arrays with MATLAB column-major reshape. For its velocity colour map it uses x and y in metres, signed velocity in m/s, equal axis scaling, and no coordinate transformation or normalisation. It does not document the physical coordinate origin or fully explain the flow-axis sign. No negative values are reversed. Zero must not be assumed to be a mask.

Browser rendering is a cell map without interpolation; MATLAB's contourf uses 80 contour levels. This is a rendering difference, not a change to values. Pressure coefficients, surface extraction and smoothing are outside this pilot.

The nwtf object in datapackage.json is an application-specific extension, not a standard Frictionless grid vocabulary. Standard resource and column descriptions remain separate from these conventions. No licence for the original measurements is inferred from the landing page's metadata licence.
