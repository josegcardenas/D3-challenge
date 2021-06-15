//Set up SVG size and margins
var SVGWidth = 1000;
var SVGHeight = 500;

var margin = {
  top: 25,
  bottom: 75,
  left: 100,
  right: 50
};

var width = SVGWidth - margin.left - margin.right;
var height = SVGHeight - margin.top - margin.bottom;

var SVG = d3
  .select("#scatter")
  .append("SVG")
  .attr("width", SVGWidth)
  .attr("height", SVGHeight);

var chartGroup = SVG.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var selectXAxis = "poverty";

//Update xscale when clicked
function xScale(povertydata, selectXAxis) {
  
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(povertydata, d => d[selectXAxis]) * 0.8,
      d3.max(povertydata, d => d[selectXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;

}

//update on click
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
function renderCircles(circles, newXScale, selectXAxis) {

  circles.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[selectXAxis]));

  return circles;
}

// adding tooltip
function updateToolTip(selectXAxis, circles) {
  var label;
  if (selectXAxis === "poverty") {
    label = "Poverty:";
  }
  else {
    label = "income";
  }

  if (chartGroup.id === "age") {
    label2 = "ID:";
  }
  else {
    label2 = "ID: ";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`<br>${label2}${d.id}<br>${label} ${d[selectXAxis]}`);
    });

  circles.call(toolTip);

  circles.on("mouseover", function(data) {
    toolTip.show(data);
  })
    //mouseout
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  return circles;
}

// Import CSV data
d3.csv("assets/data/data.csv").then(function(povertydata) {

  console.log(povertydata)

  // parse data
  povertydata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(povertydata, selectXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(povertydata, d => d.age) *.8, d3.max(povertydata, d => d.age)*1.1])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circles = chartGroup.selectAll("circle")
    .data(povertydata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[selectXAxis]))
    .attr("cy", d => yLinearScale(d.age))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".75")
    
  var circleLabels = chartGroup.selectAll(".stateText").data(povertydata).enter().append("text");

    circleLabels.transition()
      .duration(1000)
      .attr("x", function(d) {
        return xLinearScale(d[selectXAxis]);
      })
      .attr("y", function(d) {
        return yLinearScale(d.age);
      })
      .text(function(d) {
        return d.state;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "darkgray")
      .attr("class", "stateText");

  // New group for 2 x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("Poverty");

  var circlelable = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Income");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Age");

  // updateToolTip function above csv import
  var circles = updateToolTip(selectXAxis, circles);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== selectXAxis) {
        selectXAxis = value;
        
        xLinearScale = xScale(povertydata, selectXAxis);
        xAxis = renderAxes(xLinearScale, xAxis);

        // update circles with new x
        circles = renderCircles(circles, xLinearScale, selectXAxis);

        // update tooltips with new info
        circles = updateToolTip(selectXAxis, circles);

        var circleLabels = chartGroup.selectAll(".stateText");

        circleLabels.transition()  
          .duration(1000)
          .attr("x", function(d) {
            return xLinearScale(d[selectXAxis]);
          })
          .attr("y", function(d) {
            return yLinearScale(d.age);
          })
          .text(function(d) {
            return d.state;
          })
 
        // changes classes to change bold text
        if (selectXAxis === "income") {
          circlelable
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          circlelable
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
// }).catch(function(error) {
//   console.log(error);
});