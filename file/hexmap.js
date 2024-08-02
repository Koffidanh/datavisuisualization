// function loadHexMap() {
//   const margin = { top: 20, right: 30, bottom: 40, left: 60 };
//   const width = 1200 - margin.left - margin.right;
//   const height = 700 - margin.top - margin.bottom;

//   const projection = d3
//     .geoAlbersUsa()
//     .scale(1280)
//     .translate([width / 2, height / 2]);

//   const path = d3.geoPath().projection(projection);

//   const svg = d3
//     .select("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//   const stateIdToAbbreviation = {
//     0: "AL",
//     1: "AK",
//     2: "AZ",
//     24: "AR",
//     25: "CA",
//     3: "CO",
//     19: "CT",
//     26: "DE",
//     4: "FL",
//     5: "GA",
//     27: "HI",
//     51: "ID",
//     22: "IL",
//     6: "IN",
//     29: "IA",
//     7: "KS",
//     30: "KY",
//     54: "LA",
//     8: "ME",
//     31: "MD",
//     9: "MA",
//     32: "MI",
//     10: "MN",
//     33: "MS",
//     20: "MO",
//     34: "MT",
//     47: "NE",
//     52: "NV",
//     35: "NH",
//     11: "NJ",
//     23: "NM",
//     36: "NY",
//     12: "NC",
//     13: "ND",
//     37: "OH",
//     14: "OK",
//     38: "OR",
//     15: "PA",
//     55: "RI",
//     48: "SC",
//     16: "SD",
//     39: "TN",
//     17: "TX",
//     40: "UT",
//     53: "VT",
//     41: "VA",
//     42: "WA",
//     21: "WV",
//     43: "WI",
//     18: "WY",
//     78: "GU",
//     16: "DC",
//     32: "PR",
//     50: "AS",
//     22: "MP",
//     44: "VI",
//   };

//   d3.json("https://unpkg.com/us-atlas@3/states-10m.json").then((us) => {
//     const states = topojson.feature(us, us.objects.states).features;

//     // Remove everything from the view when we switch views
//     svg.selectAll("*").remove();

//     // Draw state contours
//     svg
//       .append("g")
//       .attr("class", "states")
//       .selectAll("path")
//       .data(states)
//       .enter()
//       .append("path")
//       .attr("d", path)
//       .attr("fill", "none")
//       .attr("stroke", "#000")
//       .attr("stroke-width", 1);

//     d3.json("data.json")
//       .then((data) => {
//         const stateData = data.votes;
//         console.log("data: ", stateData);

//         stateCenters = states.map((state, index) => {
//           const stateAbbr = stateIdToAbbreviation[index];
//           const centroid = path.centroid(state);
//           console.log("state: ", state);
//           console.log("index: ", index);
//           return {
//             id: index,
//             abbr: stateAbbr,
//             centroid: centroid,
//             name: state.properties.name || stateAbbr,
//             geojson: state,
//             electoralVotes: stateData[stateAbbr]?.electoral,
//             popularVotes: stateData[stateAbbr]?.popular,
//           };
//         });
//         console.log("stateCenters: ", stateCenters);

//         // Draw state names with click event
//         svg
//           .selectAll("text")
//           .data(stateCenters, (d) => d.abbr)
//           .enter()
//           .append("text")
//           .attr("x", (d) => d.centroid[0])
//           .attr("y", (d) => d.centroid[1])
//           .attr("text-anchor", "middle")
//           .attr("dy", "0.35em")
//           .text((d) => d.name)
//           .style("font-size", "10px")
//           .style("fill", "#000")
//           .on("click", function (event, d) {
//             // Debugging line to check data in click event
//             console.log("Clicked state data:", d);

//             // Show modal with state information
//             document.getElementById("modalName").textContent = d.name;
//             document.getElementById("modalDemocratPopular").textContent =
//               d.popularVotes?.democrat || 0;
//             document.getElementById("modalRepublicanPopular").textContent =
//               d.popularVotes?.republican || 0;
//             document.getElementById("modalDemocratElectoral").textContent =
//               d.electoralVotes?.democrat || 0;
//             document.getElementById("modalRepublicanElectoral").textContent =
//               d.electoralVotes?.republican || 0;
//             document.getElementById("stateModal").style.display = "block";
//           });

//         svg
//           .selectAll("text.coords")
//           .data(stateCenters, (d) => d.abbr)
//           .enter()
//           .append("text")
//           .attr("class", "coords")
//           .attr("x", (d) => d.centroid[0])
//           .attr("y", (d) => d.centroid[1] + 20)
//           .attr("text-anchor", "middle")
//           .attr("dy", "0.35em")
//           .text(
//             (d) =>
//               `(${Math.round(d.centroid[0])}, ${Math.round(d.centroid[1])})`
//           )
//           .style("font-size", "8px")
//           .style("fill", "#000");
//       })
//       .catch((error) => {
//         console.error("Error loading data.json:", error);
//       });

//     // Close modal functionality
//     document
//       .getElementById("closeModal")
//       .addEventListener("click", function () {
//         document.getElementById("stateModal").style.display = "none";
//       });
//   });
// }
