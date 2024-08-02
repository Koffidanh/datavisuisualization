//Code to import voter data from a JSON file and display it on a stacked bar chart.
//Allows for two different views of popular vote and delegates.
//Authored by Koffi Danhounsrou and Zach Allred
//Date: 07/29/2024
//CS6017, Assignment 7

// Load the JSON data from the file.
d3.json("data.json").then(function (data) {
  // Setting up margins for the charts with the webpage
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 1200 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  // This handles the x and y of the charts based on the JSON data
  const xChart = d3.scaleBand().range([0, width]).padding(0.1);
  const yChart = d3.scaleLinear().range([height, 0]);

  // Set color to red and blue, grey for "other"
  //this handles our type colors.
  const partyColor = d3
    .scaleOrdinal()
    .domain(["democrat", "republican", "other"])
    .range(["blue", "red", "grey"]);

  //this section handles setting up the margins of our chart
  //also handles the background color.
  const buildChart = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "lightgrey")
    //appends a group element to our chart
    .append("g")
    //handles translating our margins from earlier
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //this handles our hover text
  const hoverContent = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  function updateChart(type) {
    if (type === "map") {
      buildChart.selectAll("*").remove();
      loadHexMap();
      return;
    }
    // Load an array with the state values from the JSON
    const states = Object.keys(data.votes);
    const chartData = states.map((state) => {
      // Store the popular vote data or delegate data for each state
      const voteData = data.votes[state].popular;
      const delegateData = data.votes[state].electoral;
      const total = voteData.democrat + voteData.republican + voteData.other;
      const delegateTotal = delegateData.democrat + delegateData.republican;
      //return that data so we can access it in our rectangle builder
      return {
        state,
        //ternary operator to handle popular and delegate views.
        democrat:
          type === "popular" ? voteData.democrat : delegateData.democrat,
        republican:
          type === "popular" ? voteData.republican : delegateData.republican,
        other: type === "popular" ? voteData.other : 0,
        total: type === "popular" ? total : delegateTotal,
        popular: voteData,
      };
    });

    xChart.domain(chartData.map((d) => d.state));
    yChart.domain([0, d3.max(chartData, (d) => d.total)]);

    //remove everything from the svg/view when we switch views
    buildChart.selectAll("*").remove();

    // Section that handles gridlines on charts
    buildChart
      .append("g")
      .attr("class", "grid")
      .attr("stroke", "white")
      .call(d3.axisLeft(yChart).ticks(10).tickSize(-width).tickFormat(""));

    //this handles our bar chart stack
    const stack = d3.stack().keys(["democrat", "republican", "other"]);
    const stackedData = stack(chartData);

    //add all of our data to our chart svg element
    buildChart
      .selectAll("g.layer")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "layer")
      .attr("fill", (d) => partyColor(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      //append our rectangle to our graph
      .append("rect")
      .attr("x", (d) => xChart(d.data.state))
      //this handles stacking the bars based on the upper limit of stack
      .attr("y", (d) => yChart(d[1]))
      //sets height based on difference between bars
      .attr("height", (d) => yChart(d[0]) - yChart(d[1]))
      .attr("width", xChart.bandwidth())
      //create function to handle labels on hover
      .on("mouseover", function (event, d) {
        //selects the parent node of the bar, and retrieves its data
        const key = d3.select(this.parentNode).datum().key;
        hoverContent.transition().duration(200).style("opacity", 0.9);
        hoverContent
          .html(
            //switch/ternary to handle showing our labels on different views
            `${type === "popular" ? "Vote Count" : "Delegate Count"}<br>${
              key.charAt(0).toUpperCase() + key.slice(1)
            }: ${d.data[key].toLocaleString()}`
          )
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      //remove label on mouseout after 500 ms
      .on("mouseout", function () {
        hoverContent.transition().duration(500).style("opacity", 0);
      })
      // Add pie chart functionality for clicking
      .on("click", function (event, d) {
        if (type === "delegates") {
          const chartWindow = document.getElementById("pieChartModal");
          chartWindow.style.display = "block";

          // Remove existing pie chart if any
          d3.select("#pieChart").selectAll("*").remove();

          // Data for the pie chart based on popular vote
          const pieData = [
            { party: "Democrat", value: d.data.popular.democrat },
            { party: "Republican", value: d.data.popular.republican },
            { party: "Other", value: d.data.popular.other },
          ];

          //section below handles pie chart characteristics
          const pieChart = d3
            .pie()
            //sets the pie slice percentages
            .value((d) => d.value);

          const piePiece = d3
            .arc()
            //ensures there isn't a hole in the middle.
            .innerRadius(0)
            .outerRadius(200);

          const pieSvg = d3
            .select("#pieChart")
            .attr("width", 400)
            .attr("height", 400)
            .append("g")
            .attr("transform", "translate(200,200)");

          // add pie chart to screen
          const piePieces = pieSvg
            .selectAll(".arc")
            .data(pieChart(pieData))
            .enter()
            .append("g")
            .attr("class", "arc");

          piePieces
            .append("path")
            .attr("d", piePiece)
            .attr("fill", (d) => partyColor(d.data.party.toLowerCase()));

          // handle adding labels to our chart
          piePieces
            .append("text")
            .attr("transform", (d) => {
              const [x, y] = piePiece.centroid(d);
              //use this to adjust labels in or out, > nubmer is out
              const textCenteringPie = 0.9;
              return `translate(${x * textCenteringPie}, ${
                y * textCenteringPie
              })`;
            })
            //standard values for centering
            .attr("dy", ".35em")
            //anchor the text to the centroid of each piece for each arc.
            .style("text-anchor", (d) => {
              const [x, y] = piePiece.centroid(d);
              return x >= 0 ? "start" : "end";
            })
            //append our text.
            .text(
              (d) =>
                `${d.data.party}: ${Math.round(
                  (d.data.value / d3.sum(pieData, (d) => d.value)) * 100
                )}%`
            );
        }
      });

    // Section to add axis to charts
    buildChart
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xChart));

    buildChart
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yChart).ticks(10, "s"));

    // Add the state x axis
    buildChart
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.bottom - 10)
      .text("State");

    // Add a y axis label to the chart. Name depends on type
    buildChart
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2 + margin.top)
      //standard values for text
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      //ternary to handle different views
      .text(type === "popular" ? "Popular Votes" : "Delegate Count");

    // Add a legend to the charts
    const legend = buildChart
      .append("g")
      .attr("transform", `translate(${width - 60}, ${margin.top})`);

    const partyLineKeys = ["democrat", "republican", "other"];
    const legendSize = 20;
    legend
      .selectAll("rect")
      .data(partyLineKeys)
      .enter()
      .append("rect")
      // This is where you can adjust values of rectangles only
      .attr("x", legendSize + -40)
      .attr("y", (d, i) => i * (legendSize + 13))
      .attr("width", legendSize)
      .attr("height", legendSize)
      .attr("fill", (d) => partyColor(d));

    legend
      .selectAll("text")
      .data(partyLineKeys)
      .enter()
      .append("text")
      //here is handling the text location on the legend
      //NOTE Does not adjust rectangles.
      .attr("x", legendSize + -10)
      .attr("y", (d, i) => i * (legendSize + 13) + legendSize / 2)
      .attr("dy", "0.35em")
      .text((d) => d.charAt(0).toUpperCase() + d.slice(1));
  }
  //-------------------------------------------------------

  function loadHexMap() {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 1200 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

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
      24: "AR",
      25: "CA",
      3: "CO",
      19: "CT",
      26: "DE",
      4: "FL",
      5: "GA",
      27: "HI",
      51: "ID",
      22: "IL",
      6: "IN",
      29: "IA",
      7: "KS",
      30: "KY",
      54: "LA",
      8: "ME",
      31: "MD",
      9: "MA",
      32: "MI",
      10: "MN",
      33: "MS",
      20: "MO",
      34: "MT",
      47: "NE",
      52: "NV",
      35: "NH",
      11: "NJ",
      23: "NM",
      36: "NY",
      12: "NC",
      13: "ND",
      37: "OH",
      14: "OK",
      38: "OR",
      15: "PA",
      55: "RI",
      48: "SC",
      16: "SD",
      39: "TN",
      17: "TX",
      40: "UT",
      53: "VT",
      41: "VA",
      42: "WA",
      21: "WV",
      43: "WI",
      18: "WY",
      78: "GU",
      16: "DC",
      32: "PR",
      50: "AS",
      22: "MP",
      44: "VI",
    };

    d3.json("https://unpkg.com/us-atlas@3/states-10m.json").then((us) => {
      const states = topojson.feature(us, us.objects.states).features;

      // Remove everything from the view when we switch views
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

  //-------------------------------------------------------

  // Set up listeners for both buttons to change views
  d3.select("#showPopularVotesButton").on("click", function () {
    buildChart.selectAll("*").remove();
    updateChart("popular");
  });

  d3.select("#showDelegatesButton").on("click", function () {
    buildChart.selectAll("*").remove();
    updateChart("delegates");
  });

  d3.select("#showMapButton").on("click", function () {
    updateChart("map");
  });
});

// Close modal when clicking outside of it
window.onclick = function (event) {
  const pieChartWindow = document.getElementById("pieChartModal");
  if (event.target == pieChartWindow) {
    pieChartWindow.style.display = "none";
  }
};
