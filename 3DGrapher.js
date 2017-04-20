/**
 * Graphs 3D functions.
 */

"use strict";


let app = angular.module("graphApp", ["ui.bootstrap"]);

window.onload = function () {
  angular.element(document.getElementById("container")).scope().graphAll();
};

app.controller("graphAppController", function ($scope){

    //todo move footer to bottom of page
    //todo add instructions
    //todo add error checking
    //todo add error message display
    //todo add intersection display
    //todo add bounded functions

    /**
     * Scalar used to adjust the distance between points on the graph.
     */
    let pointDistanceScalar = 0.01;

    /**
     * Boolean to track whether to display intersection or not.
     */
    let hideNonIntersect = false;

    //todo graph only intersecting functions. Try plotly.data element
    /**
     * Graphs the intersection between two functions. WIP
     */
    $scope.graphIntersection = function(){
        if ($scope.formula1 !== undefined && $scope.formula2 !== undefined) {
            hideNonIntersect = true;
            graphFunction();
        } else {
            handleError({message: "Please input two functions"});
        }
    };

    /**
     * Graphs all points of the given functions.
     */
    $scope.graphAll = function(){
        hideNonIntersect = false;
        graphFunction();
    };

    /**
     * Graphs the given functions from the user.
     */
    let graphFunction = function(){
        let xCoords = [];
        let yCoords = [];
        let zCoords = [];
        let colors = [];

        try {
            let context = parseContext($scope.formula1);
            buildPointsFromContext(xCoords, yCoords, zCoords, colors, $scope.formula1, context);
            let data = [buildTrace(xCoords, yCoords, zCoords, colors, "Viridis", $scope.formula1, context)];

            if ($scope.formula2 !== undefined) {
                xCoords = [];
                yCoords = [];
                zCoords = [];
                colors = [];
                context = parseContext($scope.formula2);
                buildPointsFromContext(xCoords, yCoords, zCoords, colors, $scope.formula2, context);
                data.push(buildTrace(xCoords, yCoords, zCoords, colors, "Earth", $scope.formula2, context));
            }
            Plotly.newPlot('graph', data);
            $scope.error = false;
        } catch (error){
            handleError(error);
        }
    };

    /**
     * Key listener, graphing the given functions if the user presses enter.
     * @param event that took place, graphs functions if the event is the enter key press.
     */
    $scope.keyPressed = function(event){
      if (event.keyCode === 13){
          $scope.graphAll();
      }
    };

    /**
     * Displays errors encountered to the user.
     */
    let handleError = function(error){
        $scope.reason = error.message;
        $scope.error = true;
    };

    /**
     * Builds points used in the graph based on the context of the formula (i.e. z= or x= or y=).
     * @param xCoords x coordinates of the points.
     * @param yCoords y coordinates of the points.
     * @param zCoords z coordinates of the points.
     * @param colors array of colors for the points.
     * @param formula to be calculated.
     * @param context the context of the formula (i.e. z= or x= or y=).
     */
    let buildPointsFromContext = function(xCoords, yCoords, zCoords, colors, formula, context){
        if (context === "x") {
            buildPoints(xCoords, yCoords, zCoords, colors, formula, context, parseFloat($scope.zmax), parseFloat($scope.zmin),
                parseFloat($scope.ymax), parseFloat($scope.ymin), parseFloat($scope.xmax), parseFloat($scope.xmin),
                (Math.abs(parseFloat($scope.zmin)) + Math.abs(parseFloat($scope.zmax))) * pointDistanceScalar,
                (Math.abs(parseFloat($scope.ymin)) + Math.abs(parseFloat($scope.ymax))) * pointDistanceScalar);
        } else if (context === "y") {
            buildPoints(xCoords, yCoords, zCoords, colors, formula, context, parseFloat($scope.xmax), parseFloat($scope.xmin),
                parseFloat($scope.zmax), parseFloat($scope.zmin), parseFloat($scope.ymax), parseFloat($scope.ymin),
                (Math.abs(parseFloat($scope.xmin)) + Math.abs(parseFloat($scope.xmax))) * pointDistanceScalar,
                (Math.abs(parseFloat($scope.zmin)) + Math.abs(parseFloat($scope.zmax))) * pointDistanceScalar);
        } else {
            buildPoints(xCoords, yCoords, zCoords, colors, formula, context, parseFloat($scope.xmax), parseFloat($scope.xmin),
                parseFloat($scope.ymax), parseFloat($scope.ymin), parseFloat($scope.zmax), parseFloat($scope.zmin),
                (Math.abs(parseFloat($scope.xmin)) + Math.abs(parseFloat($scope.xmax))) * pointDistanceScalar,
                (Math.abs(parseFloat($scope.ymin)) + Math.abs(parseFloat($scope.ymax))) * pointDistanceScalar);
        }
    };

    /**
     * Builds the arrays of points to be graphed.
     * @param xCoords x coordinates of the points.
     * @param yCoords y coordinates of the points.
     * @param zCoords z coordinates of the points.
     * @param colors array of colors for the points.
     * @param formula to be calculated.
     * @param context the context of the formula (i.e. z= or x= or y=).
     * @param xmax max value of the x plane.
     * @param xmin min value of x plane.
     * @param ymax max value of the y plane.
     * @param ymin min value of the y plane.
     * @param zmax max value of the z plane.
     * @param zmin min value of the z plane.
     * @param incrementX the amount each x plane point will be incremented by.
     * @param incrementY the amount each y plane point will be incremented by.
     */
    let buildPoints = function(xCoords, yCoords, zCoords, colors, formula, context, xmax, xmin, ymax, ymin, zmax, zmin, incrementX, incrementY){
        for (let i = xmin; i <xmax; i += incrementX){
            for (let j = ymin; j < ymax; j += incrementY){
                let scope = buildScope(context, i, j);
                let k = math.eval(formula, scope);
                if (evalRange(k, zmin, zmax) && isValidPoint(i, j, k, formula)){
                    xCoords.push(i);
                    yCoords.push(j);
                    zCoords.push(k);
                    colors.push(k);
                }
            }
        }
    };

    /**
     * Checks if a point is valid point to be displayed within the bounded areas.
     * @param i x plane coordinate.
     * @param j y plane coordinate.
     * @param k z plane coordinate.
     * @param formula to be calculated.
     * @returns {boolean} true if the point is valid, else false if lies outside the bounded areas.
     */
    let isValidPoint = function(i, j, k, formula){
      let result = true;
      if (hideNonIntersect){
          formula = getOtherFormula(formula);
          result = evaluatePointWithContext(i, j, k, formula)
      }
      return result;
    };

    //todo add aditional parameters for intersection hiding
    /**
     * Evaluates if a point should be displaced from given context. WIP.
     * @param i
     * @param j
     * @param k
     * @param formula
     * @returns {boolean}
     */
    let evaluatePointWithContext = function(i, j, k, formula){
      let context = parseContext(formula);
      let result = false;
      switch (context) {
          case 'x' : result = i >= math.eval(formula, buildScope(context, k, j));
            break;
          case 'y' : result = j >= math.eval(formula, buildScope(context, i, k));
            break;
          case 'z' : result = k >= math.eval(formula, buildScope(context, i, j));
      }
      return result;
    };

    /**
     * Builds a scope object used by mathjs for calculating a point from a formula.
     * @param context the context of the formula (i.e. z= or x= or y=).
     * @param i x plane coordinate.
     * @param j y plane coordinate.
     * @returns {{x: *, y: *}} mathjs scope object.
     */
    let buildScope = function (context, i, j){
        let scope = {x: i, y: j};
        switch (context) {
            case 'x' : scope = {z: i, y: j};
                break;
            case 'y' : scope = {x: i, z: j};
        }
        return scope;
    };

    /**
     * Gets the other formula not currently being evaluated.
     * @param formula the current formula being evaluated.
     * @returns the formula not currently being evaluated.
     */
    let getOtherFormula = function(formula){
        return (formula === $scope.formula1) ? $scope.formula2 : $scope.formula1;
    };

    /**
     * Parses the context of the formula.
     * @param formula given by user.
     * @returns {string} context of the formula (i.e. z= or x= or y=).
     */
    let parseContext = function(formula){
      if (formula !== undefined) {
          formula = formula.replace(" ", "").toLowerCase();
          return (formula.length > 1 && (formula[0] === "x" || formula[0] === "y") && formula[1] === "=") ? formula[0] : "z";
      } else {
          throwException("Please input a valid function");
      }
    };

    /**
     * Throws an exception object with the given message.
     * @param message of the exception.
     */
    let throwException = function(message){
      throw {message: message};
    };

    /**
     * Evaluates if the given number falls within the the given min and max range.
     * @param num to be evaluated.
     * @param min minimum range of the number.
     * @param max maximum range of the number.
     * @returns {boolean} true if the number falls within range, and is a number. Otherwise false.
     */
    let evalRange = function(num, min, max){
        let result = true;
        if (!isNaN(min) && !isNaN(max)){
            result = num >= min && num <= max;
        } else if (!isNaN(min)){
            result = num >= min;
        } else if (!isNaN(max)){
            result = num <= max;
        }
        return result;
    };

    /**
     * Builds a trace object used by plotly.js
     * @param xCoords x coordinate of the trace.
     * @param yCoords y coordinate of the trace.
     * @param zCoords z coordinate of the trace.
     * @param colors array of given colors of the trace.
     * @param colorScale string name of the color scale used by plotly.js
     * @param name of the trace.
     * @param context of the formula (i.e. z= or x= or y=).
     */
    let buildTrace = function(xCoords, yCoords, zCoords, colors, colorScale, name, context){
        let trace = {
            name: name,
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                size: 6,
                color: colors,
                colorscale: colorScale
            }
        };
        return addTraceCoordinates(trace, xCoords, yCoords, zCoords, context);
    };

    /**
     * Adds a specified point to the given trace object.
     * @param trace object to add the point.
     * @param xCoords x plane coordinate.
     * @param yCoords y plane coordinate.
     * @param zCoords z plane coordinate.
     * @param context of the formula (i.e. z= or x= or y=).
     * @returns {*} plotly.js trace object.
     */
    let addTraceCoordinates = function(trace, xCoords, yCoords, zCoords, context){
        trace["x"] = xCoords;
        trace["y"] = yCoords;
        trace["z"] = zCoords;
        if (context === "x"){
            trace["x"] = zCoords;
            trace["z"] = xCoords;
        } else if (context === "y"){
            trace["y"] = zCoords;
            trace["z"] = yCoords;
        }
        return trace;
    };

});