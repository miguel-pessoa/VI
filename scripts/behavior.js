var dataSet;

var radarCountries = [];
var countries = [];
var selectedCountries = [];
let colors = ["blue", "yellow", "red", "green", "gray"];

function init() {
  d3.csv("../data/final/happy.csv").then(
      data => {
        loadCountries(data);
        //selectContinents();
        createScatterPlot(countries);
      }
  )
  loadRadars(false)
}

function loadRadars(update) {
  d3.csv("../data/final/2020_report.csv").then(
      data => {
        loadRadar(data, 2020);
        //selectContinents();
        createRadarChart(radarCountries, update);
      }
  )
}

function loadRadar(data, year) {
  radarCountries = [];
  data.forEach(row => {
    if(selectedCountries.filter(country => country.country == row.country).length != 0) {
      radarCountries.push({
        "country": row.country,
        "Year": year,
        "GDP per capita": row['gdp_per_capita']- 0,
        "Social support": row['social_support']- 0,
        "Health": row['health']- 0,
        "Freedom": row['freedom']- 0,
        "Generosity": row['generosity']- 0,
        "Government trust": row['government_trust']- 0,
      })
    }
  });
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

        labels.append("div")
        .attr("class", "checkbox")
        .attr("id",  function(d) { return "input" + calculateId(d.country); })
        .attr("value", function(d) { return d.checked; })
        .on("click", function(d) {checkCountry(d.srcElement.id.replace("input", ""), false)});

        labels.append("span")
        .attr("class", "filterText")
        .attr("for", function(d) { return d; })
        .text(function(d) { return d.country; });
}

function checkCountry(country, graph) {
  console.log(country);
  var countryObj = countries.filter(a => calculateId(a.country) == country)[0];
  var id = "input" + country.replaceAll(" ", "");

  selectedCountries.forEach( d => {
        var dId = "input" + d.country.replaceAll(" ", "");
            colors.forEach(c =>
                document.getElementById(dId).classList.remove(c)
            )
      }
  );

  if(selectedCountries.indexOf(countryObj) == -1) {
    if(selectedCountries.length >= 5) {
      window.alert("Please pick up to 5 countries to be displayed at once.");
      return;
    }
    selectedCountries.push(countryObj);
  } else {
    selectedCountries = selectedCountries.filter(a => a != countryObj);
  }

  selectedCountries.forEach( d => {
        var dId = "input" + d.country.replaceAll(" ", "");
        document.getElementById(dId).classList.add(colors[selectedCountries.indexOf(d)]);
      }
  );

  dataChangeHappy(selectedCountries);
  loadRadars(true);
}


function createRadarChart(data, update) {
  width = 500;
  height = 460;
  margin = { top: 40, right: 20, bottom: 40, left: 40 };

  let features = ["GDP per capita", "Social support", "Health", "Freedom", "Generosity", "Government trust"];

  if (!update) {
    d3.select("div#radarChart").append("svg").attr("width", width)
        .attr("height", height);
  }

  let svg = d3.select("#radarChart").select("svg");

  let radialScale = d3.scaleLinear()
      .domain([0,1.75])
      .range([0,175]);
  let ticks = [0.3,0.6,0.9,1.2,1.5];
  function angleToCoordinate(angle, value){
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return {"x": width/2 + x, "y": height /2 - y};
  }

  if (!update) {
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





    for (var i = 0; i < features.length; i++) {
      let ft_name = features[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      let line_coordinate = angleToCoordinate(angle, 1.5);
      let label_coordinate = angleToCoordinate(angle, 1.9);

      //draw axis line
      svg.append("line")
          .attr("x1", width /2)
          .attr("y1", height /2)
          .attr("x2", line_coordinate.x)
          .attr("y2", line_coordinate.y)
          .attr("stroke","#aaa");

      //draw axis label
      svg.append("text")
          .attr("x", label_coordinate.x -30)
          .attr("y", label_coordinate.y)
          .text(ft_name).style("font-size", "12px");
    }
  }
  let line = d3.line()
      .x(d => d.x)
      .y(d => d.y);


  function getPathCoordinates(data_point){
    let coordinates = [];
    for (var i = 0; i < features.length; i++){
      let ft_name = features[i];
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
  }

  svg.selectAll("path").attr("opacity", "0%")


  data.sort((a,b) => {
    if(a["GDP per capita"] > b["GDP per capita"]) return -1;
    else return 1;
  });
  for (var i = 0; i < data.length; i ++){
    let d = data[i];
    let color = calculateFill(selectedCountries[selectedCountries.indexOf(selectedCountries.filter(country => country.country == d.country)[0])]);
    let coordinates = getPathCoordinates(d);

    //draw the path element
    svg.append("path")
        .datum(coordinates)
        .attr("d",line)
        .attr("stroke-width", 3)
        .attr("stroke", color)
        .attr("fill", color)
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.8 - 0.12 *i)
        .on("mouseover", handleRadarMouseOver)
        .append("title")
        .text(d.country +
              "\n  GDP per capita: " + d["GDP per capita"].toFixed(2) +
              "\n  Social support: " + d["Social support"].toFixed(2) +
              "\n  Health: " + d["Health"].toFixed(2) +
              "\n  Freedom: " + d["Freedom"].toFixed(2) +
              "\n  Generosity: " + d["Generosity"].toFixed(2)+
              "\n  Government trust: " + d["Government trust"].toFixed(2));
  }
}


function createScatterPlot(data, update) {
  width = 500;
  height = 425;
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

  if (!update) {
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Alcohol consumption per capita");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height - 5) + ")")
        .style("text-anchor", "middle")
        .text("Happiness Score");
  }

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
          .attr("id", (d) => calculateId(d.country))
          .attr("class", (d) => calculateId(d.country))
          .attr("cx", (d) => x(d.happiness_score_2020))
          .attr("cy", (d) => y(d.alcohol))
          .attr("r", (d) => calculateSize(d))
          .style("fill", (d) => calculateFill(d))
          .on("mouseover", handleMouseOver)
          .on("mouseleave", handleMouseLeave)
          .on("click", handleClick);
          //.transition()
          //.duration(1000)
          //.style("opacity", "100%");
      },
      (update) => {
        update
          .transition()
          .duration(1000)
          .attr("cx", (d) => x(d.happiness_score_2020))
          .attr("cy", (d) => {
            var temp = y(d.alcohol);
            return temp;
          })
          .attr("r", (d) => calculateSize(d))
          .style("fill", (d) => calculateFill(d));
      },
      (exit) => {
        exit.transition()
          .duration(1000)
          .style("opacity", 1);
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

// New Code

function dataChangeHappy(data) {
        //createRealBarChart(data, true);
        createScatterPlot(countries, true);
        //createLineChart(newData, true);
}



function handleRadarMouseOver(event, d) {
  radarChart = d3.select("div#radarChart").select("svg");

  radarChart
      .selectAll("path")
      .filter(function (b) {
        if (d.country == b.country) {
          return b;
        }
      });
}

function handleMouseOver(event, d) {
  scatterPlot = d3.select("div#scatterPlot").select("svg");
  lineChart = d3.select("div#lineChart").select("svg");

  scatterPlot
    .selectAll("circle")
    .filter(function (b) {
      if (d.country == b.country) {
        return b;
      }
    })
      .attr("opacity", 0.6)
      .append("title")
      .text(function(d) { return d.country + "\n Alcohol Consumption: " + d.alcohol + "\n Happiness score: " + d.happiness_score_2020.substring(0,4)});

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
    .selectAll("circle." + calculateId(d.country))
    .attr("opacity", "100%")
    .style("fill", calculateFill(d));



  d3.select("div#lineChart")
    .select("svg")
    .selectAll("circle")
    .style("fill", "steelblue");

}

function handleClick(event, d) {
  //window.alert(d.country);
  checkCountry(d.country, true);
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
    color = colors[selectedCountries.indexOf(dataItem)];
  return color;
}

function calculateId(country) {
  return country.replaceAll(" ","")
      .replaceAll(".", "")
      .replaceAll(",","")
      .replaceAll("'","");
}
