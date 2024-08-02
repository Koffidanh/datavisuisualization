function loadHexMap() {
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 1200 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  const colorScale = d3
    .scaleOrdinal()
    .domain([0, 1])
    .range(["#4B92DB", "#E24A34"]);

  const projection = d3
    .geoAlbersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const svg = d3
    .select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const stateIdToAbbreviation = {
    0: "AL",
    1: "AK",
    2: "AZ",
    3: "AR",
    4: "CA",
    5: "CO",
    6: "CT",
    7: "DE",
    8: "DC",
    9: "FL",
    10: "GA",
    11: "HI",
    12: "ID",
    13: "IL",
    14: "IN",
    15: "IA",
    16: "KS",
    17: "KY",
    18: "LA",
    19: "ME",
    20: "MD",
    21: "MA",
    22: "MI",
    23: "MN",
    24: "MS",
    25: "MO",
    26: "MT",
    27: "NE",
    28: "NV",
    29: "NH",
    30: "NJ",
    31: "NM",
    32: "NY",
    33: "NC",
    34: "ND",
    35: "OH",
    36: "OK",
    37: "OR",
    38: "PA",
    39: "RI",
    40: "SC",
    41: "SD",
    42: "TN",
    43: "TX",
    44: "UT",
    45: "VT",
    46: "VA",
    47: "WA",
    48: "WV",
    49: "WI",
    50: "WY",
  };

  d3.json("https://unpkg.com/us-atlas@3/states-10m.json").then((us) => {
    const states = topojson.feature(us, us.objects.states).features;

    svg.selectAll("*").remove();

    // Draw state contours
    svg
      .append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(states)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", 1);

    d3.json("data.json")
      .then((data) => {
        const stateData = data.votes;
        console.log("data: ", stateData);

        stateCenters = states.map((state, index) => {
          const stateAbbr = stateIdToAbbreviation[index];
          const centroid = path.centroid(state);
          console.log("state: ", state);
          console.log("index: ", index);
          return {
            id: index,
            abbr: stateAbbr,
            centroid: centroid,
            name: state.properties.name || stateAbbr,
            geojson: state,
            electoralVotes: stateData[stateAbbr]?.electoral,
            popularVotes: stateData[stateAbbr]?.popular,
          };
        });
        console.log("stateCenters: ", stateCenters);

        // Draw state names with click event
        svg
          .selectAll("text")
          .data(stateCenters, (d) => d.abbr)
          .enter()
          .append("text")
          .attr("x", (d) => d.centroid[0])
          .attr("y", (d) => d.centroid[1])
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .text((d) => d.name)
          .style("font-size", "10px")
          .style("fill", "#000")
          .on("click", function (event, d) {
            // Debugging line to check data in click event
            console.log("Clicked state data:", d);

            // Show modal with state information
            document.getElementById("modalName").textContent = d.name;
            document.getElementById("modalDemocratPopular").textContent =
              d.popularVotes?.democrat || 0;
            document.getElementById("modalRepublicanPopular").textContent =
              d.popularVotes?.republican || 0;
            document.getElementById("modalDemocratElectoral").textContent =
              d.electoralVotes?.democrat || 0;
            document.getElementById("modalRepublicanElectoral").textContent =
              d.electoralVotes?.republican || 0;
            document.getElementById("stateModal").style.display = "block";
          });

        svg
          .selectAll("text.coords")
          .data(stateCenters, (d) => d.abbr)
          .enter()
          .append("text")
          .attr("class", "coords")
          .attr("x", (d) => d.centroid[0])
          .attr("y", (d) => d.centroid[1] + 20)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .text(
            (d) =>
              `(${Math.round(d.centroid[0])}, ${Math.round(d.centroid[1])})`
          )
          .style("font-size", "8px")
          .style("fill", "#000");
      })
      .catch((error) => {
        console.error("Error loading data.json:", error);
      });

    // Close modal functionality
    document
      .getElementById("closeModal")
      .addEventListener("click", function () {
        document.getElementById("stateModal").style.display = "none";
      });
  });
}
