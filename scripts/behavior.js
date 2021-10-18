var dataSet;
var countries = [];
var selectedCountries = [];
function init() {


  d3.csv("../data/final/happy.csv").then(
      data => {
        loadCountries(data);
        //selectContinents();
        createRealBarChart(selectedCountries);

      }
  )

  //d3.json("../data/data.json")
    //.then((data) => {
      //dataSet = data;
      //createBarChart(data, false);
      //createScatterPlot(data, false);
      //createLineChart(data, false);
    //})
    //.catch((error) => {
    //  console.log(error);
    //});
}

function loadCountries(data, update) {
  data.forEach(row => countries.push(row));
  countries = countries.sort((a, b) => {
    if(a.country < b.country) return -1;
    else return 1;
  });
    var checks = d3.select('div#countriesChecks').selectAll('input[name="brand"]').data(countries);
    var labels = checks.enter()
        .append("div")
        .attr("class", "filter");

        labels.append("input")
        .attr("type", "checkbox")
        .attr("id",  function(d) { return d.country; })
        .attr("name", "checkbox")
        .attr("value", function(d) { return d.checked; })
        .on("change", function(d) {checkCountry(d.srcElement.id)});

        labels.append("span")
        .attr("class", "filterText")
        .attr("for", function(d) { return d; })
        .text(function(d) { return d.country; })
}

function checkCountry(country) {
  var countryObj = countries.filter(a => a.country == country)[0];

  selectedCountries.indexOf(countryObj) == -1? selectedCountries.push(countryObj) : selectedCountries = selectedCountries.filter(a => a != countryObj);
  dataChangeHappy(selectedCountries);
}

function createRealBarChart(data, update) {
  width = 450;
  height = 400;
  margin = { top: 20, right: 20, bottom: 20, left: 40 };


  var svg;
  if (!update) {
    svg = d3.select("#barChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  } else {
     svg = d3
        .select("div#barChart")
        .select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
             "translate(" + margin.left + "," + margin.top + ")");;
  }

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 10])
        .range([ 0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(function(d) { return d.country; }))
        .padding(0.5);
    svg.append("g")
        .call(d3.axisLeft(y))

    svg.selectAll("rect").exit().remove();
    //Bars
  console.log(data);
    var bars = svg.selectAll("rect")
        .data(data)
    bars.enter().append("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.country); })
        .attr("width", function(d) { return x(d.happiness_score_2020); })
        .attr("height", y.bandwidth() )
        .attr("fill", "steelblue")
        .on("mouseover", handleMouseOver)
        .on("mouseleave", handleMouseLeave)
        .on("click", handleClick)
        .transition()
        .duration(1000)
        .style("opacity", "100%");
    bars.exit().transition().duration(2000).remove();
}
function createBarChart(data, update) {
  width = 250;
  height = 300;

  margin = { top: 20, right: 20, bottom: 20, left: 40 };

  data = data.filter(function (d) {
    if (d.budget > 0) {
      return d;
    }
  });

  x = d3
    .scaleLinear()
    .domain([0, 10])
    .range([margin.left, width - margin.right]);

  y = d3
    .scaleBand()
    .range([ 0, height ])
    .domain(data.map(function(d) { return d.country; }))
    .padding(0.1);

  function xAxis(g) {
    g.attr("transform", `translate(0,${margin.top})`).call(d3.axisTop(x));
  }

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left},0)`).call(
      d3
        .axisLeft(y)
        .tickFormat((i) => {
          if (data[i].country % 3 == 0) return data[i].oscar_year;
        })
        .tickSizeOuter(0)
    );
  }

  if (!update) {
    d3.select("div#barChart").append("svg").append("g").attr("class", "bars");
  }

  const svg = d3
    .select("div#barChart")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .select("g.bars")
    .selectAll("rect")
    .data(data, function (d) {
      return d.oscar_year;
    })
    .join(
      (enter) => {
        return enter
          .append("rect")
          .attr("x", x(0))
          .attr("y", (d, i) => y(i))
          .attr("width", (d) => x(d.rating) - x(0))
          .attr("height", y.bandwidth())
          .style("fill", calculateFill)
          .on("mouseover", handleMouseOver)
          .on("mouseleave", handleMouseLeave)
          .on("click", handleClick)
          .transition()
          .duration(2000)
          .style("opacity", "100%");
      },
      (update) => {
        update
          .transition()
          .duration(1000)
          .attr("width", (d) => x(d.rating) - x(0))
          .attr("height", y.bandwidth())
          .style("fill", calculateFill)
          .attr("x", x(0))
          .attr("y", (d, i) => y(i));
      },
      (exit) => {
        return exit.remove();
      }
    );

  if (!update) {
    svg.append("g").attr("class", "xAxis");
    svg.append("g").attr("class", "yAxis");
  }

  d3.select("g.xAxis").call(xAxis);
  d3.select("g.yAxis").call(yAxis);
}

function createScatterPlot(data, update) {
  width = 250;

  height = 300;

  margin = { top: 20, right: 20, bottom: 20, left: 40 };

  data = data.filter(function (d) {
    if (d.budget > 0) {
      return d;
    }
  });

  x = d3
    .scaleLinear()
    .domain([-10, d3.max(data, (d) => d.budget)])
    .nice()
    .range([margin.left, width - margin.right]);

  y = d3
    .scaleLinear()
    .domain([5, 10])
    .range([height - margin.bottom, margin.top]);

  xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((x) => x / 1000000)
          .ticks(5)
      )
      .call((g) => g.select(".domain").remove());

  yAxis = (g) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove());

  grid = (g) =>
    g
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(x.ticks())
          .join("line")
          .attr("x1", (d) => 0.5 + x(d))
          .attr("x2", (d) => 0.5 + x(d))
          .attr("y1", margin.top)
          .attr("y2", height - margin.bottom)
      )
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y.ticks())
          .join("line")
          .attr("y1", (d) => 0.5 + y(d))
          .attr("y2", (d) => 0.5 + y(d))
          .attr("x1", margin.left)
          .attr("x2", width - margin.right)
      );

  if (!update) {
    d3.select("div#scatterPlot")
      .append("svg")
      .append("g")
      .attr("class", "circles")
      .style("stroke-width", 1.5);
  }

  const svg = d3
    .select("div#scatterPlot")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .select("g.circles")
    .selectAll("circle")
    .data(data, function (d) {
      return d.oscar_year;
    })
    .join(
      (enter) => {
        return enter
          .append("circle")
          .attr("cx", (d) => x(d.budget))
          .attr("cy", (d) => y(d.rating))
          .attr("r", calculateRadius)
          .style("fill", "steelblue")
          .on("mouseover", handleMouseOver)
          .on("mouseleave", handleMouseLeave)
          .on("click", handleClick)
          .transition()
          .duration(1000)
          .style("opacity", "100%");
      },
      (update) => {
        update
          .transition()
          .duration(1000)
          .attr("cx", (d) => x(d.budget))
          .attr("cy", (d) => y(d.rating))
          .attr("r", calculateRadius)
          .style("fill", "steelblue");
      },
      (exit) => {
        exit.remove();
      }
    );

  if (!update) {
    svg.append("g").attr("class", "scatterXAxis");
    svg.append("g").attr("class", "scatterYAxis");
    svg.append("g").attr("class", "scatterGrid").call(grid);
  } else {
  }
  d3.select("g.scatterXAxis").call(xAxis);
  d3.select("g.scatterYAxis").call(yAxis);
}

function createLineChart(data, update) {
  margin = { top: 20, right: 20, bottom: 20, left: 40 };

  data = data.filter(function (d) {
    if (d.budget > 0) {
      return d;
    }
  });

  line = d3
    .line()
    .defined(function (d) {
      return d.budget > 0;
    })
    .x((d) => x(d.year))
    .y((d) => y(d.budget));

  x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([margin.left, width - margin.right]);

  y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.budget)])
    .range([height - margin.bottom, margin.top]);

  xAxis = (g) =>
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(x)
        .tickFormat((x) => x)
        .tickSizeOuter(0)
    );

  yAxis = (g) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((x) => x / 1000000))
      .call((g) => g.select(".domain").remove());

  if (!update) {
    d3.select("div#lineChart")
      .append("svg")
      .append("g")
      .attr("class", "line")
      .append("path");
  }

  const svg = d3
    .select("div#lineChart")
    .select("svg")
    .attr("width", width)
    .attr("height", height);

  if (!update) {
    svg.append("g").attr("class", "lineXAxis");
    svg.append("g").attr("class", "lineYAxis");
  }

  svg.select("g.lineXAxis").call(xAxis);

  svg.select("g.lineYAxis").call(yAxis);

  svg
    .select("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .transition()
    .duration(1000)
    .attr("d", line);

  svg
    .select("g.line")
    .selectAll("circle")
    .data(data, function (d) {
      return d.oscar_year;
    })
    .join(
      (enter) => {
        return enter
          .append("circle")
          .attr("cx", (d) => x(d.year))
          .attr("cy", (d) => y(d.budget))
          .attr("r", 3)
          .style("fill", "steelblue")
          .text(function (d) {
            return d.title;
          })
          .on("mouseover", handleMouseOver)
          .on("mouseleave", handleMouseLeave)
          .on("click", handleClick)
          .transition()
          .duration(1000)
          .style("opacity", "100%");
      },
      (update) => {
        update
          .transition()
          .duration(1000)
          .attr("cx", (d) => x(d.year))
          .attr("cy", (d) => y(d.budget))
          .attr("r", 3)
          .style("fill", "steelblue");
      },
      (exit) => {
        exit.remove();
      }
    );
}

// New Code

function dataChangeHappy(data) {
        createRealBarChart(data, true);
        //createScatterPlot(newData, true);
        //createLineChart(newData, true);
}


function dataChange(value) {
  d3.json("data/data.json")
    .then((data) => {
      newData = data;
      switch (value) {
        case "new":
          newData = data.filter(function (d) {
            if (d.year >= 1972) {
              return d;
            }
          });
          break;
        case "old":
          newData = data.filter(function (d) {
            if (d.year < 1972) {
              return d;
            }
          });
          break;
        case "adj":
          newData = data;
          newData.forEach(function (d) {
            d.budget = d.budget_adj;
          });
          break;
        default:
          break;
      }
      createBarChart(newData, true);
      createScatterPlot(newData, true);
      createLineChart(newData, true);
    })
    .catch((error) => {
      console.log(error);
    });
}

function handleMouseOver(event, d) {
  barChart = d3.select("div#barChart").select("svg");

  scatterPlot = d3.select("div#scatterPlot").select("svg");

  lineChart = d3.select("div#lineChart").select("svg");

  barChart
    .selectAll("rect")
    .filter(function (b) {
      if (d.country == b.country) {
        return b;
      }
    })
    .style("fill", "blue");

  scatterPlot
    .selectAll("circle")
    .filter(function (b) {
      if (d.country == b.country) {
        return b;
      }
    })
    .style("fill", "blue");

  lineChart
    .selectAll("circle")
    .filter(function (b) {
      if (d.country == b.country) {
        return b;
      }
    })
    .style("fill", "blue");
}

function handleMouseLeave(event, d) {
  d3.select("div#barChart")
    .select("svg")
    .selectAll("rect")
    .style("fill", "steelblue");

  d3.select("div#scatterPlot")
    .select("svg")
    .selectAll("circle")
    .style("fill", "steelblue");

  d3.select("div#lineChart")
    .select("svg")
    .selectAll("circle")
    .style("fill", "steelblue");
}

function handleClick(event, d) {
  window.alert(d.country);
}

function calculateFill(dataItem, i) {
  var scale = d3
    .scaleLinear()
    .domain([1, d3.max(dataSet, (d) => d.budget)])
    .range([0, 1]);
  return d3.interpolateBlues(scale(dataItem.budget));
  // return "steelblue";
}

function calculateRadius(dataItem, i) {
  var scale = d3
    .scaleLinear()
    .domain([d3.min(dataSet, (d) => d.year), d3.max(dataSet, (d) => d.year)])
    .range([0, 10]);
  return scale(dataItem.year);
}
