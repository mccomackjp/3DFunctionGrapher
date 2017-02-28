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
        let xmax = parseFloat($scope.xmax);
        let ymax = parseFloat($scope.ymax);
        let incrimentX = (Math.abs(parseFloat($scope.xmin)) + Math.abs(parseFloat($scope.xmax))) * 0.01;
        let incrimentY = (Math.abs(parseFloat($scope.ymin)) + Math.abs(parseFloat($scope.ymax))) * 0.01;

        for (let x = parseFloat($scope.xmin); x <xmax; x += incrimentX){
            for (let y = parseFloat($scope.ymin); y < ymax; y += incrimentY){
                let scope = {x: x, y: y};
                xCoords.push(x);
                yCoords.push(y);
                let z = math.eval($scope.formula, scope);
                zCoords.push(z);
                colors.push(z);
            }
        }

        let data=[
            {
                type: 'scatter3d',
                x: xCoords,
                y: yCoords,
                z: zCoords,
                mode: 'markers',
                marker: {
                    size: 6,
                    //symbol: "circle-open",
                    // color: colors,
                    // colorscale: 'Viridis'
                },
                projection: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false
                    },
                    z: {
                        show: false
                    }
                },
            }
        ];
        Plotly.newPlot('graph', data);
    }
});