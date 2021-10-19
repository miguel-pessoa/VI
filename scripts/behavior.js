var dataSet;

var radarCountries = [];
var countries = [];
var selectedCountries = [];
function init() {

  d3.csv("../data/final/happy.csv").then(
      data => {
        loadCountries(data);
        //selectContinents();
        createScatterPlot(countries);
      }
  )

  d3.csv("../data/final/2020_report.csv").then(
      data => {
        loadRadar(data, 2020);
        //selectContinents();
        createRadarChart(radarCountries);
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


function loadRadar(data, year) {
  data.forEach(row => {

    radarCountries.push({
      "GDP per capita": row['gdp_per_capita']- 0 ,
      "Social support": row['social_support']- 0 ,
      "Health": row['health']- 0 ,
      "Freedom": row['freedom']- 0 ,
      "Generosity": row['generosity']- 0 ,
      "Government trust": row['government_trust']- 0 ,
    })
  });
  console.log(radarCountries)
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
        .text(function(d) { return d.country; });
}

function checkCountry(country) {
  var countryObj = countries.filter(a => a.country == country)[0];

  selectedCountries.indexOf(countryObj) == -1? selectedCountries.push(countryObj) : selectedCountries = selectedCountries.filter(a => a != countryObj);
  dataChangeHappy(selectedCountries);
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

function createRadarChart(data, update) {
  width = 600;
  height = 400;
  margin = { top: 40, right: 20, bottom: 40, left: 40 };

  let features = ["GDP per capita", "Social support", "Health", "Freedom", "Generosity", "Government trust"];

  let svg = d3.select("#radarChart").append("svg")
      .attr("width", width)
      .attr("height", height);

  let radialScale = d3.scaleLinear()
      .domain([0,2])
      .range([0,175]);
  let ticks = [0.4,0.8,1.2,1.6,2];

  ticks.forEach(t =>
      svg.append("circle")
          .attr("cx", width /2)
          .attr("cy", height /2)
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("r", radialScale(t))
  );

  ticks.forEach(t =>
      svg.append("text")
          .attr("x", width /2 + 5)
          .attr("y", height/2 - radialScale(t) - 2)
          .text(t.toString())
  );

  function angleToCoordinate(angle, value){
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": width/2 + x, "y": height /2 - y};
  }

  for (var i = 0; i < features.length; i++) {
    let ft_name = features[i];
    let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
    let line_coordinate = angleToCoordinate(angle, 2);
    let label_coordinate = angleToCoordinate(angle, 2.2);

    //draw axis line
    svg.append("line")
        .attr("x1", width /2)
        .attr("y1", height /2)
        .attr("x2", line_coordinate.x)
        .attr("y2", line_coordinate.y)
        .attr("stroke","#aaa");

    //draw axis label
    svg.append("text")
        .attr("x", label_coordinate.x)
        .attr("y", label_coordinate.y)
        .text(ft_name);
  }

  let line = d3.line()
      .x(d => d.x)
      .y(d => d.y);
  let colors = ["steelblue", "blue", "yellow"];

  function getPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 0; i < features.length; i++){
      let ft_name = features[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
  }

  for (var i = 0; i < data.length; i ++){
    let d = data[i];
    let color = colors[i];
    let coordinates = getPathCoordinates(d);

    //draw the path element
    svg.append("path")
        .datum(coordinates)
        .attr("d",line)
        .attr("stroke-width", 3)
        .attr("stroke", color)
        .attr("fill", color)
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5);
  }
}


function createScatterPlot(data, update) {
  width = 500;
  height = 400;
  margin = { top: 20, right: 20, bottom: 40, left: 40 };


  var x = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.happiness_score_2020) * 1.2])
      .range([margin.left, width - margin.right]);

  var y = d3
    .scaleLinear()
    .domain([20, 0])
    .range([margin.top, height - margin.bottom]);

  xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((x) => x )
          .ticks(10)
      )
      .call((g) => g.select(".domain").remove())
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', 100)
      .text("X");

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

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Alcohol consumption per capita");

  svg.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height -5 ) + ")")
      .style("text-anchor", "middle")
      .text("Happiness Score");

  svg
    .select("g.circles")
    .selectAll("circle")
    .data(data, function (d) {
      return d;
    })
    .join(
      (enter) => {
        return enter
          .append("circle")
          .attr("class", (d) => d.country.split(' ')[0])
          .attr("cx", (d) => x(d.happiness_score_2020))
          .attr("cy", (d) => y(d.alcohol))
          .attr("r", (d) => calculateSize(d))
          .style("fill", (d) => calculateFill(d))
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
          .attr("cx", (d) => x(d.happiness_score_2020))
          .attr("cy", (d) => {
            var temp = y(d.alcohol);
            console.log(temp);
            return temp;
          })
          .attr("r", (d) => calculateSize(d))
          .style("fill", (d) => calculateFill(d));
      },
      (exit) => {
        exit.transition()
          .duration(1000)
          .style("opacity", "0%");
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
        //createRealBarChart(data, true);
        createScatterPlot(countries, true);
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
      .style("fill", "#5e99c5")
      .append("title")
      .text(function(d) { return d.country; });

  lineChart
    .selectAll("circle")
    .filter(function (b) {
      if (d.country == b.country) {
        return b;
      }
    })
    .style("fill", "#5e99c5");
}

function handleMouseLeave(event, d) {
  d3.select("div#barChart")
    .select("svg")
    .selectAll("rect")
    .style("fill", "steelblue");

  d3.select("div#scatterPlot")
    .select("svg")
    .selectAll("circle." + d.country.split(' ')[0])
    .style("fill", calculateFill(d));

  d3.select("div#lineChart")
    .select("svg")
    .selectAll("circle")
    .style("fill", "steelblue");
}

function handleClick(event, d) {
  //window.alert(d.country);
  checkCountry(d.country);
}

function calculateSize(dataItem) {
  var size = "6";
  if(selectedCountries.indexOf(dataItem) != -1)
    size = "15";
  return size;
}

function calculateFill(dataItem, i) {
  var color = "#aaa";
  if(selectedCountries.indexOf(dataItem) != -1)
    color = "steelblue";
  return color;
}

