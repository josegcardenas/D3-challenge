//Create window parameters

var Width = parseInt(d3.select("#scatter").style("Width"));
var Height = Width - Width / 3.9;

// Margin
var margin = 25;
var labels = 110;

// padding for the text at the bottom and left axes
var bottompad = 30;
var leftpad = 30;

// Create the actual canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("Width", Width)
  .attr("Height", Height)
  .attr("class", "chart");

//Radius for all dots.
var circRadius;
function crGet() {
  if (Width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();

// bottom Axis
svg.append("g").attr("class", "xLabel");
var xLabel = d3.select(".xLabel");
//Pick a axes label to later change data displayed
function newXtext() {
  xLabel.attr(
    "transform",
    "translate(" +
      ((Width - labels) / 2 + labels) +
      ", " +
      (Height - margin - bottompad) +
      ")"
  );
}
newXtext();
//Pick 3 labels
//Poverty
xLabel
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
//Age
xLabel
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
//Income
xLabel
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

var leftY = (Height + labels) / 2 - labels;
var leftX = margin + leftpad;
//Working on the Y labels
svg.append("g").attr("class", "yLabel");

var yLabel = d3.select(".yLabel");

function yTextRefresh() {
  yLabel.attr(
    "transform",
    "translate(" + leftX + ", " + leftY + ")"
  );
}
yTextRefresh();

//Obesity
yLabel
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

//Smokes
yLabel
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

//Lacks Healthcare
yLabel
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

//Import csv file
d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});
function visualize(theData) {
  //place first values
  var firstx = "poverty";
  var firsty = "obesity";

  //set limits
  var x_min;
  var x_max;
  var y_min;
  var y_max;
  //set tooltip
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      var xvalue;
      var stateabbv = "<div>" + d.state + "</div>";
      var yvalue = "<div>" + firsty + ": " + d[firsty] + "%</div>";
      if (firstx === "poverty") {
        xvalue = "<div>" + firstx + ": " + d[firstx] + "%</div>";
      }
      else {
        xvalue = "<div>" +
          firstx +
          ": " +
          parseFloat(d[firstx]).toLocaleString("en") +
          "</div>";
      }
      // Display
      return stateabbv + xvalue + yvalue;
    });
  //call the tooltip  
  svg.call(toolTip);
  //x limits reset
  function xparams() {
    x_min = d3.min(theData, function(d) {return parseFloat(d[firstx]) * 0.90;});
    x_max = d3.max(theData, function(d) {return parseFloat(d[firstx]) * 1.10;});
  }
  //y limits reset
  function yparams() {
    y_min = d3.min(theData, function(d) {return parseFloat(d[firsty]) * 0.90;});
    y_max = d3.max(theData, function(d) {return parseFloat(d[firsty]) * 1.10;});
  }

  //change class and label when clicked(active/inactive)
  function labelChange(axis, clickedText) {
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);
    clickedText.classed("inactive", false).classed("active", true);//when clicked changes to active
  }
  //Plot with initial values has to come up
  xparams();
  yparams();

  var xaxis_scalelinear = d3
    .scaleLinear()
    .domain([x_min, x_max])
    .range([margin + labels, Width - margin]);
  var yaxis_scalelinear = d3
    .scaleLinear()
    .domain([y_min, y_max])
    .range([Height - margin - labels, margin]);
  var xAxis = d3.axisBottom(xaxis_scalelinear);
  var yAxis = d3.axisLeft(yaxis_scalelinear);

  //make markers
  function markers() {
    if (Width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  markers();

  //appending everything we have made
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (Height - margin - labels) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labels) + ", 0)");

  var circlesmade = svg.selectAll("g circlesmade").data(theData).enter();

  // We append the circles for each row of data (or each state, in this case).
  circlesmade
    .append("circle")
    .attr("cx", function(d) {
      return xaxis_scalelinear(d[firstx]);
    })
    .attr("cy", function(d) {
      return yaxis_scalelinear(d[firsty]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    //mouse hover with no click
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "#323232");
    })
    //take the toolkit off when mouse moves away
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    }
    );

    //Assign labels to the circles
  circlesmade
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return xaxis_scalelinear(d[firstx]);
    })
    .attr("dy", function(d) {
      return yaxis_scalelinear(d[firsty]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    //hover on dots and no hover
    .on("mouseover", function(d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  //User interaction to allow for changes on clicks
  d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);
   //selecting only the ones that are not being used
    if (self.classed("inactive")) {
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      if (axis === "x") {
        firstx = name;
//move the dots horizontally        
        xparams();

        xaxis_scalelinear.domain([x_min, x_max]);

        svg.select(".xAxis").transition().duration(500).call(xAxis);

        d3.selectAll("circle").each(function() {

          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xaxis_scalelinear(d[firstx]);
            })
            .duration(500);
        });

//names have to be changed as well
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xaxis_scalelinear(d[firstx]);
            })
            .duration(500);
        });
        labelChange(axis, self);
      }
      else {
        firsty = name;

//Move the dots vertically
        yparams();

        yaxis_scalelinear.domain([y_min, y_max]);

        svg.select(".yAxis").transition().duration(300).call(yAxis);
//circle's state name follow
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yaxis_scalelinear(d[firsty]);
            })
            .duration(500);
        });

        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yaxis_scalelinear(d[firsty]) + circRadius / 3;
            })
            .duration(500);
        });

        labelChange(axis, self);
      }
    }
  });

  d3.select(window).on("resize", resize);

  // One caveat: we need to specify what specific parts of the chart need size and position changes.
  function resize() {
    // Redefine the Width, Height and leftY (the three variables dependent on the Width of the window).
    Width = parseInt(d3.select("#scatter").style("Width"));
    Height = Width - Width / 3.9;
    leftY = (Height + labels) / 2 - labels;

    // Apply the Width and Height to the svg canvas.
    svg.attr("Width", Width).attr("Height", Height);

    // Change the xaxis_scalelinear and yaxis_scalelinear ranges
    xaxis_scalelinear.range([margin + labels, Width - margin]);
    yaxis_scalelinear.range([Height - margin - labels, margin]);

    // With the scales changes, update the axes (and the Height of the x-axis)
    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (Height - margin - labels) + ")");

    svg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    markers();

    // Update the labels.
    newXtext();
    yTextRefresh();

    // Update the radius of each dot.
    crGet();

    // With the axis changed, let's update the location and radius of the state circles.
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yaxis_scalelinear(d[firsty]);
      })
      .attr("cx", function(d) {
        return xaxis_scalelinear(d[firstx]);
      })
      .attr("r", function() {
        return circRadius;
      });

    // We need change the location and size of the state texts, too.
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yaxis_scalelinear(d[firsty]) + circRadius / 3;
      })
      .attr("dx", function(d) {
        return xaxis_scalelinear(d[firstx]);
      })
      .attr("r", circRadius / 3);
  }
}
