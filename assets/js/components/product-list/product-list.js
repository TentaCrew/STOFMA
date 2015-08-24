angular.module('stofmaApp.components')
    .directive('productList', ['ProductService', function (ProductService) {
      return {
        restrict: 'A',
        scope: {
          categories: "=",
          products: "=",
          usage: "@"
        },
        controller: ['$scope', function ($scope) {
          $scope.sum = 0.0;
          $scope.isSellable = false;
          $scope.isSellingMode = false;
          $scope.isListingMode = false;
          $scope.isSelectingMode = false;
          $scope.tabSelected = 0;

          $scope.categories = [
            {
              id: 'DRINK',
              name: 'Boissons'
            },
            {
              id: 'FOOD',
              name: 'Nourritures'
            },
            {
              id: 'OTHER',
              name: 'Autres'
            }
          ];

          $scope.selectProduct = function (id, c) {
            angular.forEach($scope.products, function (v, k) {
              if (v.id == id) {
                if (c == 0){
                  if($scope.isSelectingMode){
                    $scope.products.splice(k, 1);
                  } else {
                    $scope.products[k].selected = 0;
                  }
                }
                else
                  $scope.products[k].selected = v.selected + c > 0 ? (v.selected + c > v.quantity ? v.quantity : v.selected += c) : 0;
              }
            });
          };

          $scope.cancel = function () {
            $scope.$parent.refreshProduct();
          };

          $scope.$watch("usage", function (nv, ov) {
            $scope.isSellingMode = nv == 'selling';
            $scope.isListingMode = nv == 'listing';
            $scope.isSelectingMode = nv == 'selecting';
          });

          $scope.$watch("products", function (nv, ov) {
            var sum = 0;

            angular.forEach($scope.products, function (v, k) {
              if (v.selected > 0) {
                sum += v.selected * v.price;
              }
            });
            $scope.sum = sum;
            $scope.isSellable = sum > 0;

            if($scope.isSelectingMode && angular.isArray(nv) && angular.isArray(ov) && nv.length != ov.length){
              var categoryToGo;
              if(nv.length > ov.length){
                // Adding a product
                console.log(nv, ov);
                categoryToGo = nv.filter(function(i) {return ov.map(function(e) { return e.id; }).indexOf(i.id) < 0;})[0].category;
              } else {
                // Removing a product
                categoryToGo = ov.filter(function(i) {return nv.map(function(e) { return e.id; }).indexOf(i.id) < 0;})[0].category;
              }
              for(var i = 0; i < $scope.categories.length; i++){
                if($scope.categories[i].id == categoryToGo)
                {
                  $scope.tabSelected = i;
                  break;
                }
              }

            }
          }, true);

          $scope.check = function ($event) {
            if ($scope.isSellable) {
              $scope.$parent.confirmSelling($event);
            }
          }
        }],
        link: function (scope, element, attrs) {
        },
        templateUrl: '/js/components/product-list/product-list.html'
      };
    }]);

