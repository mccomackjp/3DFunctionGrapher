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
        buildPoints(xCoords, yCoords, zCoords, colors, $scope.formula1);
        let data=[buildTrace(xCoords, yCoords, zCoords, colors, "Viridis", $scope.formula1)];
        if ($scope.formula2 !== undefined) {
            xCoords = [];
            yCoords = [];
            zCoords = [];
            colors = [];
            buildPoints(xCoords, yCoords, zCoords, colors, $scope.formula2);
            data.push(buildTrace(xCoords, yCoords, zCoords, colors, "Greys", $scope.formula2));
        }
        Plotly.newPlot('graph', data);
    };

    let buildPoints = function(xCoords, yCoords, zCoords, colors, formula){
        let xmax = parseFloat($scope.xmax);
        let ymax = parseFloat($scope.ymax);
        let incrimentX = (Math.abs(parseFloat($scope.xmin)) + Math.abs(parseFloat($scope.xmax))) * 0.01;
        let incrimentY = (Math.abs(parseFloat($scope.ymin)) + Math.abs(parseFloat($scope.ymax))) * 0.01;

        for (let x = parseFloat($scope.xmin); x <xmax; x += incrimentX){
            for (let y = parseFloat($scope.ymin); y < ymax; y += incrimentY){
                let scope = {x: x, y: y};
                let z = math.eval(formula, scope);
                if (evalRange(z, $scope.zmin, $scope.zmax)){
                    xCoords.push(x);
                    yCoords.push(y);
                    zCoords.push(z);
                    colors.push(z);
                }
            }
        }
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

    let buildTrace = function(xCoords, yCoords, zCoords, colors, colorScale, name){
        return {
            name: name,
            type: 'scatter3d',
            x: xCoords,
            y: yCoords,
            z: zCoords,
            mode: 'markers',
            marker: {
                size: 6,
                color: colors,
                colorscale: colorScale
            }
        }
    };

});