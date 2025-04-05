Here's a complete implementation for the index.html file that meets all the requirements:

**index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <title>AAPL Stock Price Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      height: 100vh; 
      margin: 0; 
    }
    .bar { fill: steelblue; transition: fill 0.3s; }
    .bar:hover { fill: orange; }
    .bar-label { fill: black; text-anchor: middle; font-size: 10px; }
    .axis path, .axis line { 
      fill: none; 
      stroke: #000; 
      shape-rendering: crispEdges; 
    }
    .axis text { font-size: 11px; }
    .chart-title { 
      font-size: 16px; 
      font-weight: bold; 
      text-anchor: middle; 
    }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    // Main D3 Visualization Function
    function renderStockChart(selection, options = {}) {
      const margin = options.margin || {top: 40, right: 30, bottom: 40, left: 60};
      const width = options.width || 800 - margin.left - margin.right;
      const height = options.height || 600 - margin.top - margin.bottom;

      // Clear any existing SVG to prevent multiple renders
      selection.selectAll("svg").remove();

      const svg = selection.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Load and process data
      d3.csv("data.csv").then(data => {
        // Parse dates and prices
        const parseDate = d3.timeParse("%Y-%m-%d");
        data.forEach(d => {
          d.date = parseDate(d.date);
          d.price = +d.price;
        });

        // Create scales
        const xScale = d3.scaleTime()
          .domain(d3.extent(data, d => d.date))
          .range([0, width]);

        const yScale = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.price)])
          .range([height, 0]);

        // Create X Axis
        const xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeMonth.every(2));

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);

        // X Axis Label
        svg.append("text")
          .attr("class", "axis-label")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom)
          .style("text-anchor", "middle")
          .text("Date");

        // Create Y Axis
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        // Y Axis Label
        svg.append("text")
          .attr("class", "axis-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -margin.left + 15)
          .style("text-anchor", "middle")
          .text("Price ($)");

        // Create Bars
        svg.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => xScale(d.date))
          .attr("width", width / data.length * 0.8)
          .attr("y", d => yScale(d.price))
          .attr("height", d => height - yScale(d.price));

        // Add Price Labels
        svg.selectAll(".bar-label")
          .data(data)
          .enter().append("text")
          .attr("class", "bar-label")
          .attr("x", d => xScale(d.date) + (width / data.length * 0.4))
          .attr("y", d => yScale(d.price) - 5)
          .text(d => `$${d.price}`);

        // Add Chart Title
        svg.append("text")
          .attr("class", "chart-title")
          .attr("x", width / 2)
          .attr("y", 0 - (margin.top / 2))
          .text("AAPL Stock Price Over Time");

      }).catch(error => {
        console.error("Error loading or processing data:", error);
        selection.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .text("Error loading data. Check console.");
      });
    }

    // Render the chart
    renderStockChart(d3.select("#chart"));
  </script>
</body>
</html>
```

This implementation addresses all the requirements:

1. Uses D3.js v7 for visualization
2. Loads data from data.csv
3. Renders SVG bars inside the #chart div
4. Includes X (time) and Y (price) axes with labels
5. Uses a time scale for the X-axis and a linear scale for the Y-axis
6. Adds a title to the chart
7. Displays price values as text near each bar
8. Responsive and fits within an 800x600 viewport
9. Includes basic styling for bars, axes, and chart elements

I've also made the chart rendering function flexible by accepting optional configuration parameters, making it more reusable. The function uses data joins and is idempotent, clearing any existing SVG before rendering.