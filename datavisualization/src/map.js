import * as d3 from "https://cdn.skypack.dev/d3@6";
import { feature } from "https://cdn.skypack.dev/topojson@3";

const width = 960;
const height = 600;

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const path = d3.geoPath();
const projection = d3
  .geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

const data = new Map();
const colorScale = d3
  .scaleThreshold()
  .domain([1, 5, 10, 20, 50, 100, 200, 500])
  .range(d3.schemeBlues[9]);

Promise.all([
  d3.json("https://d3js.org/us-10m.v1.json"),
  d3.json("data.json"),
]).then(([us, electionResults]) => {
  console.log("US Data:", us); // Debugging
  console.log("Election Results:", electionResults); // Debugging

  Object.keys(electionResults.votes).forEach((state) => {
    data.set(state, electionResults.votes[state].electoral.republican);
  });

  svg
    .append("g")
    .selectAll("path")
    .data(feature(us, us.objects.states).features)
    .enter()
    .append("path")
    .attr("fill", (d) => {
      d.total = data.get(d.properties.name) || 0;
      return colorScale(d.total);
    })
    .attr("d", path.projection(projection))
    .style("stroke", "transparent")
    .attr("class", "State")
    .on("mouseover", function (event, d) {
      d3.select(this).style("stroke", "black");
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke", "transparent");
    });

  const x = d3.scaleLinear().domain([1, 500]).range([600, 860]);

  const legend = svg.append("g").attr("transform", "translate(0,40)");

  legend
    .selectAll("rect")
    .data(
      colorScale.range().map((d) => {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", (d) => x(d[0]))
    .attr("width", (d) => x(d[1]) - x(d[0]))
    .attr("fill", (d) => colorScale(d[0]));

  legend
    .append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Electoral Votes");

  legend
    .call(
      d3
        .axisBottom(x)
        .tickSize(13)
        .tickFormat((d) => d)
        .tickValues(colorScale.domain())
    )
    .select(".domain")
    .remove();
});
