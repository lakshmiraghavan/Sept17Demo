/**
 * Created by lakshmi on 9/18/15.
 */

angular.module('myApp', []). controller('myStat', function($scope, $http,$parse){
    //$scope.test = "hello world"
    $scope.resumeObj = {};
    $scope.datalists = [];
    $scope.list = '';
    console.log($scope.list)
   // $scope.datalist = JSON.parse($scope.list);



   $scope.url = window.location.href;
    console.log($scope.url);
   var id = $scope.url.split('/')[4];
    console.log(id);

    $scope.showData = function( ) {
        $scope.curPage = 0;
        $scope.pageSize = 3;

        $http.get('/status/'+id).success(function(result){
            console.log('how r u', result);

            $scope.datalists = result;
        console.log("status datalists",$scope.datalists);
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
