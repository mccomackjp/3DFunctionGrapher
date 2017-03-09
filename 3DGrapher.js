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

    let pointDistanceScalar = 0.01;

    let hideNonIntersect = false;

    //todo graph only intersecting functions. Troubleshoot
    $scope.graphIntersection = function(){
        if ($scope.formula1 !== undefined && $scope.formula2 !== undefined) {
            hideNonIntersect = true;
            graphFunction();
        } else {
            handleError({message: "Please input two functions"});
        }
    };

    $scope.graphAll = function(){
        hideNonIntersect = false;
        graphFunction();
    };

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

    $scope.keyPressed = function(event){
      if (event.keyCode === 13){
          $scope.graphAll();
      }
    };

    let handleError = function(error){
        $scope.reason = error.message;
        $scope.error = true;
    };

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

    let buildPoints = function(xCoords, yCoords, zCoords, colors, formula, context, xmax, xmin, ymax, ymin, zmax, zmin, incrimentX, incrimentY){
        for (let i = xmin; i <xmax; i += incrimentX){
            for (let j = ymin; j < ymax; j += incrimentY){
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

    let isValidPoint = function(i, j, k, formula){
      let result = true;
      if (hideNonIntersect){
          formula = getOtherFormula(formula);
          result = evaluatePointWithContext(i, j, k, formula)
      }
      return result;
    };

    //todo add aditional parameters for intersection hiding
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



    let buildScope = function (context, i, j){
        let scope = {x: i, y: j};
        switch (context) {
            case 'x' : scope = {z: i, y: j};
                break;
            case 'y' : scope = {x: i, z: j};
        }
        return scope;
    };

    let getOtherFormula = function(formula){
        return (formula === $scope.formula1) ? $scope.formula2 : $scope.formula1;
    };

    let parseContext = function(formula){
      if (formula !== undefined) {
          formula = formula.replace(" ", "").toLowerCase();
          return (formula.length > 1 && (formula[0] === "x" || formula[0] === "y") && formula[1] === "=") ? formula[0] : "z";
      } else {
          throwException("Please input a valid function");
      }
    };

    let throwException = function(message){
      throw {message: message};
    };

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