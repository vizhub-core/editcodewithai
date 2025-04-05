**index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <title>AAPL Stock Price Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { font-family: sans-serif; }
    .bar { fill: steelblue; }
    .bar-label { fill: black; text-anchor: middle; font-size: 10px; }
    .axis path, .axis line { fill: none; stroke: #000; shape-rendering: crispEdges; }
    .axis text { font-size: 11px; }
    .chart-title { font-size: 16px; font-weight: bold; text-anchor: middle; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script type="module">
    const margin = {top: 40, right: 30, bottom: 40, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    d3.csv("data.csv", d3.autoType).then(data => {
      // Parse dates
      const parseDate = d3.timeParse("%Y-%m-%d");
      data.forEach(d => {
          d.date = parseDate(d.date);
      });


      // Scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.price)])
        .range([height, 0]);

      // Axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

      // Bars
      svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => xScale(d.date))
          .attr("y", d => yScale(d.price))
          .attr("width", width / data.length - 2) // Adjust width as needed
          .attr("height", d => height - yScale(d.price));

      // Bar labels
        svg.selectAll(".bar-label")
            .data(data)
            .enter().append("text")
            .attr("class", "bar-label")
            .attr("x", d => xScale(d.date) + (width / data.length - 2) / 2)
            .attr("y", d => yScale(d.price) - 5) // Position above the bar
            .text(d => d.price);

      // Title
      svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .text("AAPL Stock Price Over Time");



    }).catch(error => {
      console.error("Error loading or processing data:", error);
       svg.append("text")
         .attr("x", width / 2)
         .attr("y", height / 2)
         .attr("text-anchor", "middle")
         .text("Error loading data. Check console.");
    });
  </script>
</body>
</html>
```
