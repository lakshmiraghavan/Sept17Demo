/**
 * Created by lakshmi on 9/9/15.
 */
angular.module('myApp', []). controller('myCtrl', function($scope, $http){
   //$scope.test = "hello world"
   $scope.resumeObj = {};
    $scope.datalists = [];
    $scope.getResumeInfo = function(){

        $http.get('/getResumes').success(function(result){
          $scope.resumeObj = result;
            return $scope.resumeObj;
        })

    }

    $scope.showData = function( ) {
        $scope.curPage = 0;
        $scope.pageSize = 2;

        $http.get('/getResumes').success(function(result){

            $scope.datalists = result;
            console.log("===>",$scope.datalists);
            $scope.numberOfPages = function() {
                return Math.ceil($scope.datalists.length / $scope.pageSize);
            };
            console.log($scope.numberOfPages());

        })



      }
  //  $scope.showData();
    })


angular.module('myApp').filter('paginate', function()
{
    return function(input, start)
    {
        start = +start;
        return input.slice(start);
    };
});