**index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Stock Price Visualization</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { font-family: sans-serif; }
    .bar { fill: steelblue; }
    .bar-label { fill: black; text-anchor: middle; font-size: 10px; }
    .axis path, .axis line { fill: none; stroke: #000; shape-rendering: crispEdges; }
    .axis text { font-size: 11px; }
    .chart-title { font-size: 16px; font-weight: bold; text-anchor: middle; }
    .chart {
      width: 800px;
      height: 600px;
    }
  </style>
</head>
<body>
  <div id="chart" class="chart"></div>
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

    d3.csv("data.csv").then(data => {
      // Parse data
      data.forEach(d => {
        d.date = d3.timeParse("%Y-%m-%d")(d.date);
        d.price = +d.price;
      });

      // Create scales
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.price))
        .range([height, 0]);

      // Create axes
      const xAxis = d3.axisBottom(x).ticks(width / 80);
      const yAxis = d3.axisLeft(y);

      // Add axes
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .append("text")
          .attr("class", "axis-label")
          .attr("x", width)
          .attr("y", -6)
          .attr("dy", "-1.21em")
          .attr("text-anchor", "end")
          .text("Date");

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
          .attr("class", "axis-label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "-1.21em")
          .attr("text-anchor", "end")
          .text("Price");

      // Add title
      svg.append("text")
         .attr("class", "chart-title")
         .attr("x", width / 2)
         .attr("y", 0 - (margin.top / 2))
         .attr("text-anchor", "middle")
         .text("AAPL Stock Price Over Time");

      // Add bars
      svg.selectAll(".bar")
        .data(data)
        .join("rect")
          .attr("class", "bar")
          .attr("x", d => x(d.date))
          .attr("y", d => y(d.price))
          .attr("width", 2)
          .attr("height", d => height - y(d.price))
          .append("title")
            .text(d => d.price);

      // Add labels on top of bars
      svg.selectAll(".bar-label")
        .data(data)
        .join("text")
          .attr("class", "bar-label")
          .attr("x", d => x(d.date) + (width / data.length) / 2)
          .attr("y", d => y(d.price) - 4)
          .text(d => d.price);
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

**data.csv**

```csv
date,symbol,price
2000-01-01,AAPL,100
2000-02-01,AAPL,120
2000-03-01,AAPL,115
2000-04-01,AAPL,140
2000-05-01,AAPL,135
2000-06-01,AAPL,160
2000-07-01,AAPL,165
2000-08-01,AAPL,170
2000-09-01,AAPL,155
2000-10-01,AAPL,180
2000-11-01,AAPL,190
2000-12-01,AAPL,200
```

This implementation includes the following:
1. Parsing dates and prices.
2. Creating time and linear scales.
3. Adding X and Y axes with labels.
4. Adding bars and labels for each data point.
5. Ensuring the chart fits within an 800x600 viewport.
6. Adding basic styling for the chart, bars, and labels.