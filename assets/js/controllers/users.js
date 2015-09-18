'use strict';

angular.module('stofmaApp.controllers')
    .controller('UserCtrl', ['$q', '$scope', 'usersData', '$state', 'UserFactory', 'UserService', 'ProductService', 'SaleService', 'SweetAlert', '$mdBottomSheet', '$mdToast', function ($q, $scope, usersData, $state, UserFactory, UserService, ProductService, SaleService, SweetAlert, $mdBottomSheet, $mdToast) {

      $scope.users = UserFactory.onlyRealUsers(usersData);

      function goProfileEditor(id) {
        $state.go('manager.profile', {
          id: id
        });
      }

      $scope.setIconToolbarButtons('Ajouter un utilisateur', 'add_user', function () {
        $state.go('manager.registeruser');
      });

      $scope.setSearchIcon(true, 'Recherche d\'un utilisateur',
          function (search) {
            if (search === null || search === '') {
              $scope.searchUser = '';
            } else {
              $scope.searchUser = search;
            }
          });

      $scope.action = function (id) {
        var index;
        
        for(var i = 0; i < $scope.users.length; i++) {
          if($scope.users[i].id == id){
            index = i;
            break;
          }
        }
        
        $scope.getCurrentUser().then(function (u) {
              if (u.isManager(true)) {
                UserService.get(id, true).then(function (user) {
                      $mdBottomSheet.show({
                        templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-action-user.html',
                        controller: 'BottomSheetConfirmCtrl',
                        locals: {
                          data: {
                            user: user,
                            manager: u
                          }
                        }
                      }).then(function (response) {
                        switch (response.confirm) {
                          case 'edit':
                            goProfileEditor(id);
                            break;
                          case 'setMemberFree':
                          case 'setMemberSell':
                            var defer = $q.defer();
                            var free = response.confirm == 'setMemberFree';

                            if (free) {
                              defer.resolve();
                            } else {
                              var products = [];
                              ProductService.getProductByShortName('CARTE').then(function (card) {
                                if (!card) {
                                  defer.reject('Aucun produit "Carte de membre" n\'existe.');
                                  return;
                                }
                                card.selected = 1;
                                products = [card];

                                $mdBottomSheet.show({
                                  templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-confirm-selling.html',
                                  controller: 'BottomSheetConfirmSellCtrl',
                                  locals: {
                                    productsToSell: products,
                                    sum: card.price,
                                    paymentMode: 'IN_CASH',
                                    guest: false
                                  }
                                }).then(function (response) {
                                  if (products.length) {
                                    var customerId = user.id,
                                        customerName = user.getName();

                                    SaleService.doSale(customerId, products, response.paymentMode).then(function (newSale) {
                                      defer.resolve();
                                    }).catch(function (status) {
                                      if (status == 406) {
                                        SweetAlert.swal({
                                          title: 'La vente de la carte n\'a pas réussi.',
                                          text: 'Merci de recréditer le solde de ' + customerName + '.',
                                          type: 'error'
                                        });
                                      }
                                    })
                                  }
                                });
                              });
                            }

                            defer.promise.then(function () {
                              UserService.setMember(user.id, !user.isMember).then(function (user) {
                                SweetAlert.swal({
                                  title: user.getName() + ' est désormais ' + (user.isMember ? '' : 'non-') + 'membre.',
                                  type: 'success'
                                });
                                $scope.users[index] = user;
                              });
                            }).catch(function (err) {
                              SweetAlert.swal({
                                title: err,
                                text: 'Merci de créer le produit avec le nom court \'CARTE\'.',
                                type: 'error'
                              });
                            });
                            break;
                          case 'delete':
                            $mdBottomSheet.show({
                              templateUrl: 'assets/js/components/bottom-sheet/bottom-sheet-confirm-remove-user.html',
                              controller: 'BottomSheetConfirmCtrl',
                              locals: {
                                data: {
                                  title: user.isActive ? 'Désactiver cet utilisateur' : 'Ré-activer cet utilisateur'
                                }
                              }
                            }).then(function (response) {
                              if (response.confirm) {
                                UserService.disable(id, user.isActive).then(function (u) {
                                  $scope.users[index].isActive = u.isActive;
                                  $mdToast.show(
                                      $mdToast.simple()
                                          .content('L\'utilisateur a été ' + (!u.isActive ? 'désactivé' : 'ré-activé') + '.')
                                          .position("bottom right")
                                          .hideDelay(3000)
                                  ).catch(function () {
                                        $mdToast.show(
                                            $mdToast.simple()
                                                .content('L\'utilisateur n\'a pas été ' + (!u.isActive ? 'désactivé' : 'ré-activé') + '.')
                                                .position("bottom right")
                                                .hideDelay(5000)
                                        );
                                      });
                                });
                              }
                            });
                            break;
                        }
                      });
                    }
                )
                ;
              }
            }
        )
        ;
      }
    }])
;
