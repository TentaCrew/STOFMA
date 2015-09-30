'use strict';

angular.module('stofmaApp.controllers')
    .controller('AddProductCtrl', ['$scope', '$state', 'ProductService', 'SweetAlert', function ($scope, $state, ProductService, SweetAlert) {
      $scope.setIconToolbarButtons([{
        name: 'Annuler',
        icon: 'clear',
        callback: function () {
          $state.go('^');
          $scope.setIconToolbarButtons([{
            name: 'Ajouter un produit',
            icon: 'add',
            callback: function () {
              $state.go('manager.products.add');
            }
          }], true);
        }
      }], true);

      $scope.addProduct = function () {
        var form = $scope.createProduct,
            category = form.category.$modelValue,
            name = form.name.$modelValue,
            shortName = form.shortname.$modelValue,
            price = parseFloat(form.unitPrice.$modelValue),
            memberPrice = parseFloat(form.unitPriceMember.$modelValue),
            minimum = parseInt(form.minimum.$modelValue),
            urlImage = form.urlImage.$modelValue,
            forSale = form.forSale.$modelValue;

        if (!forSale) {
          var quantity = form.quantity.$modelValue;
        }

        if (isNaN(price) || price < 0)
          form.unitPrice.$setValidity('notaprice', false);
        else
          form.unitPrice.$setValidity('notaprice', true);

        if (isNaN(minimum) || minimum < 0)
          form.minimum.$setValidity('notanumber', false);
        else
          form.minimum.$setValidity('notanumber', true);

        if (form.$valid) {
          var data = {
            category: category,
            name: name,
            shortName: shortName,
            price: ''+price,
            memberPrice: ''+memberPrice,
            minimum: minimum,
            urlImage: urlImage,
            forSale: forSale
          };

          if(!forSale){
            data.quantity = quantity;
          }

          ProductService.createProduct(data).then(function (newProduct) {
            if(newProduct.forSale)
              $scope.products.push(newProduct);
            else
              $scope.productsStock.push(newProduct);

            $state.go('^');
            $scope.setFabButton('add', function () {
              $state.go('manager.products.add');
            });
          }).catch(function (err) {
            SweetAlert.swal({
              title: 'L\'ajout du produit n\'a pas réussi.',
              text: 'Merci de vérifier tous les champs.',
              type: 'error'
            });
          });
        }
      }
    }]);
