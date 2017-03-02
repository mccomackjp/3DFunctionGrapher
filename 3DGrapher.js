/**
 * Graphs 3D functions.
 */

"use strict";
let app = angular.module("graphApp", ["ui.bootstrap"]);

window.onload = function () {
  angular.element(document.getElementById("container")).scope().graphFunction();
};

app.controller("graphAppController", function ($scope){

    $scope.graphFunction = function(){
        let xCoords = [];
        let yCoords = [];
        let zCoords = [];
        let colors = [];

        let context = parseContext($scope.formula1);
        buildPointsOnContext(xCoords, yCoords, zCoords, colors, $scope.formula1, context);
        let data=[buildTrace(xCoords, yCoords, zCoords, colors, "Viridis", $scope.formula1, context)];

        if ($scope.formula2 !== undefined) {
            xCoords = [];
            yCoords = [];
            zCoords = [];
            colors = [];
            context = parseContext($scope.formula2);
            buildPointsOnContext(xCoords, yCoords, zCoords, colors, $scope.formula2, context);
            data.push(buildTrace(xCoords, yCoords, zCoords, colors, "Greys", $scope.formula2, context));
        }
        Plotly.newPlot('graph', data);
    };

    let buildPointsOnContext = function(xCoords, yCoords, zCoords, colors, formula, context){
        if (context === "x"){
            buildPoints(xCoords, yCoords, zCoords, colors, formula, context, parseFloat($scope.zmax), parseFloat($scope.zmin),
                parseFloat($scope.ymax), parseFloat($scope.ymin), parseFloat($scope.xmax), parseFloat($scope.xmin),
                (Math.abs(parseFloat($scope.zmin)) + Math.abs(parseFloat($scope.zmax))) * 0.01,
                (Math.abs(parseFloat($scope.ymin)) + Math.abs(parseFloat($scope.ymax))) * 0.01);
        } else if (context === "y"){
            buildPoints(xCoords, yCoords, zCoords, colors, formula, context, parseFloat($scope.xmax), parseFloat($scope.xmin),
                parseFloat($scope.zmax), parseFloat($scope.zmin), parseFloat($scope.ymax), parseFloat($scope.ymin),
                (Math.abs(parseFloat($scope.xmin)) + Math.abs(parseFloat($scope.xmax))) * 0.01,
                (Math.abs(parseFloat($scope.zmin)) + Math.abs(parseFloat($scope.zmax))) * 0.01);
        } else {
            buildPoints(xCoords, yCoords, zCoords, colors, formula, context, parseFloat($scope.xmax), parseFloat($scope.xmin),
                parseFloat($scope.ymax), parseFloat($scope.ymin), parseFloat($scope.zmax), parseFloat($scope.zmin),
                (Math.abs(parseFloat($scope.xmin)) + Math.abs(parseFloat($scope.xmax))) * 0.01,
                (Math.abs(parseFloat($scope.ymin)) + Math.abs(parseFloat($scope.ymax))) * 0.01);
        }
    };

    let buildPoints = function(xCoords, yCoords, zCoords, colors, formula, context, xmax, xmin, ymax, ymin, zmax, zmin, incrimentX, incrimentY){
        for (let i = xmin; i <xmax; i += incrimentX){
            for (let j = ymin; j < ymax; j += incrimentY){
                let scope = buildScope(context, i, j);
                let z = math.eval(formula, scope);
                if (evalRange(z, zmin, zmax)){
                    xCoords.push(i);
                    yCoords.push(j);
                    zCoords.push(z);
                    colors.push(z);
                }
            }
        }
    };

    let parseContext = function(formula){
      formula = formula.replace(" ", "").toLowerCase();
      return (formula.length > 1 && (formula[0] === "x" || formula[0] === "y") && formula[1] === "=") ? formula[0] : "z";
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
        if (context === "x"){
            trace["x"] = zCoords;
            trace["y"] = yCoords;
            trace["z"] = xCoords;
        } else if (context === "y"){
            trace["x"] = xCoords;
            trace["y"] = zCoords;
            trace["z"] = yCoords;
        } else {
            trace["x"] = xCoords;
            trace["y"] = yCoords;
            trace["z"] = zCoords;
        }
        return trace;
    };

});