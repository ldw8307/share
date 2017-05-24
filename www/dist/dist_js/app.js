// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('maybi', ['ionic', 'ionic.service.core','ngCordova',
        'angularMoment', 'templates', 'ionic-native-transitions',
        'ion-BottomSheet', 'ion-affix', 'ion-photo',  'ion-geo',
        'maybi.controllers', 'maybi.services', 'maybi.directives', 'maybi.photogram',
        'maybi.constants', 'maybi.filters', 'tag-select'])

.run(['$ionicPlatform', '$rootScope', '$state', 'JPush', '$ionicHistory', '$ionicModal', '$ionicLoading', '$cordovaToast', 'amMoment', 'AuthService', 'ngCart', 'Storage', 'FetchData', function($ionicPlatform, $rootScope, $state, JPush,
            $ionicHistory, $ionicModal, $ionicLoading, $cordovaToast,
            amMoment, AuthService, ngCart, Storage, FetchData) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        Wechat.isInstalled(function (installed) {
            $rootScope.IsWechatInstalled = installed;
        }, function (reason) {
            $rootScope.IsWechatInstalled = false;
        });
        YCQQ.checkClientInstalled(function(){
            $rootScope.IsQQInstalled = true;
        },function(){
            $rootScope.IsQQInstalled = false;
        });

        plugins.jPushPlugin.init();
        plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
        //plugins.jPushPlugin.setDebugMode(ENV.debug);
        document.addEventListener("jpush.openNotification", JPush.onOpenNotification, false);
        document.addEventListener("jpush.receiveNotification", JPush.onReceiveNotification, false);
        document.addEventListener("jpush.receiveMessage", JPush.onReceiveMessage, false);

    });

    // set moment locale
    amMoment.changeLocale('zh-cn');

    // ngCart
    $rootScope.$on('ngCart:change', function(event, msg){
        ngCart.$save();
        if (window.cordova) {
            $cordovaToast.show(msg, 'short', 'center');
        } else {
            $ionicLoading.show({
              template: msg,
              duration: 1000,
            });
        }
    });

    $rootScope.$state = $state;


    if (angular.isObject(Storage.get('cart'))) {
        ngCart.$restore(Storage.get('cart'));
    } else {
        ngCart.init();
        FetchData.get('/api/cart').then(function(data) {
            ngCart.$loadCart(data.cart);
        });
    }

    $ionicModal.fromTemplateUrl('auth.html', {
        scope: $rootScope
    }).then(function(modal) {
        $rootScope.authDialog = modal;
    });

    $rootScope.showAuthBox = function() {
        $rootScope.authDialog.show();
    };

    $rootScope.closeAuthBox= function() {
        $rootScope.authDialog.hide();
    };

    $rootScope.$on('$stateChangeStart', function (event, next) {

        if (AuthService.isLoggedIn() === false) {
            var token = Storage.get('access_token');
            if (token) {
                AuthService.authenticate(token)
                    .then(function() {

                    }).catch(function() {
                        Storage.remove('access_token');
                    })
            } else if (next.loginRequired) {
                $rootScope.authDialog.show();
            }
        }
    });

    $rootScope.$on('alertStart', function(event, msg, options) {
        var o = options || {};
        angular.extend(o, {
            template: msg || '<ion-spinner icon="spiral"></ion-spinner>',
        });

        $ionicLoading.show(o);

    });
    $rootScope.$on('alertEnd', function(event) {
        $ionicLoading.hide()
    });

    $rootScope.$on('alert', function(event, msg, options) {
        if (window.cordova) {
            $cordovaToast.show(msg, 'short', 'center');
        } else {
            var o = options || {};
            angular.extend(o, {
                template: msg || '<ion-spinner icon="spiral"></ion-spinner>',
                duration: 1000,
            });

            $ionicLoading.show(o);
        }
    });

    if(Storage.get('introPage') !== 'alreadyShow'){
        $state.go('intro');
    }
}])

.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$ionicNativeTransitionsProvider', function($httpProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider,
            $ionicNativeTransitionsProvider){

  //$ionicConfigProvider.scrolling.jsScrolling(false);
  $ionicConfigProvider.views.maxCache(5);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '',
    abstract: true,
    templateUrl: 'tabs.html',
    controller: 'tabsCtrl',
  })

  // Each tab has its own nav history stack:
  .state('intro', {
      url: '/intro',
      templateUrl: 'intro.html',
      controller: 'introCtrl'
    })

  .state('tab.home', {
    url: '/home',
    nativeTransitions: null,
    views: {
      'tab-home': {
        controller: 'homeCtrl',
        templateUrl: 'home.html',
      }
    },
    loginRequired: true,
  })

  .state('tab.cateHome', {
    url: '/cateHome',
    nativeTransitions: null,
    views: {
      'tab-home': {
        controller: 'cateHomeCtrl',
        templateUrl: 'cateHome.html',
      }
    },
    loginRequired: true,
  })

  .state('tab.noti', {
    url: '/notification',
    nativeTransitions: null,
    views: {
      'tab-noti': {
        controller: 'notificationCtrl',
        templateUrl: 'notification.html',
      }
    },
    loginRequired: true,
  })


  .state('logout', {
    url: "/logout",
    controller: 'logoutCtrl',
  })

  .state('tab.explore', {
      url: '/explore',
      nativeTransitions: null,
      views: {
        'tab-explore': {
          templateUrl: 'photogram/home.html',
          controller: 'exploreCtrl'
        }
      },
      loginRequired: true,
    })

  .state('tab.postDetail', {
      url: '/postDetail/:postID',
      views: {
        'tab-explore': {
          templateUrl: 'photogram/postDetail.html',
          controller: 'postDetailCtrl'
        }
      }
    })

  .state('tab.userDetail', {
      url: '/userDetail/:userID',
      views: {
          'tab-explore': {
              templateUrl: 'userDetail.html',
              controller: 'userDetailCtrl'
          }
      }
  })
  .state('tab.accountUserDetail', {
      url: '/userDetail/:userID',
      views: {
          'tab-account': {
              templateUrl: 'userDetail.html',
              controller: 'userDetailCtrl'
          }
      }
  })

  .state('tab.userList', {
      url: '/userList/:userID/:userType',
      views: {
          'tab-explore': {
              templateUrl: 'userList.html',
              controller: 'userListCtrl'
          }
      }
  })

  .state('tab.myuserList', {
      url: '/myuserList/:userID/:userType',
      views: {
          'tab-account': {
              templateUrl: 'userList.html',
              controller: 'userListCtrl'
          }
      }
  })

  .state('tab.account', {
      url: '/account',
      nativeTransitions: null,
      views: {
        'tab-account@tab': {
          templateUrl: 'account.html',
          controller: 'accountCtrl'
        }
      }
    })

  .state('tab.coupons', {
      url: '/coupons',
      views: {
        'tab-account@tab': {
          templateUrl: 'coupons.html',
          controller: 'couponsCtrl'
        }
      }
    })

  .state('tab.settings', {
      url: '/settings',
      views: {
        'tab-account@tab': {
          templateUrl: 'settings.html',
          controller: 'settingsCtrl'
        }
      }
    })

  .state('tab.profile', {
      url: '/account/profile',
      views: {
        'tab-account': {
          templateUrl: 'profile.html',
          controller: 'profileCtrl'
        }
      }
    })


  .state('tab.about', {
      url: '/about',
      views: {
        'tab-account@tab': {
          templateUrl: 'about.html',
          controller: 'aboutCtrl'
        }
      }
    })


  .state('tab.cart', {
      url: '/cart',
      nativeTransitions: null,
      views: {
        'tab-home': {
          templateUrl: 'cart.html',
          controller: 'cartCtrl'
        }
      }
    })

  .state('tab.checkout', {
      url: '/checkout',
      views: {
        'tab-home': {
          templateUrl: 'checkout.html',
          controller: 'checkoutCtrl'
        }
      }
    })

  .state('tab.categories', {
      url: '/categories',
      views: {
        'tab-home': {
          templateUrl: 'category.html',
          controller: 'categoryCtrl'
        }
      }
    })

  .state('tab.category', {
      url: '/category/:en/:cn',
      views: {
        'tab-home': {
          templateUrl: 'item/items.html',
          controller: 'itemsCtrl'
        }
      }
    })

  .state('tab.search', {
      url: '/search/:query',
      views: {
        'tab-home': {
          templateUrl: 'item/items.html',
          controller: 'itemsCtrl'
        }
      }
    })

  .state('tab.payment.success', {
      url: '/payment/success',
      views: {
        'tab-home': {
          controller: 'paymentSuccessCtrl'
        }
      }
    })

  .state('tab.payment.cancel', {
      url: '/payment/cancel',
      views: {
        'tab-home': {
          controller: 'paymentCancelCtrl'
        }
      }
    })

  .state('tab.item', {
      url: '/item/:itemID',
      views: {
        'tab-home': {
          templateUrl: 'item.html',
          controller: 'itemCtrl',
        }
      }
    })

  .state('tab.board', {
      url: '/board/:boardID',
      views: {
        'tab-home': {
          templateUrl: 'board.html',
          controller: 'boardCtrl'
        }
      }
    })

  .state('tab.address', {
      url: '/address',
      cache: false,
      views: {
        'tab-home': {
          templateUrl: 'address.html',
          controller: 'addressCtrl'
        }
      }
    })

  .state('tab.address_list', {
      url: '/address/list',
      cache: false,
      views: {
        'tab-account': {
          templateUrl: 'address_list.html',
          controller: 'addressCtrl'
        }
      }
    })

  .state('tab.orders', {
      url: '/orders',
      views: {
        'tab-account': {
          templateUrl: 'orders.html',
          controller: 'ordersCtrl'
        }
      }
    })

  .state('tab.order_detail', {
      url: '/order/:order_id',
      views: {
        'tab-account': {
          templateUrl: 'order.html',
          controller: 'orderDetailCtrl'
        }
      }
    })

  .state('tab.order_logistic', {
      url: '/order/logistics/:order_id',
      views: {
        'tab-account': {
          templateUrl: 'logistics.html',
          controller: 'logisticsDetailCtrl'
        }
      }
    })

  .state('tab.order_transfer', {
      url: '/order/transfer/:order_id',
      views: {
        'tab-account': {
          templateUrl: 'transfer_logistics.html',
          controller: 'logisticsDetailCtrl'
        }
      }
    })

  .state('tab.express', {
      url: '/express',
      views: {
        'tab-home': {
          templateUrl: 'expressForm.html',
          controller: 'expressCtrl'
        }
      }
    })

  .state('tab.express_add', {
      url: '/express/add',
      views: {
          'tab-home': {
              templateUrl: 'expressItem_add.html',
              controller: 'expressItemAddCtrl'
          }
      }
  })

  .state('tab.order_entry', {
      url: '/order/entry/:itemID',
      views: {
        'tab-account': {
          templateUrl: 'item.html',
          controller: 'itemCtrl',
        }
      }
    })


  .state('tab.calculate', {
      url: '/calculate',
      views: {
        'tab-home': {
          templateUrl: 'calFee.html',
          controller: 'calculateCtrl'
        }
      }
    })

  .state('tab.favors', {
      url: '/favors',
      views: {
        'tab-account': {
          templateUrl: 'favors.html',
          controller: 'favorCtrl'
        }
      }
    })

  .state('tab.like_posts', {
      url: '/like_posts',
      views: {
        'tab-account': {
          templateUrl: 'photogram/like_posts.html',
          controller: 'likePostsCtrl'
        }
      }
    })

  .state('tab.myPostDetail', {
      url: '/myPostDetail/:postID',
      views: {
        'tab-account': {
          templateUrl: 'photogram/postDetail.html',
          controller: 'postDetailCtrl'
        }
      }
    })

  .state('tab.my_posts', {
      url: '/my_posts',
      views: {
        'tab-account': {
          templateUrl: 'photogram/my_posts.html',
          controller: 'myPostsCtrl'
        }
      }
    })

  .state('tab.faq', {
      url: '/faq',
      views: {
        'tab-account': {
          templateUrl: 'faq.html',
          controller: 'faqCtrl'
        }
      }
    })

  .state('tab.limit', {
      url: '/limit',
      views: {
        'tab-home': {
          templateUrl: 'limit.html',
          controller: 'faqCtrl'
        }
      }
    })

  .state('tab.cs', {
      url: '/customer-service',
      views: {
        'tab-account': {
          templateUrl: 'cs.html',
          controller: 'csCtrl'
        }
      }
    })

  .state('tab.feedback', {
      url: '/feedback',
      views: {
        'tab-account': {
          templateUrl: 'feedback.html',
          controller: 'feedbackCtrl'
        }
      }
    })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/explore');
  $httpProvider.interceptors.push('timeoutHttpIntercept');

  AWS.config.update({
      accessKeyId: 'AKIAI4JD55P3DQLOXQKQ',
      secretAccessKey: '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'
  });
  AWS.config.region = 'us-west-1';

}]);

'use strict';

homeCtrl.$inject = ['$scope', '$rootScope', '$log', '$timeout', '$state', '$ionicModal', 'ngCart', '$ionicSlideBoxDelegate', 'Board', 'Items', 'FetchData', 'Categories'];
cateHomeCtrl.$inject = ['$scope', '$rootScope', '$log', '$timeout', '$state', '$ionicModal', '$ionicScrollDelegate', 'ngCart', 'Items', 'FetchData', 'Categories'];
introCtrl.$inject = ['$rootScope', '$scope', '$state', 'FetchData', '$ionicSlideBoxDelegate', 'Storage'];
exploreCtrl.$inject = ['$scope', '$rootScope', '$state', '$ionicModal', '$ionicPopover', 'Photogram', 'FetchData'];
notificationCtrl.$inject = ['$rootScope', '$scope', '$state', 'Notification'];
myPostsCtrl.$inject = ['$scope', '$rootScope', '$state', '$ionicModal', '$ionicPopover', 'AuthService', 'Photogram'];
likePostsCtrl.$inject = ['$scope', '$rootScope', '$state', '$ionicModal', '$ionicPopover', 'AuthService', 'Photogram'];
postDetailCtrl.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'Photogram', 'AuthService', '$ionicPopup', 'photoShare'];
userDetailCtrl.$inject = ['$scope', '$rootScope', '$state', 'FetchData', '$stateParams', 'AuthService', 'Photogram', 'User', '$ionicScrollDelegate'];
userListCtrl.$inject = ['$scope', '$rootScope', '$state', 'FetchData', '$stateParams', 'AuthService', 'User'];
tabsCtrl.$inject = ['$scope', '$rootScope', '$state', '$ionicModal', '$cordovaToast', 'Photogram', 'PhotoService', '$timeout', 'geoService', 'FetchData'];
feedbackCtrl.$inject = ['$scope', 'FetchData', '$rootScope'];
csCtrl.$inject = ['$rootScope', '$scope'];
faqCtrl.$inject = ['$rootScope', '$scope'];
couponsCtrl.$inject = ['$rootScope', '$scope', 'AuthService'];
categoryCtrl.$inject = ['$rootScope', '$scope', 'FetchData', '$state'];
authCtrl.$inject = ['$rootScope', '$scope', 'FetchData', '$state', 'AuthService', '$ionicModal', '$cordovaFacebook'];
signupCtrl.$inject = ['$rootScope', '$scope', 'AuthService'];
accountCtrl.$inject = ['$rootScope', '$scope', 'AuthService', 'User', 'Photogram', '$ionicScrollDelegate'];
profileCtrl.$inject = ['$scope', 'AuthService', '$state', '$rootScope', 'PhotoService', '$http', 'ENV', '$ionicPopup'];
bindEmailCtrl.$inject = ['$rootScope', '$scope', 'AuthService'];
forgotPWCtrl.$inject = ['$rootScope', '$scope', 'AuthService'];
settingsCtrl.$inject = ['$rootScope', '$scope', '$state', 'AuthService'];
paymentSuccessCtrl.$inject = ['$location', '$timeout'];
itemCtrl.$inject = ['$scope', '$rootScope', '$stateParams', 'FetchData', '$ionicModal', '$ionicSlideBoxDelegate', 'sheetShare', '$cordovaSocialSharing'];
itemsCtrl.$inject = ['$rootScope', '$scope', 'Items', '$state', '$stateParams'];
boardCtrl.$inject = ['$scope', '$rootScope', '$stateParams', 'FetchData', '$state'];
favorCtrl.$inject = ['$rootScope', '$scope', 'FetchData', '$state'];
ordersCtrl.$inject = ['$rootScope', '$scope', 'FetchData', 'ngCart'];
calculateCtrl.$inject = ['$rootScope', '$scope', '$location', 'FetchData'];
expressCtrl.$inject = ['$rootScope', '$scope', 'FetchData', 'ngCart', 'AuthService', '$state', 'expressList'];
expressItemAddCtrl.$inject = ['$rootScope', '$scope', 'expressList'];
orderDetailCtrl.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'FetchData', 'ngCart', '$ionicPopup'];
logisticsDetailCtrl.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'FetchData', 'ngCart'];
cartCtrl.$inject = ['FetchData', '$rootScope', '$scope', 'ngCart'];
checkoutCtrl.$inject = ['$state', '$scope', '$rootScope', 'FetchData', 'ngCart'];
addressCtrl.$inject = ['$rootScope', '$state', '$scope', 'FetchData', 'ngCart'];
aboutCtrl.$inject = ['$rootScope', '$scope', '$state', 'appUpdateService'];
var controllersModule = angular.module('maybi.controllers', [])

function tabsCtrl($scope, $rootScope, $state, $ionicModal, $cordovaToast,
        Photogram, PhotoService, $timeout, geoService, FetchData) {

    $scope.form = {
        title: '',
        location: '',
        primary_image: '',
        photos: [],
        tags: [],
        type: '',
        geo: null,
    };

    geoService.getLocation().then(function(location){
        var lat = location.coords.latitude;
        var lng = location.coords.longitude;
        $scope.form.geo = [lng,lat];
    });


    $rootScope.togglePhotoModal = function() {

        PhotoService.open({
            pieces: 1,
            allowFilter: true
        }).then(function(image) {
            PhotoService.filter(image, function (form) {
                $scope.form.primary_image = form.photo;
                $scope.form.tags = form.tags;
                $scope.form.type = form.type;
                $scope.modalPost.show();
            });
        }).catch(function(){
            console.warn('Deu erro');
        });
    };
    $scope.editImage = function(){
        $scope.togglePhotoModal();
    }
    $scope.editAdditionImage = function(index){
        angular.forEach($scope.form.photos, function (p, i) {
            if  (i == index) {
                $scope.form.photos.splice(i, 1);
            }
        });

    }

    $scope.increasePhotosModal = function() {
        PhotoService.open({
            pieces: 4-$scope.form.photos.length,
            allowFilter: false
        }).then(function(images) {
            Array.prototype.push.apply($scope.form.photos, images);

        }).catch(function(){
            console.warn('Deu erro');
        });
    };

    $scope.getLocation = function() {
        $timeout(function() {
            angular.element(document.getElementById('ion-geo')).triggerHandler('click');
        });
    };

    $scope.setOption = function(tag){
        // add or remove tag
        if (!getTagByName(tag)) {
            if ($scope.form.tags.length < 3){
                $scope.form.tags.push(tag);
            } else {
                $cordovaToast.show('最多只能添加3个标签哦', 'short', 'center')
            }
        } else {
            removeTagByName(tag);
        }
    }

    var getTagByName = function(tag){
        var found = null;
        angular.forEach($scope.form.tags, function (t) {
            if  (t === tag) {
                found = tag ;
            }
        });
        return found;
    }

    var removeTagByName = function(tag){
        angular.forEach($scope.form.tags, function (t, index) {
            if  (t == tag) {
                $scope.form.tags.splice(index, 1);
            }
        });
    }

    $scope.excludeTags = function(text) {
        var wordsToFilter = $scope.form.tags;
        for (var i = 0; i < wordsToFilter.length; i++) {
            if (text.indexOf(wordsToFilter[i]) !== -1) {
                return false;
            }
        }
        return true;
    };

    $ionicModal.fromTemplateUrl('photogram/postModal.html', {
        scope: $scope,
        focusFirstInput: true
    }).then(function (modal) {
        $scope.modalPost = modal;
    });

    $scope.togglePostModal = function() {
        $scope.modalPost.show();
    }

    $scope.closePost = function() {
        $scope.modalPost.hide();

    };

    $scope.submitPost = function(resp) {
        var form = angular.copy(resp);
        $rootScope.$broadcast('alertStart');
        Photogram
            .post(form)
            .then(function () {
                $scope.closePost();
                $rootScope.$broadcast('alertEnd');
            }).catch(function(error){
                $rootScope.$broadcast('alertEnd');
                $rootScope.$broadcast('alert',error||'发送失败，请重试');
            });
    };
}

function postDetailCtrl($scope, $rootScope, $state, $stateParams, Photogram,
        AuthService, $ionicPopup, photoShare) {
    //商品详情
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    Photogram.getDetail($stateParams.postID).then(function(data) {
        $scope.post = data.post;
        var images = [$scope.post.primary_image];
        angular.forEach($scope.post.images, function (img, i) {
            images.push(img);
        });
        $scope.images = images;
    });


    $scope.comment = function(){
        var user = AuthService.getUser();
        Photogram.addComment($scope.post.post_id, $scope.message)
            .then(function(data) {
                $scope.post.num_comments += 1;
                $scope.post.comments.push(data.comment);
                $scope.message = '';
            });
    };

    $scope.deleteComment = function(comment) {
        if (comment.user.name == AuthService.getUser().name){
            var confirmPopup = $ionicPopup.confirm({
                title: '提示',
                cssClass: 'text-center',
                template: '确定删除该评论吗？',
                cancelText: '取消',
                okText: '删除',
                okType: 'button-default'
            })
            confirmPopup.then(function(res) {
                if (res){
                    Photogram.deleteComment(comment.id, $scope.post.post_id)
                        .then(function(data){
                            angular.forEach($scope.post.comments, function(c, index){
                                if(c.id == comment.id){
                                    $scope.post.comments.splice(index, 1);
                                }
                            });
                        })
                        $scope.post.num_comments -= 1;
                } else{
                    console.log('You are not sure');
                }
            });
        }
    };

    $scope.like = function(){
        var user = AuthService.getUser();

        if ($scope.post.is_liked){
            $scope.post.is_liked = false;
            $scope.post.num_likes -= 1;

            Photogram.unlike($scope.post.post_id)
                .then(function(data){
                    angular.forEach($scope.post.likes, function(l, index){
                        if(l.user.name == user.name){
                            $scope.post.likes.splice(index, 1);
                        }
                    });
                }).catch(function(error){
                    $scope.post.is_liked = true;
                    $scope.post.num_likes += 1;
                });
        } else {
            $scope.post.is_liked= true;
            $scope.post.num_likes += 1;

            Photogram.like($scope.post.post_id)
                .then(function(data){
                    $scope.post.likes.unshift(data.like);
                }).catch(function(error){
                    $scope.post.is_liked= false;
                    $scope.post.num_likes -= 1;

                });
        }
    };


    $scope.goUser = function(user_id){
        for(var name in $state.current.views) {
            var name = name;
        }

        if (name=="tab-explore"){
            $state.go('tab.userDetail', {userID: user_id});
        } else {
            $state.go('tab.accountUserDetail', {userID: user_id});
        }
    };

    $scope.zoom = function(url) {

        if (ionic.Platform.isAndroid()) {
            PhotoViewer.show(url, ''); //cordova photoviewer
        } else {
            ImageViewer.show(url);    // cordova ImageViewer for IOS
        }
    };

    $scope.actions = function(){
        photoShare.popup($scope.post);
    };


}

function userDetailCtrl($scope, $rootScope, $state, FetchData, $stateParams, AuthService,
        Photogram, User, $ionicScrollDelegate){
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    FetchData.get('/api/users/user_info/'+ $stateParams.userID).then(function(data) {
        $scope.user = data.user;
    });

    $scope.onUserDetailContentScroll = onUserDetailContentScroll;

    function onUserDetailContentScroll(){
        var scrollDelegate = $ionicScrollDelegate.$getByHandle('userDetailContent');
        var scrollView = scrollDelegate.getScrollView();
        $scope.$broadcast('userDetailContent.scroll', scrollView);
    }

    $scope.gridStyle = 'list';
    $scope.switchListStyle = function(style){
        $scope.gridStyle = style;
    }

    $scope.currentUserID = AuthService.getUser().id;

    $scope.follow = function(){
        var user = AuthService.getUser();

        if ($scope.user.is_following){
            $scope.user.is_following= false;
            $scope.user.num_followers -= 1;

            User.unfollow($scope.user.id)
                .then(function(data){
                    $scope.$emit('alert', "已取消关注");
                }).catch(function(error){
                    $scope.user.is_following= true;
                    $scope.user.num_followers += 1;
                });
        } else {
            $scope.user.is_following = true;
            $scope.user.num_followers += 1;

            User.follow($scope.user.id)
                .then(function(data){
                    $scope.$emit('alert', "关注成功");
                }).catch(function(error){
                    $scope.user.is_following = false;
                    $scope.user.num_followers -= 1;

                });
        }
    };

    $scope.zoom = function(img) {
        if (ionic.Platform.isAndroid()) {
            PhotoViewer.show(img, ''); //cordova photoviewer
        } else {
            ImageViewer.show(img);    // cordova ImageViewer for IOS
        }
    };
    $scope.posts = [];

    var userId = $stateParams.userID;
    var page = 0;

    Photogram.getUserPosts(userId, page).then(function(data){
        $scope.posts = data.posts;
        page++;
    });

    $scope.doRefresh = function() {
        page = 0;
        Photogram.getUserPosts(userId, page).then(function(data){
            $scope.posts = data.posts;
            page++;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Photogram.getUserPosts(userId, page).then(function(data){
            $scope.posts = $scope.posts.concat(data.posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            page++;
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Photogram.hasNextPage();
    };

    $scope.isEmpty = function() {
        return Photogram.isEmpty();
    };

}

function userListCtrl($scope, $rootScope, $state, FetchData, $stateParams,
        AuthService, User){

    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.currentUserID = AuthService.getUser().id;

    $scope.follow = function(user){
        var user = AuthService.getUser();

        if (user.is_following){
            user.is_following= false;

            User.unfollow(user.id)
                .then(function(data){
                    $scope.$emit('alert', "已取消关注");
                }).catch(function(error){
                    user.is_following= true;
                });
        } else {
            user.is_following = true;

            User.follow(user.id)
                .then(function(data){
                    $scope.$emit('alert', "关注成功");
                }).catch(function(error){
                    user.is_following = false;

                });
        }
    };
    $scope.users = [];

    var userId = $stateParams.userID;
    var page = 0;

    if ($stateParams.userType == 'followers'){

        $scope.title = '粉丝列表'
        User.getFollowers(userId, page).then(function(data){
            $scope.users = data.users;
            page++;
        });

        $scope.doRefresh = function() {
            page = 0;
            User.getFollowers(userId, page).then(function(data){
                $scope.users = data.users;
                page++;
            });
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.loadMore = function() {
            User.getFollowers(userId, page).then(function(data){
                $scope.users = $scope.users.concat(data.users);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                page++;
            });
        };

        $scope.moreDataCanBeLoaded = function() {
            return User.hasNextPage();
        };

        $scope.isEmpty = function() {
            return User.isEmpty();
        };

    } else if ($stateParams.userType == 'followings') {

        $scope.title = '关注列表'
        User.getFollowings(userId, page).then(function(data){
            $scope.users = data.users;
            page++;
        });

        $scope.doRefresh = function() {
            page = 0;
            User.getFollowings(userId, page).then(function(data){
                $scope.users = data.users;
                page++;
            });
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.loadMore = function() {
            User.getFollowings(userId, page).then(function(data){
                $scope.users = $scope.users.concat(data.users);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                page++;
            });
        };

        $scope.moreDataCanBeLoaded = function() {
            return User.hasNextPage();
        };

        $scope.isEmpty = function() {
            return User.isEmpty();
        };

    } else {

        $scope.title = '点赞用户'
        User.getPostLikeUsers(userId, page).then(function(data){
            $scope.users = data.users;
            page++;
        });

        $scope.doRefresh = function() {
            page = 0;
            User.getPostLikeUsers(userId, page).then(function(data){
                $scope.users = data.users;
                page++;
            });
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.loadMore = function() {
            User.getPostLikeUsers(userId, page).then(function(data){
                $scope.users = $scope.users.concat(data.users);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                page++;
            });
        };

        $scope.moreDataCanBeLoaded = function() {
            return User.hasNextPage();
        };

        $scope.isEmpty = function() {
            return User.isEmpty();
        };

    }


}

function cateHomeCtrl($scope, $rootScope, $log, $timeout, $state,
        $ionicModal, $ionicScrollDelegate, ngCart,
        Items, FetchData, Categories) {

    //登陆
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = '';
    });

    FetchData.get('/api/banners').then(function(data) {
        $scope.banners = data.banners;
    });
    $scope.Categories = Categories;

    $scope.ngCart = ngCart;

    $scope.redirectTo = function(banner) {
        if (banner.type == 'BOARD') {
            $state.go('tab.board', {'boardID': banner.target})
        } else {
            window.open(banner.target, '_blank', 'location=no,toolbarposition=top,closebuttoncaption=关闭,keyboardDisplayRequiresUserAction=no')
        }
    };

    $scope.goItem = function(item_id) {
        $state.go('tab.item', {itemID: item_id});
    };

    $scope.slideHasChanged = function(index){
        var nextTab = GetCate(index);
        $scope.changeTab(nextTab, index);
    }

    $scope.currentIndex = 0;
    $scope.items = [];
    $scope.currentTab = '';

    $scope.changeTab = function(tab, index) {
        $scope.items = [];
        $scope.currentTab = tab;
        $scope.currentIndex = index;
        Items.setCurrentTab(tab);
        Items.fetchTopItems().then(function(data){
            $scope.items = data.items;
        });
        if (!index) {
            index = GetCateIndex($scope.currentTab);
        }
        setPosition(index);
    };

    $scope.searchItem = function(query) {
        $state.go('tab.search', {'query':query});
    }

    /**
    $scope.swipe = function (direction) {
        var index = GetCateIndex($scope.currentTab);
        if (direction == 'left') {
            var nextTab = GetCate(index+1);
            if (nextTab == null) return;
            $scope.changeTab(nextTab, index+1);
        } else {
            var lastTab = GetCate(index-1);
            if (lastTab == null) return;
            $scope.changeTab(lastTab, index-1);

        }
    };
    **/

    function setPosition(index){
        var iconsDiv = angular.element(document.querySelectorAll("#category-scroll"));
        var icons = iconsDiv.find("a");
        var scrollDiv = iconsDiv[0].querySelector(".scroll") ; //div.scroll
        var wrap = iconsDiv[0].querySelector(".cate-scroll-row");     //div.cate-scroll-row
        var totalTabs = icons.length;

        var middle = iconsDiv[0].offsetWidth/2;
        var curEl = angular.element(icons[index]);
        if(curEl && curEl.length){
            var curElWidth = curEl[0].offsetWidth, curElLeft = curEl[0].offsetLeft;
            var leftStr = (middle  - (curElLeft) -  curElWidth/2 + 5);
            //If tabs are reaching right end or left end
            if(leftStr > 0){
                leftStr = 0;
            }
            //Use this scrollTo, so when scrolling tab manually will not flicker
            $ionicScrollDelegate.$getByHandle('cateScroll').scrollTo(Math.abs(leftStr), 0, true);
        }
    }

    function GetCateIndex(k) {
        var i = 0, key;
        for (key in Categories) {
            if (k == key) {
                return i;
            }
            i++;
        }
        return null;
    }

    function GetCate(index) {
        var i = 0, key;
        for (key in Categories) {
            if (i == index) {
                return key;
            }
            i++;
        }
        return null;
    }

    Items.fetchTopItems().then(function(data){
        $scope.items = data.items;
    });

    $scope.doRefresh = function() {
        Items.fetchTopItems().then(function(data){
            $scope.items = data.items;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Items.increaseNewItems().then(function(data){
            $scope.items = $scope.items.concat(data.items);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Items.hasNextPage();
    };

    $scope.isEmpty = function() {
        return Items.isEmpty();
    };

}
function homeCtrl($scope, $rootScope, $log, $timeout, $state,
        $ionicModal, ngCart, $ionicSlideBoxDelegate, Board,
        Items, FetchData, Categories) {
    //登陆
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = '';
    });

    FetchData.get('/api/banners').then(function(data) {
        $scope.banners = data.banners;
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').loop(true);
    });

    $scope.ngCart = ngCart;

    $scope.redirectTo = function(banner) {
        if (banner.type == 'BOARD') {
            $state.go('tab.board', {'boardID': banner.target})
        } else {
            window.open(banner.target, '_blank', 'location=no,toolbarposition=top,closebuttoncaption=关闭,keyboardDisplayRequiresUserAction=no')
        }
    };

    $scope.goBoard = function (board_id) {
        $state.go('tab.board', {'boardID': board_id})
    }

    $scope.searchItem = function(query) {
        $state.go('tab.search', {'query':query});
    }

    $scope.boards= [];
    var page = 0;

    Board.getBoards(page).then(function(data){
        $scope.boards = data.boards;
        page++;
    });

    $scope.doRefresh = function() {
        page = 0;
        Board.getBoards(page).then(function(data){
            $scope.boards = data.boards;
            page++;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Board.getBoards(page).then(function(data){
            $scope.boards = $scope.boards.concat(data.boards);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            page++;
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Board.hasNextPage();
    };
    $scope.isEmpty = function() {
        return Board.isEmpty();
    }

}


function exploreCtrl($scope, $rootScope, $state, $ionicModal,
        $ionicPopover,
        Photogram, FetchData) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = '';
    });

    $scope.posts = [];
    $scope.currentTab = '';

    $ionicPopover.fromTemplateUrl('photogram/popover.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };

    $scope.changeTab = function(tab) {
        $scope.currentTab = tab;
        $scope.popover.hide();
        Photogram.setCurrentTab(tab);
        Photogram.fetchTopPosts().then(function(data){
            $scope.posts = data.posts;
        });
    };

    Photogram.fetchTopPosts().then(function(data){
        $scope.posts = data.posts;
    });

    $scope.doRefresh = function() {
        Photogram.fetchTopPosts().then(function(data){
            $scope.posts = data.posts;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Photogram.increaseNewPosts().then(function(data){
            $scope.posts = $scope.posts.concat(data.posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Photogram.hasNextPage();
    };

    $scope.isEmpty = function() {
        return Photogram.isEmpty();
    };
}

function myPostsCtrl($scope, $rootScope, $state, $ionicModal,
        $ionicPopover, AuthService,
        Photogram) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.posts = [];

    var userId = AuthService.getUser().id;
    var page = 0;

    Photogram.getUserPosts(userId, page).then(function(data){
        $scope.posts = data.posts;
        page++;
    });

    $scope.doRefresh = function() {
        page = 0;
        Photogram.getUserPosts(userId, page).then(function(data){
            $scope.posts = data.posts;
            page++;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Photogram.getUserPosts(userId, page).then(function(data){
            $scope.posts = $scope.posts.concat(data.posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            page++;
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Photogram.hasNextPage();
    };

    $scope.isEmpty = function() {
        return Photogram.isEmpty();
    };
}

function likePostsCtrl($scope, $rootScope, $state, $ionicModal,
        $ionicPopover, AuthService, Photogram) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.posts = [];

    var userId = AuthService.getUser().id;
    var page = 0;

    Photogram.getUserLikes(userId, page).then(function(data){
        $scope.posts = data.posts;
        page++;
    });

    $scope.doRefresh = function() {
        page = 0;
        Photogram.getUserLikes(userId, page).then(function(data){
            $scope.posts = data.posts;
            page++;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Photogram.getUserLikes(userId, page).then(function(data){
            $scope.posts = $scope.posts.concat(data.posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            page++;
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Photogram.hasNextPage();
    };

    $scope.isEmpty = function() {
        return Photogram.isEmpty();
    };

}

function authCtrl($rootScope, $scope, FetchData, $state,
        AuthService, $ionicModal, $cordovaFacebook) {


    $scope.login = function () {
        $scope.error = false;
        $scope.disabled = true;

        AuthService.login($scope.email, $scope.password)
            .then(function() {
                $rootScope.authDialog.hide()
                $scope.$emit('alert', "登陆成功");
            }).catch(function () {
                $scope.$emit('alert', "Invalid username and/or password");
                $scope.disabled = false;
            })
    };

    $scope.oauthLogin = function(platform) {

        function authLogin(platform, resp){
            AuthService.oauth(platform, resp).
                then(function(data){
                    if (data.login == false){
                        $rootScope.user_id = data.user_id;

                        $ionicModal.fromTemplateUrl('bindEmail.html', {
                            scope: $scope,
                            focusFirstInput: true,
                        }).then(function(modal) {
                            $scope.bindEmailDialog = modal;
                            $scope.bindEmailDialog.show();
                        });
                    } else {
                        $rootScope.authDialog.hide();
                        $scope.$emit('alert', "登陆成功");
                    }
                })
        }

        function failCallback(reason){
            $scope.$emit('alert', "Failed: " + reason);
        }

        if (platform == 'wechat_app') {
            var scope = "snsapi_userinfo";
            window.Wechat.auth(scope, function (response) {
                authLogin(platform, response)
            }, failCallback);
        } else if (platform == 'weibo_app') {
            window.YCWeibo.ssoLogin(function(args){
                authLogin(platform, args)
            }, failCallback);
        } else if (platform == 'qq_app') {
            var checkClientIsInstalled = 1;//default is 0,only for iOS
            window.YCQQ.ssoLogin(function(args){
                authLogin(platform, args)
            }, failCallback, checkClientIsInstalled);
        } else if (platform == 'facebook_app') {
            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(response) {
                    if (response.authResponse) {
                        authLogin(platform, response.authResponse)
                    }
                }, function (error) {
                    $scope.$emit('alert', JSON.stringify(error));
                });
        }

    };

    //注册页面

    $scope.showSignupBox = function() {
        $ionicModal.fromTemplateUrl('signup.html', {
            scope: $scope,
            focusFirstInput: true,
        }).then(function(modal) {
            $scope.signupDialog= modal;
            $scope.signupDialog.show();
        });
    };

    $scope.closeSignupBox= function() {
        $scope.signupDialog.hide();
        $scope.signupDialog.remove();
    };

    $scope.$on('signupModal:hide', function (event) {
        $scope.signupDialog.hide();
        $scope.signupDialog.remove();
    })


    //绑定email页面

    $scope.closeBindEmailBox= function() {
        $scope.$emit('alert', "需绑定邮箱才能登陆");
        $scope.bindEmailDialog.hide();
        $scope.bindEmailDialog.remove();
    };

    $scope.$on('bindEmailModal:hide', function (event) {
        $scope.bindEmailDialog.hide();
        $scope.bindEmailDialog.remove();
    })


    //忘记密码页面
    $scope.showForgotPWBox = function() {
        $ionicModal.fromTemplateUrl('forgotPassword.html', {
          scope: $scope,
          focusFirstInput: true,
        }).then(function(modal) {
          $scope.forgotPWDialog= modal;
          $scope.forgotPWDialog.show();
        });
    };

    $scope.closeForgotPWBox= function() {
        $scope.forgotPWDialog.hide();
        $scope.forgotPWDialog.remove();
    };

    $scope.$on('forgotPWModal:hide', function (event) {
        $scope.forgotPWDialog.hide();
        $scope.forgotPWDialog.remove();
    })

}

function accountCtrl($rootScope, $scope, AuthService, User, Photogram,
        $ionicScrollDelegate) {
    //个人页面
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = '';
    });

    $scope.user = AuthService;

    $scope.onUserDetailContentScroll = onUserDetailContentScroll;

    function onUserDetailContentScroll(){
        var scrollDelegate = $ionicScrollDelegate.$getByHandle('userDetailContent');
        var scrollView = scrollDelegate.getScrollView();
        $scope.$broadcast('userDetailContent.scroll', scrollView);
    }

    $scope.gridStyle = 'list';
    $scope.switchListStyle = function(style){
        $scope.gridStyle = style;
    }


    $scope.zoom = function(img) {
        if (ionic.Platform.isAndroid()) {
            PhotoViewer.show(img, ''); //cordova photoviewer
        } else {
            ImageViewer.show(img);    // cordova ImageViewer for IOS
        }
    };
    $scope.posts = [];

    var userId = AuthService.getUser().id;
    var page = 0;

    Photogram.getUserPosts(userId, page).then(function(data){
        $scope.posts = data.posts;
        page++;
    });

    $scope.doRefresh = function() {
        page = 0;
        Photogram.getUserPosts(userId, page).then(function(data){
            $scope.posts = data.posts;
            page++;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Photogram.getUserPosts(userId, page).then(function(data){
            $scope.posts = $scope.posts.concat(data.posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            page++;
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Photogram.hasNextPage();
    };

    $scope.isEmpty = function() {
        return Photogram.isEmpty();
    };

}

function profileCtrl($scope, AuthService, $state, $rootScope,
        PhotoService, $http, ENV, $ionicPopup) {
    //个人页面
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.user = AuthService;
    $scope.setUsername = function(){
        $ionicPopup.prompt({
            title: '修改昵称',
            inputType: 'text',
            defaultText: AuthService.getUser().name,
            maxLength: 16,
            cancelText: '取消',
            okText: '确定',
            okType: 'button-stable',
        }).then(function(res) {
            AuthService.setUsername(res).then(function(data){
                $scope.$emit("alert", '修改成功');
                $rootScope.$ionicGoBack();
            });

        });
    };



    $scope.togglePhotoModal = function() {

        var filename = 'avatar/'+AuthService.getUser().id+'/'+new Date().getTime()+'.jpeg';

        PhotoService.open({
            pieces: 1,
            allowEdit: true
        }).then(function(image) {
            PhotoService.upload(image, filename,
                function(data){
                    AuthService.updateAvatar(filename)
                        .then(function(data) {
                            $rootScope.$broadcast('alert', "头像上传成功");
                        }).catch(function (data){
                            $rootScope.$broadcast('alert', data.error);
                        });
                }, function(error){
                    $rootScope.$broadcast('alert', "头像上传失败");
                });

        }).catch(function(){
            console.warn('Deu erro');
        });
    };
}

function bindEmailCtrl($rootScope, $scope, AuthService) {
    $scope.bind = function () {
        AuthService.bindEmail($scope.bindEmailForm.email, $rootScope.user_id)
            .then(function() {
                $rootScope.$broadcast('bindEmailModal:hide');
                $rootScope.authDialog.hide();
                $scope.$emit('alert', "绑定成功");
            }).catch(function (data) {
                if (data) {
                    $scope.$emit('alert', data.error);
                } else {
                    $scope.$emit('alert', 'Something went wrong..');
                }
            })
    };
}

function forgotPWCtrl($rootScope, $scope, AuthService) {
    $scope.submit = function () {
        AuthService.forgotPassword($scope.forgotPWForm.email)
            .then(function() {
                $rootScope.$broadcast('forgotPWModal:hide');
                $scope.$emit('alert', "邮件已发送至您的邮箱");
            }).catch(function (data) {
                if (data) {
                    $scope.$emit('alert', data.error);
                } else {
                    $scope.$emit('alert', 'Something went wrong..');
                }
            })
    };
}

function signupCtrl($rootScope, $scope, AuthService) {
    $scope.signup = function () {
        // call register from service
        AuthService.register($scope.signupForm)
            // handle success
            .then(function () {
                $rootScope.$broadcast('signupModal:hide');
                $rootScope.authDialog.hide()
                $scope.$emit('alert', "注册成功");
            })
            .catch(function (data) {
                if (data) {
                    $scope.$emit('alert', data.error);
                } else {
                    $scope.$emit('alert', 'Something went wrong..');
                }
            });
    };

}

function settingsCtrl($rootScope, $scope, $state, AuthService) {
    //登出
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.logout = function () {
        AuthService.logout()
            .then(function () {
                $state.go('tab.account');
            });
    };
}

function paymentSuccessCtrl($location, $timeout) {
    var order_id = $location.search().order_id;
    var order_type = $location.search().order_type;
    $timeout(function(){
        $location.url($location.path());
        if (order_type == 'TRANSFER'){
            $location.path('/order/transfer/'+order_id);
        } else {
            $location.path('/orders');
        }
    }, 2000);

}

function paymentCancelCtrl() {

}


function itemCtrl($scope, $rootScope, $stateParams, FetchData, $ionicModal,
        $ionicSlideBoxDelegate, sheetShare, $cordovaSocialSharing) {
    //商品详情
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.zoom = function(img) {
        if (ionic.Platform.isAndroid()) {
            PhotoViewer.show(img, ''); //cordova photoviewer
        } else {
            ImageViewer.show(img);    // cordova ImageViewer for IOS
        }
    };
    /**
    $scope.updateSlider = function () {
        $ionicSlideBoxDelegate.update(); //or just return the function
    };
    **/

    $scope.share = function(item){
        if ($rootScope.IsWechatInstalled && $rootScope.IsQQInstalled){
            sheetShare.popup(item);
        } else {
            var message = "分享图片",
                subject = '分享',
                file = item.url,
                link = "http://www.may.bi";

            $cordovaSocialSharing
                .share(message, subject, file, link) // Share via native share sheet
                .then(function(result) {
                    console.log('result:' + result);
                }, function(err) {
                    $rootScope.$emit('alert', err);
                });
        }
    };

    $ionicModal.fromTemplateUrl('specs-dialog.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.specsDialog = modal;
    });

    $scope.showSpecsBox = function() {
      $scope.specsDialog.show();
    };

    $scope.closeSpecsBox= function() {
      $scope.specsDialog.hide();
      $scope.specsDialog.remove();
    };

    $scope.$on('specsModal:hide', function (event) {
      $scope.specsDialog.hide();
      $scope.specsDialog.remove();
    })

    FetchData.get('/api/items/'+ $stateParams.itemID).then(function(data) {
        $scope.item = data.item;
        $scope.specs = data.item.specs;
        $scope.selectedSpec = data.item.specs[0];

        // 可选属性与属性列表组成的字典
        $scope.attrChoices = {};
        angular.forEach($scope.item.attributes_desc, function(key, value) {
            var attrChoices = [];
            angular.forEach($scope.specs, function(s){
                this.push(s.attributes[value]);
            }, attrChoices);
            $scope.attrChoices[value] = unique(attrChoices);
        });

        var images = [];
        angular.forEach($scope.item.specs, function (spec, index) {
            angular.forEach(spec.images, function (img, i) {
                images.push({url: img});
            });
        });
        $scope.images = images;
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').loop(true);

    });

    $scope.favor = function(item_id){
        if (!$scope.item.is_favored) {
            FetchData.get('/api/items/favor/'+item_id).then(function(data){
                $scope.item.is_favored = true;
            })
        } else {
            FetchData.get('/api/items/unfavor/'+item_id).then(function(data){
                $scope.item.is_favored = false;
            })
        }
    };

    $scope.quantity = 1;
    $scope.setQuantity = function(quantity, relative) {
        var quantityInt = parseInt(quantity);
        if (quantityInt % 1 === 0){
            if (relative === true){
                $scope.quantity  += quantityInt;
            } else {
                $scope.quantity = quantityInt;
            }
            if ($scope.quantity < 1) $scope.quantity = 1;
            if ($scope.quantity >= 5) $scope.quantity = 5;

        } else {
            $scope.quantity = 1;
            $scope.$emit('Quantity must be an integer and was defaulted to 1');
        }
    };
    $scope.subTotal = function(price, quantity) {
        return parseFloat(price * quantity);
    }

    $scope.selectedAttr = {};
    $scope.setAttr = function(k, val) {
        $scope.selectedAttr[k]= val;
        $scope.selectedSpec = containsObj($scope.selectedAttr, $scope.specs);
        $scope.remainSpec = remainSpecs(k,val, $scope.specs);
        $scope.selectedSpecData = {'item': $scope.item,
            'spec': $scope.selectedSpec};
    };

    // 移除列表中重复的项
    function unique(arr){
        for(var i=0;i<arr.length;i++)
            for(var j=i+1;j<arr.length;j++)
                if(arr[i]===arr[j]){arr.splice(j,1);j--;}
        return arr;
    }

    //  根据已选属性筛选出有效属性的选择
    var remainSpecs = function(k, val, list) {
        var keys = [];
        for (var i = 0; i < list.length; i++) {
            for (var kk in list[i].attributes){
                if (kk != k && list[i].attributes[k] == val ) {
                    keys.push(list[i].attributes[kk]);
                } else if (kk == k) {
                    keys.push(list[i].attributes[k]);
                }
            }
        }
        return unique(keys);
    };

    // 判断obj是否存在列表中，是则返回此对象，否则返回null
    var containsObj = function(obj, list) {
        for (var i = 0; i < list.length; i++) {
            if (angular.equals(list[i].attributes, obj)) {
                return list[i];
            }
        }
        return null;
    }


}

function boardCtrl($scope, $rootScope, $stateParams, FetchData, $state) {
    //专题详情
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    FetchData.get('/api/board/'+ $stateParams.boardID).then(function(data) {
        $scope.board = data.board;
    });
    $scope.goItem = function(item_id) {
        $state.go('tab.item', {itemID: item_id});
    };

}

function itemsCtrl($rootScope, $scope, Items, $state, $stateParams) {
    //我的喜欢
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.goItem = function(item_id) {
        $state.go('tab.item', {itemID: item_id});
    };

    $scope.items = [];

    $scope.title = $stateParams.cn || $stateParams.query;

    var sub_cate = $stateParams.en || '';
    var query = $stateParams.query || '';

    var page = 0;

    Items.searchItems(query, sub_cate, page).then(function(data){
        $scope.items = data.items;
        page++;
    });

    $scope.doRefresh = function() {
        page = 0;
        Items.searchItems(query, sub_cate, page).then(function(data){
            $scope.items = data.items;
            page++;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Items.searchItems(query, sub_cate, page).then(function(data){
            $scope.items = $scope.items.concat(data.items);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            page++;
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Items.hasNextPage();
    };
    $scope.isEmpty = function() {
        return Items.isEmpty();
    };
}

function favorCtrl($rootScope, $scope, FetchData, $state) {
    //我的喜欢
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    FetchData.get('/api/items/favors').then(function(data) {
        $scope.items = data.items;
    });

    $scope.goItem = function(item_id) {
        $state.go('tab.order_entry', {'itemID': item_id})
    };
}

function ordersCtrl($rootScope, $scope, FetchData, ngCart) {
    //订单列表
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.ngCart = ngCart;
    $scope.orderType = 'COMMODITIES';
    FetchData.get('/api/orders/COMMODITIES').then(function(data) {
        $scope.orders = data.orders;
    });
    $scope.setType = function(type) {
        $scope.orderType = type;
        FetchData.get('/api/orders/'+type).then(function(data) {
            $scope.orders = data.orders;
        });
    };
}

function orderDetailCtrl($rootScope, $scope, $state, $stateParams, FetchData, ngCart, $ionicPopup) {
    //商品详情
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    FetchData.get('/api/orders/get/'+ $stateParams.order_id).then(function(data) {
        $scope.ngCart = ngCart;
        $scope.order = data.order;
    });

     // A confirm dialog
    $scope.cancelOrder= function() {
        var confirmPopup = $ionicPopup.confirm({
            title: '确定取消订单?',
        });
        confirmPopup.then(function(res) {
            if(res) {
                FetchData.get('/api/orders/'+ $stateParams.order_id + '/delete')
                    .then(function(data) {
                        $scope.$emit("alert", "订单已删除");
                        $state.go('tab.orders');
                    })
            } else {
                console.log('You are not sure');
            }
        });
    };
}

function logisticsDetailCtrl($rootScope, $scope, $stateParams, $state, FetchData, ngCart) {
    //商品详情
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.allStatus= [];
    FetchData.get('/api/orders/get/'+ $stateParams.order_id).then(function(data) {
        $scope.ngCart = ngCart;
        $scope.order = data.order;
        $scope.logistic = data.order.logistics[0];
        angular.forEach($scope.logistic.all_status, function (status, index) {
            $scope.allStatus.push(status.status);
        });
    });

    $scope.currTab = 0;
    $scope.goTab = function(index, lo) {
        $scope.currTab = index;
        $scope.logistic = lo;
        angular.forEach($scope.logistic.all_status, function (status, index) {
            $scope.allStatus.push(status.status);
        });

    }

    $scope.addr = ngCart.getAddress();
    $scope.gotoAddress = function(){
        $state.go('tab.address');
    };
    $scope.fillTracking = function(entry) {
        FetchData.post('/api/orders/fill_shipping_info', {
            'entry_id': entry.id,
            'shipping_info': entry.shipping_info,
        }).then(function(data) {
            $scope.$emit("alert", "成功提交");
        });
    };
    // provider actions
    $scope.selectedProvider = null;
    $scope.providersShown = false;

    $scope.showProviderChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        $scope.providersShown = !$scope.providersShown;
        FetchData.post('/api/logistic/transfer_provider_prices', {
            'order_id': $scope.order.id,
            'country': ngCart.getAddress().data.country,
        }).then(function(data) {
            $scope.provider_prices = data.logistics.providers;
            $scope.selectedProvider = data.logistics.providers[0];
        });
    };

    $scope.selectPartner = function(provider){
        $scope.selectedProvider = provider;
        $scope.providersShown = !$scope.providersShown;

        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.order = data.order;
        });
    };

    // coupon actions
    $scope.coupon_codes = '';
    $scope.couponsShown = false;
    $scope.couponInputSelected= false;
    $scope.noCouponSelected= false;

    $scope.showCouponsChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        if ($scope.selectedProvider == null){
            $scope.$emit('alert', "请先选择运输方式");
            return ;
        }
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/users/coupons/by_order', {
            'order_id': $scope.order.id,
        }).then(function(data) {
            $scope.availableCoupons= data.consumable_coupons;
            $scope.coupon_codes = '';
        });

    };
    $scope.noCoupon = function() {
        $scope.coupon_codes = '';
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= true;
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.order = data.order;
        });
    };
    $scope.selectCoupon = function(coupon) {
        $scope.coupon_codes = coupon;
        $scope.couponsShown = !$scope.couponsShown;
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= false;
        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.order = data.order;
        });
    };
    $scope.selectInputCoupon = function() {
        $scope.coupon_codes = '';
        $scope.couponInputSelected= true;
        $scope.noCouponSelected= false;
    };

    $scope.confirmCoupon = function() {
        $scope.couponInputSelected= true;
        FetchData.post('/api/orders/cal_order_price', {
            'order_id': $scope.order.id,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.couponInput],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.coupon_codes = {
                code: $scope.couponInput,
                description: $scope.couponInput,
            };
            if (data.order.discount.length === 0){
                $scope.coupon_codes['saving'] = "无效折扣码";
            } else {
                $scope.coupon_codes['saving'] = data.order.discount[0].value;
                $scope.couponsShown = !$scope.couponsShown;
            };
            $scope.order = data.order;
        }).catch(function() {
            $scope.$emit("alert", "something wrong..");
        });
    };

    $scope.cancelOrder = function() {
        window.confirm('确定取消订单？')?
            FetchData.get('/api/orders/'+ $scope.order.id + '/delete').then(function(data) {
                $scope.$emit("alert", "订单已删除");
                $location.path('/orders');
            }) : void(0);
    };

}

function calculateCtrl($rootScope, $scope, $location, FetchData) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    FetchData.get('/api/address/hierarchy').then(function(data){
        $scope.COUNTRIES= data.countries;
    });
    $scope.query = {};

    $scope.queryFee = function(){
        if (!$scope.query.country || !$scope.query.weight){
            $scope.$emit("alert", "请填写完整信息");
            return ;
        }
        FetchData.get('/api/logistic/cal_provider_prices', {
            'country': $scope.query.country,
            'weight': $scope.query.weight,
        }).then(function(data) {
            $scope.provider_prices = data.logistics.providers;
        });
    };
}

function expressCtrl($rootScope, $scope, FetchData, ngCart, AuthService, $state, expressList) {
    //待寄物品清单
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.ngCart = ngCart;
    $scope.STATUES = ['跟踪快递', '入库称重', '支付运费', '正在运送', '航班到港', '包裹签收'];

    $scope.addr = ngCart.getAddress();
    $scope.gotoAddress = function(){
        $state.go('tab.address')
    };

    $scope.entries = expressList.get() || [];
    $scope.newEntry = {};
    $scope.addEntry = function() {
        $state.go('tab.express_add');
    };
    $scope.removeEntry = function(entry) {
        angular.forEach($scope.entries, function(ent, index) {
            if  (ent === entry) {
                $scope.entries.splice(index, 1);
            }
        });
    };
    $scope.submit = function(){
        if ($scope.entries.length == 0){
            $scope.$emit('alert', "您未添加商品");
            return ;
        }
        if (AuthService.getUser() === {}) {
            $scope.$emit('alert', "请先登录");
        }
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请添加地址");
            return ;
        }

        $rootScope.$broadcast("alertStart", "正在处理，请稍等..");
        FetchData.post('/api/orders/create_transfer_order', {
            'entries': $scope.entries,
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [],
            'logistic_provider': 'default',
        }).then(function(data) {
            $scope.order = data.order;
            $rootScope.$broadcast("alertEnd");
            $state.go('tab.order_transfer', {'order_id': data.order_id});
            expressList.empty();
        }).catch(function(){
            $scope.$emit("alert","系统出错..");
        });

    }
}

function expressItemAddCtrl($rootScope, $scope, expressList){
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });
    $scope.expressList = expressList.get();
    $scope.item = {};
    $scope.addItem = function(){
        if (!$scope.item.title || !$scope.item.quantity || !$scope.item.amount || !$scope.item.remark) {
            $scope.$emit('alert', "请填写完整信息");
            return
        }
        if ($scope.item.main_category == true) {
            $scope.item.main_category = 'special';
        } else {
            $scope.item.main_category = 'normal';
        }
        expressList.add($scope.item);
        $scope.$ionicGoBack();
    }
}

function cartCtrl(FetchData, $rootScope, $scope, ngCart) {
    //购物车
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = '';
    });

    FetchData.get('/api/cart').then(function(data) {
        ngCart.$loadCart(data.cart);
    });
    $scope.ngCart = ngCart;
    $scope.editShown = false;
    $scope.toggleEditShown = function() {
        $scope.editShown = !$scope.editShown;
    };
    $scope.setQuantity = function(item, quantity, relative) {
        var quantityInt = parseInt(quantity);
        if (quantityInt % 1 === 0){
            if (relative === true){
                item.setQuantity(item.getQuantity() + quantityInt)
            } else {
                item.setQuantity(quantityInt)
            }
            if (item.getQuantity() < 1) item.setQuantity(1);
            if (item.getQuantity() >= 5) item.setQuantity(5);

        } else {
            item.setQuantity(1)
            $scope.$emit('Quantity must be an integer and was defaulted to 1');
        }
        FetchData.post('/api/cart/entry/'+item.getId()+'/update', {
            'quantity': item.getQuantity()
        });
    };


    $scope.selectEntry = function(id) {
        if (ngCart.getSelectedItemById(id)) {
            ngCart.removeSelectedItemById(id);
        } else {
            ngCart.selectItem(id);
        }
    };

    $scope.isSelectedAll = false;
    $scope.selectAllEntries = function() {
        if ($scope.isSelectedAll === false) {
            angular.forEach(ngCart.getCart().items, function (item, index) {
                if (!ngCart.getSelectedItemById(item.getId())) {
                    ngCart.selectItem(item.getId());
                }
            });
        } else {
            ngCart.getCart().selectedItems = [];
        }
        $scope.isSelectedAll = !$scope.isSelectedAll;
    };
}


function checkoutCtrl($state, $scope, $rootScope, FetchData, ngCart) {
    // 结算
    //
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
      $scope.addr = ngCart.getAddress();
    });

    $scope.ngCart = ngCart;
    $scope.gotoAddress = function(){
        $state.go('tab.address');
    };


    // provider actions
    $scope.selectedProvider = null;
    $scope.providersShown = false;

    $scope.showProviderChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        $scope.providersShown = !$scope.providersShown;
        FetchData.post('/api/logistic/channel_prices', {
            'entries': ngCart.selectedItemsObjects(),
            'country': $scope.addr.data.country,
        }).then(function(data) {
            $scope.provider_prices = data.logistics.providers;
            $scope.selectedProvider = data.logistics.providers[0];
        });
    };

    $scope.selectPartner = function(provider){
        $scope.selectedProvider = provider;
        $scope.providersShown = !$scope.providersShown;

        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.order = data.order;
        });
    };

    // coupon actions
    $scope.coupon_codes = '';
    $scope.couponsShown = false;
    $scope.couponInputSelected= false;
    $scope.noCouponSelected= false;
    $scope.showCouponsChoices = function() {
        if (ngCart.getAddress().id === undefined){
            $scope.$emit('alert', "请先添加地址");
            return ;
        }
        if ($scope.selectedProvider == null){
            $scope.$emit('alert', "请先选择运输方式");
            return ;
        }
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/users/coupons/by_entries', {
            'entries': ngCart.selectedItemsObjects(),
        }).then(function(data) {
            $scope.availableCoupons= data.consumable_coupons;
            $scope.coupon_codes = '';
        });
    };
    $scope.noCoupon = function() {
        $scope.coupon_codes = '';
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= true;
        $scope.couponsShown = !$scope.couponsShown;
        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.order = data.order;
        });
    };
    $scope.selectCoupon = function(coupon) {
        $scope.coupon_codes = coupon;
        $scope.couponsShown = !$scope.couponsShown;
        $scope.couponInputSelected= false;
        $scope.noCouponSelected= false;
        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.coupon_codes.code],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.order = data.order;
        });
    };
    $scope.selectInputCoupon = function() {
        $scope.coupon_codes = '';
        $scope.couponInputSelected= true;
        $scope.noCouponSelected= false;
    };

    $scope.confirmCoupon = function() {
        $scope.couponInputSelected= true;
        FetchData.post('/api/orders/cal_entries_price', {
            'entries': ngCart.selectedItemsObjects(),
            'address_id': ngCart.getAddress().id,
            'coupon_codes': [$scope.couponInput],
            'logistic_provider': $scope.selectedProvider.name,
        }).then(function(data) {
            $scope.coupon_codes = {
                code: $scope.couponInput,
                description: $scope.couponInput,
            };
            if (data.order.discount.length === 0){
                $scope.coupon_codes['description'] = "无效折扣码";
            } else {
                $scope.coupon_codes['saving'] = data.order.discount[0].value;
                $scope.couponsShown = !$scope.couponsShown;
            };
            $scope.order = data.order;

        }).catch(function() {
            $scope.$emit("alert", "something wrong..");
        });
    };
}

function addressCtrl($rootScope, $state, $scope, FetchData, ngCart) {
    // 地址选择
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });

    FetchData.get('/api/address/all').then(function(data){
        $scope.addresses = data.addresses;
    });

    $scope.editShown = false;
    $scope.toggleEditShown = function() {
        $scope.editShown = !$scope.editShown;
    };
    $scope.removeAddr = function(addr_id) {
        FetchData.get('/api/address/del/'+addr_id).then(function(data){
            if(data.message == 'OK') {
                angular.forEach($scope.addresses, function (addr, index) {
                    if  (addr.id === addr_id) {
                        $scope.addresses.splice(index, 1);
                    }
                });
            } else {
                $scope.$emit("alert", data.error);
            }
        });
    };

    $scope.ngCart = ngCart;
    $scope.selectedAddress = '';
    $scope.selectAddress = function(address){
        $scope.selectedAddress = address;
    };
    $scope.confirmAddress = function(){
        ngCart.setAddress($scope.selectedAddress);
        $rootScope.$ionicGoBack();

    };
}

function fourZeroFour_controller() {}

function feedbackCtrl($scope, FetchData, $rootScope) {
    $scope.feedback = function() {
        FetchData.post('/api/users/feedback', {
            'feedback': $scope.text
        }).then(function(data) {
            $scope.$emit('alert', "感谢您的反馈，我们会及时与您联系。");
        })
    };
}

function csCtrl($rootScope, $scope) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });
}

function faqCtrl($rootScope, $scope) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.hideTabs = 'tabs-item-hide';
    });
}

function categoryCtrl($rootScope, $scope, FetchData, $state){
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    FetchData.get('/api/categories').then(function(data) {
        $scope.categories= data.categories;
    });
    $scope.goCategory = function(sub){
        $state.go('tab.categories',{en: sub.en, cn: sub.cn});
    };

}

function couponsCtrl($rootScope, $scope, AuthService){
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.user = AuthService;

}

function aboutCtrl($rootScope, $scope, $state, appUpdateService){
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = 'tabs-item-hide';
    });

    $scope.platform = ionic.Platform;

    $scope.appUpdateService = appUpdateService;

}

function notificationCtrl($rootScope,$scope, $state, Notification){
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = '';
    });

    $scope.zoom = function(url) {

        if (ionic.Platform.isAndroid()) {
            PhotoViewer.show(url, ''); //cordova photoviewer
        } else {
            ImageViewer.show(url);    // cordova ImageViewer for IOS
        }
    };

    $scope.notices = [];
    var page = 0;

    Notification.getNotices(page).then(function(data){
        $scope.notices = data.notices;
        page++;
    });

    $scope.doRefresh = function() {
        page = 0;
        Notification.getNotices(page).then(function(data){
            $scope.notices = data.notices;
            page++;
        });
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.loadMore = function() {
        Notification.getNotices(page).then(function(data){
            $scope.notices = $scope.notices.concat(data.notices);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            page++;
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return Notification.hasNextPage();
    };
    $scope.isEmpty = function() {
        return Notification.isEmpty();
    }

}

function introCtrl($rootScope, $scope, $state, FetchData, $ionicSlideBoxDelegate, Storage){

    var currentPlatform = ionic.Platform.platform();
    $scope.slideIndex = 0;
    $scope.slideChanged = slideChanged;
    $scope.next = function () {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function () {
      $ionicSlideBoxDelegate.previous();
    };



    if (currentPlatform && currentPlatform == 'android') {
      $scope.device = 'android';
    } else {
      $scope.device = 'iphone';
    }

    $scope.slides = [{
        top: '专属轻社区，分享交流，互助互惠',
        img: 'img/intro/intro3.jpg'
      }, {
        top: '晒图卖萌刷心情，展现特别的你',
        img: 'img/intro/intro4.jpg'
      }, {
        top: '家乡特色，闪电发货，海外直邮',
        img: 'img/intro/intro1.jpg'
      }, {
        top: '私人包裹 & 寄出国，省心又省力',
        img: 'img/intro/intro2.jpg'
      }
    ];

    function slideChanged(index) {
        $scope.slideIndex = index;
    }

    $scope.goHome = function(){
        $state.go('tab.explore');
        Storage.set('introPage','alreadyShow');
    };

}



controllersModule.controller('homeCtrl', homeCtrl);
controllersModule.controller('cateHomeCtrl', cateHomeCtrl);
controllersModule.controller('introCtrl', introCtrl);
controllersModule.controller('exploreCtrl', exploreCtrl);
controllersModule.controller('notificationCtrl', notificationCtrl);
controllersModule.controller('myPostsCtrl', myPostsCtrl);
controllersModule.controller('likePostsCtrl', likePostsCtrl);
controllersModule.controller('postDetailCtrl', postDetailCtrl);
controllersModule.controller('userDetailCtrl', userDetailCtrl);
controllersModule.controller('userListCtrl', userListCtrl);
controllersModule.controller('tabsCtrl', tabsCtrl);
controllersModule.controller('feedbackCtrl', feedbackCtrl);
controllersModule.controller('csCtrl', csCtrl);
controllersModule.controller('faqCtrl', faqCtrl);
controllersModule.controller('couponsCtrl', couponsCtrl);
controllersModule.controller('categoryCtrl', categoryCtrl);
controllersModule.controller('authCtrl', authCtrl);
controllersModule.controller('signupCtrl', signupCtrl);
controllersModule.controller('accountCtrl', accountCtrl);
controllersModule.controller('profileCtrl', profileCtrl);
controllersModule.controller('bindEmailCtrl', bindEmailCtrl);
controllersModule.controller('forgotPWCtrl', forgotPWCtrl);
controllersModule.controller('settingsCtrl', settingsCtrl);
controllersModule.controller('paymentSuccessCtrl', paymentSuccessCtrl);
controllersModule.controller('paymentCancelCtrl', paymentCancelCtrl);
controllersModule.controller('itemCtrl', itemCtrl);
controllersModule.controller('itemsCtrl', itemsCtrl);
controllersModule.controller('boardCtrl', boardCtrl);
controllersModule.controller('favorCtrl', favorCtrl);
controllersModule.controller('ordersCtrl', ordersCtrl);
controllersModule.controller('calculateCtrl', calculateCtrl);
controllersModule.controller('expressCtrl', expressCtrl);
controllersModule.controller('expressItemAddCtrl', expressItemAddCtrl);
controllersModule.controller('orderDetailCtrl', orderDetailCtrl);
controllersModule.controller('logisticsDetailCtrl', logisticsDetailCtrl);
controllersModule.controller('cartCtrl', cartCtrl);
controllersModule.controller('checkoutCtrl', checkoutCtrl);
controllersModule.controller('addressCtrl', addressCtrl);
controllersModule.controller('fourZeroFour_controller', fourZeroFour_controller);
controllersModule.controller('aboutCtrl', aboutCtrl);

"use strict";

angular.module('maybi.services', [])

.factory('timeoutHttpIntercept', function () {
    return {
        'request': function(config) {
            config.timeout = 10000;
            return config;
        }
    };
})
.service('sheetShare', ['$rootScope', '$bottomSheet', function($rootScope, $bottomSheet) {
    this.popup = showSheet;

    function showSheet(item, share_type) {
        $bottomSheet.show({
            buttons: [
                [
                    {btText:"微信好友",btClass:"icon fa fa-weixin",btId:"0",hideOnClick:true}, //hide the bottomSheet when click
                    {btText:"朋友圈",btClass:"icon pyq",btId:"1"},
                    {btText:"微博",btClass:"icon fa fa-weibo",btId:"2"},
                    {btText:"QQ好友",btClass:"icon fa fa-qq",btId:"3"}
                ]
            ],
            titleText: '分享到',
            buttonClicked: function(button,scope) {
                if (share_type == 'post') {
                    var title = item.title.substr(0,24);
                    var description = "来自美比，比邻中国的海外生活。";
                    var url = "http://www.may.bi/";
                    var image = item.small_url;
                } else {
                    var title = item.title.substr(0,24);
                    var description = "来自美比，比邻中国的海外生活。";
                    var url = "http://may.bi/#/items/"+item.item_id;
                    var image = item.small_thumbnail;
                }

                var successCallback = function (){
                    $rootScope.$broadcast('alert', "分享成功");
                };
                var failCallback = function (reason){
                    $rootScope.$broadcast('alert', reason);
                };

                if (button.btId == 0 || button.btId == 1){
                    window.Wechat.share({
                        message: {
                            title: title,
                            description: description,
                            thumb: image,
                            media: {
                                type: Wechat.Type.LINK,
                                webpageUrl: url
                            }
                        },
                        scene: button.btId,
                    }, successCallback, failCallback);
                } else if (button.btId == 2) {
                    var args = {};
                    args.url = url;
                    args.title = title;
                    args.description = description;
                    args.imageUrl = image;
                    args.defaultText = "";
                    window.YCWeibo.shareToWeibo(successCallback, failCallback, args);
                } else if (button.btId == 3) {
                    var args = {};
                    args.url = url;
                    args.title = title;
                    args.description = description;
                    args.imageUrl = image;
                    args.appName = "美比客户端";
                    window.YCQQ.shareToQQ(function() {}, failCallback, args);
                }
                    }
                });
    }
}])

.service('share', ['$rootScope', '$ionicActionSheet', function($rootScope, $ionicActionSheet) {
    this.popup = showPopup;

    function showPopup(item) {
      var sheet = {};
      sheet.cancelText = '取消';
      sheet.buttonClicked = buttonClicked;
      sheet.buttons = [{
        text: '<i class="icon fa fa-weixin"></i> 发送给微信好友'
      }, {
        text: '<i class="icon fa fa-weixin"></i> 分享到朋友圈'
      }, {
        text: '<i class="icon fa fa-weibo"></i> 分享到微博'
      }, {
        text: '<i class="icon fa fa-qq"></i> 发送给QQ好友'
      }];

      $ionicActionSheet.show(sheet);

      function buttonClicked(index) {

        var title = item.title;
        var description = "美比，给您比邻中国的海外生活。";
        var url = "http://may.bi/#/items/"+item.item_id;
        var image = item.small_thumbnail;

        var successCallback = function (){
            $rootScope.$broadcast('alert', "分享成功");
        };
        var failCallback = function (reason){
            $rootScope.$broadcast('alert', reason);
        };

        if (index == 0 || index == 1){
            window.Wechat.share({
                message: {
                    title: title,
                    description: description,
                    thumb: image,
                    media: {
                        type: Wechat.Type.LINK,
                        webpageUrl: url
                    }
                },
                scene: index
            }, successCallback, failCallback);
        } else if (index == 2) {
            var args = {};
            args.url = url;
            args.title = title;
            args.description = description;
            args.imageUrl = image;
            args.defaultText = "";
            window.YCWeibo.shareToWeibo(successCallback, failCallback, args);
        } else if (index == 3) {
            var args = {};
            args.url = url;
            args.title = title;
            args.description = description;
            args.imageUrl = image;
            args.appName = "美比客户端";
            window.YCQQ.shareToQQ(function() {}, failCallback, args);
        }

      }
    }
}])

.factory('Storage', function() {
    return {
        set: function(key, data) {
            return window.localStorage.setItem(key, window.JSON.stringify(data));
        },
        get: function(key) {

            return window.JSON.parse(window.localStorage.getItem(key));
        },
        remove: function(key) {
            return window.localStorage.removeItem(key);
        }
    };
})
.factory('AuthService', ['ENV', '$http', 'Storage', '$state', '$q', function(ENV, $http, Storage, $state, $q) {
    var isAuthenticated = false;
    var user = Storage.get('user') || {};
    return {
        isLoggedIn: function () {
            if (isAuthenticated) {
                return true;
            } else {
                return false;
            }
        },

        login: function (email, password) {
            var deferred = $q.defer();
            $http.post(ENV.SERVER_URL+'/api/auth/login_email', {
                email: email,
                password: password
            }).success(function(data, status) {
                if (status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    user = data.user;
                    Storage.set('user', data.user);
                    Storage.set('access_token', data.remember_token);
                    if (window.cordova && window.cordova.plugins) {
                        plugins.jPushPlugin.setAlias(data.user.id);
                    }
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject();
                }
            }).error(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        setUsername:function(username){ //TODO 目前后台返回的data只有message，需要让后台返回新的user对象，然后前端Storage.set('user', data.user);
            var deferred = $q.defer();
            $http.post(ENV.SERVER_URL+'/api/users/update_username', {
                username: username
            }).success(function(data, status){
                if (status === 200 && data.message == "OK"){
                    user = data.user;
                    Storage.set('user', data.user);
                    deferred.resolve(data);
                } else {
                    deferred.reject(data);
                }
            }).error(function(data){
                deferred.reject(data);
            });

            return deferred.promise;
        },

        updateAvatar:function(filename){ //TODO 目前后台返回的data只有message，需要让后台返回新的user对象，然后前端Storage.set('user', data.user);
            var deferred = $q.defer();
            $http.post(ENV.SERVER_URL+'/api/users/update_avatar', {
                avatar_url: filename,
            }).success(function(data, status) {
                if (status === 200 && data.message == "OK"){
                    user = data.user;
                    Storage.set('user', data.user);
                    deferred.resolve(data);
                } else {
                    deferred.reject(data);
                }
            }).error(function(data){
                deferred.reject(data);
            });

            return deferred.promise;
        },


        bindEmail: function (email, user_id) {
            var deferred = $q.defer();
            $http.post(ENV.SERVER_URL+'/api/auth/bind_email', {
                email: email,
                user_id: user_id,
            }).success(function(data, status) {
                if (status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    user = data.user;
                    Storage.set('user', data.user);
                    Storage.set('access_token', data.remember_token);
                    if (window.cordova && window.cordova.plugins) {
                        plugins.jPushPlugin.setAlias(data.user.id);
                    }
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject(data);
                }
            }).error(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        forgotPassword: function (email) {
            var deferred = $q.defer();
            $http.post(ENV.SERVER_URL+'/api/auth/forgot_password', {
                email: email,
            }).success(function(data, status) {
                if (status === 200 && data.message == "OK"){
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject(data);
                }
            }).error(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        logout: function() {
            var deferred = $q.defer();
            $http.get(ENV.SERVER_URL+'/api/auth/logout').success(function (data) {
                isAuthenticated = false;
                user = {};
                Storage.remove('user');
                Storage.remove('access_token');
                deferred.resolve();
            }).error(function (data) {
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        authenticate: function(token) {
            var deferred = $q.defer();
            $http.post(ENV.SERVER_URL+'/api/auth/login_with_token', {
                token: token,
            }).success(function (data, status) {
                if (status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    user = data.user;
                    Storage.set('user', data.user);
                    Storage.set('access_token', data.remember_token);
                    if (window.cordova && window.cordova.plugins) {
                        plugins.jPushPlugin.setAlias(data.user.id);
                    }
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject();
                }
            }).error(function (data){
                isAuthenticated = false;
                deferred.reject();
            });

            return deferred.promise;
        },

        oauth: function(sitename, params) {
            var deferred = $q.defer();

            $http.get(ENV.SERVER_URL+'/api/auth/oauth/'+sitename, {
                params: params
            }).success(function(data, status) {
                if (data.message == "OK" && data.login === true){
                    isAuthenticated = true;
                    user = data.user;
                    Storage.set('user', data.user);
                    Storage.set('access_token', data.remember_token);
                    if (window.cordova && window.cordova.plugins) {
                        plugins.jPushPlugin.setAlias(data.user.id);
                    }
                    deferred.resolve(data);
                } else if(data.message == "OK" && data.login === false){
                    isAuthenticated = false;
                    deferred.resolve(data);
                }
            }).error(function (data){
                isAuthenticated = false;
                deferred.reject();
            });
            return deferred.promise;
        },

        register: function(form) {
            var deferred = $q.defer();

            $http.post(ENV.SERVER_URL+'/api/auth/signup', {
                email: form.email,
                password: form.password,
                name: form.name
            }).success(function (data, status) {
                if(status === 200 && data.message == "OK"){
                    isAuthenticated = true;
                    user = data.user;
                    Storage.set('user', data.user);
                    Storage.set('access_token', data.remember_token);
                    if (window.cordova && window.cordova.plugins) {
                        plugins.jPushPlugin.setAlias(data.user.id);
                    }
                    deferred.resolve();
                } else {
                    isAuthenticated = false;
                    deferred.reject(data);
                }
            }).error(function (data) {
                deferred.reject();
            });

            return deferred.promise;
        },
        getUser: function() {
            return user;
        },

    };
}])
.factory('User',['ENV', '$http', '$state', '$q', function(ENV, $http, $state, $q) {

    var users = [];
    var hasNextPage = true;
    var isEmpty = false;
    var nextPage = 0;
    var perPage = 20;

    return {
        getFollowers: getFollowers ,
        getFollowings: getFollowings,
        getPostLikeUsers: getPostLikeUsers,

        follow: follow,
        unfollow: unfollow,
        hasNextPage: function() {
            return hasNextPage;
        },
        isEmpty: function() {
            return isEmpty;
        },
    }

    function unfollow (user_id) {
            var deferred = $q.defer();
            $http.get(ENV.SERVER_URL+'/api/users/unfollow/'+user_id).success(function (data) {
                deferred.resolve();
            }).error(function (data) {
                deferred.reject();
            });
            return deferred.promise;
    }

    function follow(user_id) {
            var deferred = $q.defer();
            $http.get(ENV.SERVER_URL+'/api/users/follow/'+user_id).success(function (data) {
                deferred.resolve();
            }).error(function (data) {
                deferred.reject();
            });
            return deferred.promise;
    }

    function getFollowers(userId, page) {
        var deferred = $q.defer();
        hasNextPage = true;
        isEmpty = false;

        $http.get(ENV.SERVER_URL + '/api/users/followers', {
            params: {
                page: page,
                per_page: perPage,
                user_id: userId,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.users.length < perPage) {
                    hasNextPage = false;
                }
                if (page == 0 && r.users.length === 0) {
                    isEmpty = true;
                }
                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

    function getFollowings(userId, page) {
        var deferred = $q.defer();
        hasNextPage = true;
        isEmpty = false;

        $http.get(ENV.SERVER_URL + '/api/users/followings', {
            params: {
                page: page,
                per_page: perPage,
                user_id: userId,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.users.length < perPage) {
                    hasNextPage = false;
                }
                if (page == 0 && r.users.length === 0) {
                    isEmpty = true;
                }
                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

    function getPostLikeUsers(postId, page) {
        var deferred = $q.defer();
        hasNextPage = true;
        isEmpty = false;

        $http.get(ENV.SERVER_URL + '/api/post/'+postId+'/likes', {
            params: {
                page: page,
                per_page: perPage,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.users.length < perPage) {
                    hasNextPage = false;
                }
                if (page == 0 && r.users.length === 0) {
                    isEmpty = true;
                }
                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

}])

.factory('Items', ['ENV', '$http', '$log', '$q', '$rootScope', 'Storage', function(ENV, $http, $log, $q, $rootScope, Storage) {
    // 用来存储话题类别的数据结构，包含了下一页、是否有下一页等属性
    var items = [];
    var currentTab = '';
    var hasNextPage = true;
    var nextPage = 0;
    var perPage = 12;
    var isEmpty = false;

    return {
        fetchTopItems: function () {
            var deferred = $q.defer();
            hasNextPage = true;
            isEmpty = false;

            $http.get(ENV.SERVER_URL + '/api/items', {
                params: {
                    main_category: currentTab,
                    page: 0,
                    per_page: perPage,
                }
            }).success(function(r, status) {
                if (status === 200 && r.message == "OK"){
                    if (r.items.length < perPage) {
                        hasNextPage = false;
                    }
                    nextPage = 1;
                    deferred.resolve(r);
                    if (r.items.length === 0) {
                        isEmpty = true;
                    }
                } else {
                    deferred.reject();
                }
            }).error(function (data){
                deferred.reject();
            });
            return deferred.promise;
        },

        searchItems: function(query, sub_category, page) {
            var deferred = $q.defer();
            hasNextPage = true;
            isEmpty = false;

            $http.get(ENV.SERVER_URL + '/api/items', {
                params: {
                    sub_category: sub_category,
                    page: page,
                    per_page: perPage,
                    title: query,
                }
            }).success(function(r, status) {
                if (status === 200 && r.message == "OK"){
                    if (r.items.length < perPage) {
                        hasNextPage = false;
                    }
                    nextPage = 1;
                    deferred.resolve(r);
                    if (page == 0 && r.items.length === 0) {
                        isEmpty = true;
                    }
                } else {
                    deferred.reject();
                }
            }).error(function (data){
                deferred.reject();
            });
            return deferred.promise;

        },

        getItems: function() {
            return items;
        },

        setCurrentTab: function(tab) {
            currentTab = tab;
        },

        getCurrentTab: function() {
            return currentTab;
        },

        increaseNewItems: function() {
            var deferred = $q.defer();
            $http.get(ENV.SERVER_URL + '/api/items', {
                params: {
                    main_category: currentTab,
                    page: nextPage,
                    per_page: perPage,
                }
            }).success(function(r, status) {
                if (status === 200 && r.message == "OK"){
                    if (r.items.length < perPage) {
                        hasNextPage = false;
                    }
                    nextPage++;
                    deferred.resolve(r);
                } else {
                    deferred.reject();
                }
            }).error(function (data){
                deferred.reject();
            });
            return deferred.promise;
        },

        hasNextPage: function() {
            return hasNextPage;
        },
        isEmpty: function() {
            return isEmpty;
        },

    };


  }])
.factory('FetchData', ['$rootScope', '$http', '$q', 'ENV', '$ionicLoading', function($rootScope, $http, $q, ENV, $ionicLoading) {
    return {
        get: function (url, kargs) {
            var server_url = ENV.SERVER_URL + url ;
            var d = $q.defer();
            /*
            $ionicLoading.show({
              template: '<ion-spinner icon="spiral"></ion-spinner>',
            });
            */

            $http({
                method: "GET",
                url: server_url,
                params: kargs,

            }).success(function(res, status) {
                if (status === 200 && res.message == "OK") {
                    //$ionicLoading.hide();
                    d.resolve(res);
                } else {
                    if (status == 404 || status == 302 ) {
                        $ionicLoading.show({
                          template: '请先登录',
                          duration: 1000,
                        });
                    } else {
                        $ionicLoading.show({
                          template: res.error||'出错了',
                          duration: 1000,
                        });
                    }
                    d.reject();
                }
            }).error(function (data, status){
                //$ionicLoading.hide();
                $ionicLoading.show({
                  template: "网络出错, "+status,
                  duration: 1000,
                });
                d.reject();
            });
            return d.promise;
        },
        post: function (url, kargs) {
            var server_url = ENV.SERVER_URL + url ;
            var d = $q.defer();
            /*
            $ionicLoading.show({
              template: '<ion-spinner icon="spiral"></ion-spinner>',
            });
            */

            $http({
                method: "POST",
                url: server_url,
                data: kargs

            }).success(function(res, status) {
                if (status === 200 && res.message == "OK") {
                    //$ionicLoading.hide();
                    d.resolve(res);
                } else {
                    if (status == 404 || status == 302 ) {
                        $ionicLoading.show({
                          template: '请先登录',
                          duration: 1000,
                        });
                    } else {
                        $ionicLoading.show({
                          template: res.error||'出错了',
                          duration: 1000,
                        });
                    }
                    d.reject();
                }
            }).error(function (data, status){
                //$ionicLoading.hide();
                $ionicLoading.show({
                  template: "网络出错, "+status,
                  duration: 1000,
                });
                d.reject();
            });
            return d.promise;
        }
    };
}])
.service('expressList', function () {

    var itemList = [];

    this.get = function () {
        return itemList;
    };
    this.add = function (data) {
        itemList.push(data);
    };
    this.empty = function(){
        itemList = [];
    }

})
.service('ngCart', ['$rootScope', '$http', 'ngCartItem', 'Storage', 'ENV', function($rootScope, $http, ngCartItem, Storage, ENV) {

    this.attrMap = {'size': "尺寸", 'color': "颜色", 'style': "样式"};

    this.init = function(){
        this.$cart = {
            shipping : null,
            taxRate : null,
            tax : null,
            items : [],
            selectedItems: [],
        };
        this.$addr = {
            id: undefined,
            data: {},
        };
    };

    this.setAddress = function(addr){
        this.$addr.id = addr.id;
        this.$addr.data = addr;
    };

    this.getAddress = function () {
        var _self = this;

        if (this.$addr.id === undefined) {
            $http.get(ENV.SERVER_URL + '/api/address/default').success(function(data) {
                if (data.address) {
                    _self.setAddress(data.address);
                }
            });
        }
        return this.$addr;

    };

    this.addItem = function (id, name, price, quantity, data) {

        var _self = this;

        $http.post(ENV.SERVER_URL+'/api/cart/add/'+ id, {
            'quantity': quantity,
        }).success(function(res) {
            _self.$loadCart(res.cart);
        }).error(function() {

        });
        $rootScope.$broadcast('specsModal:hide');
        $rootScope.$broadcast('ngCart:change', "商品已添加到购物车");
    };

    this.selectItem = function (id) {
        // 查找cart已有的item,并加进selectedItems
        var inCart = this.getItemById(id);
        if (typeof inCart === 'object'){
            this.$cart.selectedItems.push(inCart);
        } else {
            console.log('irregular item');
        }
    };

    this.getItemById = function (itemId) {
        var items = this.getCart().items;
        var build = false;

        angular.forEach(items, function (item) {
            if  (item.getId() === itemId) {
                build = item;
            }
        });
        return build;
    };

    this.getSelectedItemById = function (itemId) {
        var items = this.getCart().selectedItems;
        var build = false;

        angular.forEach(items, function (item) {
            if  (item.getId() === itemId) {
                build = item;
            }
        });
        return build;
    };

    this.setShipping = function(shipping){
        this.$cart.shipping = shipping;
        return this.getShipping();
    };

    this.getShipping = function(){
        if (this.getCart().items.length === 0) return 0;
        return  this.getCart().shipping;
    };

    this.setTaxRate = function(taxRate){
        this.$cart.taxRate = +parseFloat(taxRate).toFixed(2);
        return this.getTaxRate();
    };

    this.getTaxRate = function(){
        return this.$cart.taxRate;
    };

    this.getTax = function(){
        return +parseFloat(((this.getSubTotal()/100) * this.getCart().taxRate )).toFixed(2);
    };

    this.setCart = function (cart) {
        this.$cart = cart;
        return this.getCart();
    };

    this.getCart = function(){
        return this.$cart;
    };

    this.getItems = function(){
        return this.getCart().items;
    };

    this.getSelectedItems = function(){
        return this.getCart().selectedItems;
    };

    this.getTotalItems = function () {
        var count = 0;
        var items = this.getItems();
        angular.forEach(items, function (item) {
            count += item.getQuantity();
        });
        return count;
    };

    this.getTotalSelectedItems = function () {
        var count = 0;
        var items = this.getSelectedItems();
        angular.forEach(items, function (item) {
            count += item.getQuantity();
        });
        return count;
    };

    this.getTotalUniqueItems = function () {
        return this.getCart().items.length;
    };

    this.getSubTotal = function(){
        var total = 0;
        angular.forEach(this.getCart().selectedItems, function (item) {
            total += item.getTotal();
        });
        return +parseFloat(total).toFixed(2);
    };

    this.totalCost = function () {
        return +parseFloat(this.getSubTotal() + this.getShipping() + this.getTax()).toFixed(2);
    };

    this.removeItemById = function (id) {
        var _self = this;
        var cart = this.getCart();
        angular.forEach(cart.items, function (item, index) {
            if  (item.getId() === id) {
                cart.items.splice(index, 1);
            }
        });
        $http.post(ENV.SERVER_URL + '/api/cart/entry/delete', {
            'skus': [id]
        }).success(function(data){
            _self.$loadCart(res.cart);
        });

        $rootScope.$broadcast('ngCart:change', "商品已从购物车清除");
    };

    this.removeSelectedItemById = function (id) {
        var cart = this.getCart();
        angular.forEach(cart.selectedItems, function (item, index) {
            if  (item.getId() === id) {
                cart.selectedItems.splice(index, 1);
            }
        });
        this.setCart(cart);
    };

    this.empty = function () {

        $rootScope.$broadcast('ngCart:change', "已成功清空购物车");
        this.$cart.items = [];
        localStorage.removeItem('cart');
    };

    this.isEmpty = function () {

        return (this.$cart.items.length > 0 ? false : true);

    };

    this.selectedItemsObjects = function() {

        if (this.getSelectedItems().length === 0) return false;

        var selectedItems = [];
        angular.forEach(this.getSelectedItems(), function(item, index){
            selectedItems.push({'item_id': item._data.item.item_id,
                                'sku': item._id,
                                'quantity': item._quantity});
        });

        return selectedItems;

    };

    this.toObject = function() {

        if (this.getSelectedItems().length === 0) return false;

        var items = [];
        angular.forEach(this.getSelectedItems(), function(item){
            items.push (item.toObject());
        });

        return {
            shipping: this.getShipping(),
            tax: this.getTax(),
            taxRate: this.getTaxRate(),
            subTotal: this.getSubTotal(),
            totalCost: this.totalCost(),
            items: items
        };
    };


    this.$restore = function(storedCart){
        var _self = this;
        _self.init();
        angular.forEach(storedCart.items, function (item) {
            _self.$cart.items.push(new ngCartItem(item._id,  item._name, item._price, item._quantity, item._data));
        });
        this.$save();
    };

    this.$loadCart = function(cart){
        var _self = this;
        _self.init();
        angular.forEach(cart, function (item) {
            _self.$cart.items.push(new ngCartItem(item.spec.sku,  item.item.title, item.unit_price, item.quantity, item));
        });
        this.$save();
    };

    this.$save = function () {
        return Storage.set('cart', this.getCart());
    };

}])
.service('ngCartItem', ['$rootScope', '$log', function($rootScope, $log) {

    var item = function (id, name, price, quantity, data) {
        this.setId(id);
        this.setName(name);
        this.setPrice(price);
        this.setQuantity(quantity);
        this.setData(data);
    };


    item.prototype.setId = function(id){
        if (id)  this._id = id;
        else {
            $log.error('An ID must be provided');
        }
    };

    item.prototype.getId = function(){
        return this._id;
    };


    item.prototype.setName = function(name){
        if (name)  this._name = name;
        else {
            $log.error('A name must be provided');
        }
    };
    item.prototype.getName = function(){
        return this._name;
    };

    item.prototype.setPrice = function(price){
        var priceFloat = parseFloat(price);
        if (priceFloat) {
            if (priceFloat <= 0) {
                $log.error('A price must be over 0');
            } else {
                this._price = (priceFloat);
            }
        } else {
            $log.error('A price must be provided');
        }
    };
    item.prototype.getPrice = function(){
        return this._price;
    };


    item.prototype.setQuantity = function(quantity, relative){

        var quantityInt = parseInt(quantity);
        if (quantityInt % 1 === 0){
            if (relative === true){
                this._quantity  += quantityInt;
            } else {
                this._quantity = quantityInt;
            }
            if (this._quantity < 1) this._quantity = 1;
            if (this._quantity >= 5) this._quantity = 5;

        } else {
            this._quantity = 1;
            $log.info('Quantity must be an integer and was defaulted to 1');
        }
        //$rootScope.$broadcast('ngCart:change', {});

    };

    item.prototype.getQuantity = function(){
        return this._quantity;
    };

    item.prototype.setData = function(data){
        if (data) this._data = data;
    };

    item.prototype.getData = function(){
        if (this._data) return this._data;
        else $log.info('This item has no data');
    };


    item.prototype.getTotal = function(){
        return +parseFloat(this.getQuantity() * this.getPrice()).toFixed(2);
    };

    item.prototype.toObject = function() {
        return {
            id: this.getId(),
            name: this.getName(),
            price: this.getPrice(),
            quantity: this.getQuantity(),
            data: this.getData(),
            total: this.getTotal()
        };
    };
    return item;
}])
.service('fulfilmentProvider', ['ngCart', '$rootScope', 'fulfilmentNewOrder', 'fulfilmentTransferOrder', 'fulfilmentExistedOrder', function(ngCart, $rootScope, fulfilmentNewOrder,
            fulfilmentTransferOrder, fulfilmentExistedOrder){

    this._obj = {
        service : undefined,
        settings : undefined
    };

    this.setService = function(service){
        this._obj.service = service;
    };

    this.setSettings = function(settings){
        this._obj.settings = settings;
    };

    this.checkout = function(){
        if (this._obj.settings.order_type == 'new'){
            if (ngCart.getAddress().id === undefined){
                $rootScope.$broadcast('ngCart:change', "请添加地址");
                return ;
            }
            if (this._obj.settings.logistic_provider === undefined){
                $rootScope.$broadcast('ngCart:change', "请选择运输方式");
                return ;
            }
            var provider = fulfilmentNewOrder;
        } else if (this._obj.settings.order_type == 'transfer') {
            if (ngCart.getAddress().id === undefined){
                $rootScope.$broadcast('ngCart:change', "请添加地址");
                return ;
            }
            if (this._obj.settings.logistic_provider === undefined){
                $rootScope.$broadcast('ngCart:change', "请选择运输方式");
                return ;
            }

            var provider = fulfilmentTransferOrder;
        } else if (this._obj.settings.order_type == 'existed') {
            var provider = fulfilmentExistedOrder;
        }
        return provider.checkout(this._obj.service, this._obj.settings);
    };

}])

.service('fulfilmentNewOrder', ['$rootScope', '$http', 'ngCart', 'ENV', '$injector', function($rootScope, $http, ngCart, ENV, $injector){

    this.checkout = function(service, settings) {

        $rootScope.$broadcast('alertStart', "正在处理，请稍等..");
        return $http.post(ENV.SERVER_URL+'/api/orders/create_order', {
                'entries': ngCart.selectedItemsObjects(),
                'address_id': ngCart.getAddress().id,
                'coupon_codes': settings.coupon? [settings.coupon]: [],
                'logistic_provider': settings.logistic_provider,
            }).then(function(res) {
                var provider = $injector.get('fulfilment_'+ service);
                provider.checkout(res.data);

            }, function() {
                $rootScope.$broadcast('alertEnd');
                $rootScope.$broadcast('alert', "sorry...something wrong(1)..");
            });
    };
}])

.service('fulfilmentExistedOrder', ['$rootScope', '$http', 'ngCart', 'ENV', '$injector', function($rootScope, $http, ngCart, ENV, $injector){

    this.checkout = function(service, settings) {
        $rootScope.$broadcast('alertStart', "正在处理，请稍等..");

        var provider = $injector.get('fulfilment_'+ service);
        return provider.checkout(settings);
    };
}])

.service('fulfilmentTransferOrder', ['$rootScope', '$http', 'ngCart', 'ENV', '$injector', function($rootScope, $http, ngCart, ENV, $injector){

    this.checkout = function(service, settings) {

        $rootScope.$broadcast('alertStart', "正在处理，请稍等..");
        return $http.post(ENV.SERVER_URL+'/api/orders/update_transfer_order', {
                'order_id': settings.order_id,
                'address_id': ngCart.getAddress().id,
                'coupon_codes': settings.coupon? [settings.coupon]: [],
                'logistic_provider': settings.logistic_provider,
            }).then(function(res) {
                var provider = $injector.get('fulfilment_'+ service);
                provider.checkout(res.data);

            }, function() {
                $rootScope.$broadcast('alertEnd');
                $rootScope.$broadcast('alert', "sorry...something wrong(1)..");
            });
    };
}])

.service('fulfilment_paypal', ['$rootScope', '$http', 'PaypalService', 'ENV', '$state', '$timeout', function($rootScope, $http, PaypalService, ENV, $state, $timeout){

    this.checkout = function(data) {
        $rootScope.$broadcast('alertEnd');
        var subject = "Maybi Order "+data.order.sid;
        PaypalService.initPaymentUI().then(function () {
            PaypalService.makePayment(data.order.final, subject)
                .then(function(payment) {
                    $http.post(ENV.SERVER_URL+'/payment/paypal/notify', {
                        payment: payment,
                        order_id: data.order_id,
                    }).success(function(res) {
                        if (res.message == "OK") {
                            $rootScope.$broadcast('alert', "支付成功");
                            $timeout(function () {
                                $state.go('tab.order_detail', {order_id: data.order_id}, {reload: true})
                            }, 1000);
                        } else {
                            $rootScope.$broadcast('alert', "支付失败");
                        }
                    }).error(function (error){
                        $rootScope.$broadcast('alert', "系统好像出问题。。");
                    });

                }).catch(function (error) {
                    $rootScope.$broadcast('alert', error);
                })
        });


    };
}])

.service('fulfilment_wechat', ['$rootScope', '$http', 'ENV', '$state', '$timeout', function($rootScope, $http, ENV, $state, $timeout){

    this.checkout = function(data) {

        $http.post(ENV.SERVER_URL+'/payment/checkout/sdk/'+data.order_id, {
            'payment_method': 'wechat',
        }).then(function(r) {
            $rootScope.$broadcast('alertEnd');
            var res = r.data.data;
            var params = {
                mch_id: res.partnerid, // merchant id
                prepay_id: res.prepayid, // prepay id
                nonce: res.noncestr, // nonce
                timestamp: res.timestamp, // timestamp
                sign: res.sign, // signed string
            };

            Wechat.sendPaymentRequest(params, function () {
                $rootScope.$broadcast('alert', "支付成功");
                $timeout(function () {
                    $state.go('tab.order_detail', {order_id: data.order_id}, {reload: true})
                }, 1000);
            }, function (reason) {
                $rootScope.$broadcast('alert', "Failed: " + reason);
            });

        }, function(){
            $rootScope.$broadcast('alertEnd');
            $rootScope.$broadcast('alert', "oppps...something wrong(2)..");
        });

    };
}])

.factory('PaypalService', ['$q', '$ionicPlatform', 'paypalSettings', '$filter', '$timeout', function($q, $ionicPlatform, paypalSettings, $filter, $timeout) {

    var init_defer;
    /**
     * Service object
     * @type object
     */
    var service = {
        initPaymentUI: initPaymentUI,
        createPayment: createPayment,
        configuration: configuration,
        onPayPalMobileInit: onPayPalMobileInit,
        makePayment: makePayment
    };


    /**
     * @ngdoc method
     * @name initPaymentUI
     * @methodOf app.PaypalService
     * @description
     * Inits the payapl ui with certain envs.
     *
     *
     * @returns {object} Promise paypal ui init done
     */
    function initPaymentUI() {

        init_defer = $q.defer();
        $ionicPlatform.ready().then(function () {

            var clientIDs = {
                "PayPalEnvironmentProduction": paypalSettings.PAYPAL_LIVE_CLIENT_ID,
                "PayPalEnvironmentSandbox": paypalSettings.PAYPAL_SANDBOX_CLIENT_ID
            };
            PayPalMobile.init(clientIDs, onPayPalMobileInit);
        });

        return init_defer.promise;

    }


    /**
     * @ngdoc method
     * @name createPayment
     * @methodOf app.PaypalService
     * @param {string|number} total total sum. Pattern 12.23
     * @param {string} name name of the item in paypal
     * @description
     * Creates a paypal payment object
     *
     *
     * @returns {object} PayPalPaymentObject
     */
    function createPayment(total, name) {

        // "Sale  == >  immediate payment
        // "Auth" for payment authorization only, to be captured separately at a later time.
        // "Order" for taking an order, with authorization and capture to be done separately at a later time.
        var payment = new PayPalPayment("" + total, "USD", "" + name, "Sale");
        return payment;
    }

    /**
     * @ngdoc method
     * @name configuration
     * @methodOf app.PaypalService
     * @description
     * Helper to create a paypal configuration object
     *
     *
     * @returns {object} PayPal configuration
     */
    function configuration() {
        // for more options see `paypal-mobile-js-helper.js`
        var config = new PayPalConfiguration({
            merchantName: paypalSettings.ShopName,
            merchantPrivacyPolicyURL: paypalSettings.MerchantPrivacyPolicyURL,
            merchantUserAgreementURL: paypalSettings.MerchantUserAgreementURL
        });
        return config;
    }

    function onPayPalMobileInit() {
        $ionicPlatform.ready().then(function () {
            // must be called
            // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
            PayPalMobile.prepareToRender(paypalSettings.ENV, configuration(), function () {

                $timeout(function () {
                    init_defer.resolve();
                });

            });
        });
    }

    /**
     * @ngdoc method
     * @name makePayment
     * @methodOf app.PaypalService
     * @param {string|number} total total sum. Pattern 12.23
     * @param {string} name name of the item in paypal
     * @description
     * Performs a paypal single payment
     *
     *
     * @returns {object} Promise gets resolved on successful payment, rejected on error
     */
    function makePayment(total, name) {

        var defer = $q.defer();
        total = $filter('number')(total, 2);
        $ionicPlatform.ready().then(function () {
            PayPalMobile.renderSinglePaymentUI(createPayment(total, name), function (result) {
                $timeout(function () {
                    defer.resolve(result);
                });
            }, function (error) {
                $timeout(function () {
                    defer.reject(error);
                });
            });
        });

        return defer.promise;
    }

    return service;
}])

.factory("appUpdateService", ['$ionicPopup', '$timeout', '$ionicLoading', function ($ionicPopup, $timeout, $ionicLoading) {
    var version;
    var deploy = new Ionic.Deploy();

    /**
     * 检查更新
     */
    function checkUpdate() {
        $ionicLoading.show({
            template: '正在检查更新...',
            animation: 'fade-in',
            showBackdrop: true,
            duration: 3000,
            showDelay: 0
        });

        deploy.check().then(function(hasUpdate) {

            if (hasUpdate) {
                showUpdateConfirm();
            } else {
                console.log('already nb');
            }
        }, function (err) {
            console.log(err);

        });
    }

    function showUpdateConfirm() {
        $ionicLoading.hide();
        var confirmPopup = $ionicPopup.confirm({
            title: '版本升级',
            cssClass: 'text-center',
            template: "有新的版本了,是否要升级?",
            cancelText: '取消',
            okText: '升级'
        });
        confirmPopup.then(function (res) {
            $ionicLoading.show({
                template: '正在更新...',
                animation: 'fade-in',
                showBackdrop: true,
                //duration: 2000,
                showDelay: 0
            });

            if (res) {
                deploy.update().then(function(res) {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: '更新成功!',
                        animation: 'fade-in',
                        showBackdrop: true,
                        duration: 2000,
                        showDelay: 0
                    });
                }, function (err) {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: '更新失败!' + err,
                        animation: 'fade-in',
                        showBackdrop: true,
                        duration: 2000,
                        showDelay: 0
                    });
                }, function (prog) {
                    $ionicLoading.show({
                        template: "已经下载：" + parseInt(prog) + "%"
                    });
                });
            } else {
                $ionicLoading.hide();
            }
        });
    };

    function getAppVersion() {

        deploy.info().then(function (data) {
            var binaryVersion = data.binary_version;
            var deployUuid = data.deploy_uuid;
            version = deployUuid != 'NO_DEPLOY_LABEL' ? deployUuid : binaryVersion;
        });
    }



    return {
        getVersions: function () {
            getAppVersion();
            return version;
        },
        checkUpdate: function () {
            checkUpdate();
        },

        update: function () {
            showUpdateConfirm();
        }
    }
}])

.factory('Notification', ['ENV', '$http', '$log', '$q', '$rootScope', 'Storage', function(ENV, $http, $log, $q, $rootScope, Storage) {
    // 用来存储话题类别的数据结构，包含了下一页、是否有下一页等属性
    var notices= [];
    var hasNextPage = true;
    var perPage = 20;
    var page = 0;
    var isEmpty = false;

    return {
        getNotices: function (page) {
            var deferred = $q.defer();
            hasNextPage = true;
            isEmpty = false;

            $http.get(ENV.SERVER_URL + '/api/post/activities', {
                params: {
                    page: page,
                    per_page: perPage,
                }
            }).success(function(r, status) {
                if (status === 200 && r.message == "OK"){
                    if (r.notices.length < perPage) {
                        hasNextPage = false;
                    }
                    if (page==0 && r.notices.length === 0) {
                        isEmpty = true;
                    }
                    deferred.resolve(r);
                } else {
                    deferred.reject();
                }
            }).error(function (data){
                deferred.reject();
            });
            return deferred.promise;
        },

        hasNextPage: function() {
            return hasNextPage;
        },

        isEmpty: function() {
            return isEmpty;
        },

    };
}])

.factory('Board', ['ENV', '$http', '$log', '$q', '$rootScope', 'Storage', function(ENV, $http, $log, $q, $rootScope, Storage) {
    // 用来存储话题类别的数据结构，包含了下一页、是否有下一页等属性
    var notices= [];
    var hasNextPage = true;
    var perPage = 5;
    var page = 0;
    var isEmpty = false;

    return {
        getBoards: function (page) {
            var deferred = $q.defer();
            hasNextPage = true;
            isEmpty = false;

            $http.get(ENV.SERVER_URL + '/api/boards', {
                params: {
                    page: page,
                    per_page: perPage,
                }
            }).success(function(r, status) {
                if (status === 200 && r.message == "OK"){
                    if (r.boards.length < perPage) {
                        hasNextPage = false;
                    }
                    if (page==0 && r.boards.length === 0) {
                        isEmpty = true;
                    }
                    deferred.resolve(r);
                } else {
                    deferred.reject();
                }
            }).error(function (data){
                deferred.reject();
            });
            return deferred.promise;
        },

        hasNextPage: function() {
            return hasNextPage;
        },

        isEmpty: function() {
            return isEmpty;
        },

    };
}])

.factory('JPush', ['ENV', '$http', '$log', '$q', '$rootScope', 'appUpdateService', function(ENV, $http, $log, $q, $rootScope, appUpdateService) {
    return {
        onOpenNotification: onOpenNotification,
        onReceiveNotification: onReceiveNotification,
        onReceiveMessage: onReceiveMessage
    }

        // push notification callback
    function onOpenNotification(event) {
        try {
            var alertContent;
            if (ionic.Platform.platform() == "Android") {
                alertContent = window.plugins.jPushPlugin.openNotification.alert;
            } else {
                alertContent = event.aps.alert;
            }
            console.log("open Notificaiton:" + alertContent);
        }
        catch (exception) {
            console.log("JPushPlugin:onOpenNotification" + exception);
        }
    }
    function onReceiveNotification(event) {
        try {
            var alertContent;
            if (ionic.Platform.platform() == "Android") {
                alertContent = window.plugins.jPushPlugin.receiveNotification.alert;
            } else {
                alertContent = event.aps.alert;
            }
            console.log("receive Notificaiton:" + alertContent);
        }
        catch (exeption) {
            console.log(exception)
        }
    }
    function onReceiveMessage (event) {
        try {
            var message;
            if (ionic.Platform.platform() == "Android") {
                message = window.plugins.jPushPlugin.receiveMessage.message;
            } else {
                message = event.content;
            }
            console.log("receive message:" + message);
            if (message == 'update') {
                appUpdateService.checkUpdate();
            }
        }
        catch (exception) {
            console.log("JPushPlugin:onReceiveMessage-->" + exception);
        }
    }

}])

"use strict";

angular.module('maybi.directives', [])

.directive('ngcartAddtocart', ['ngCart', function(ngCart){
    return {
        restrict : 'E',
        scope: {
            id:'@',
            name:'@',
            quantity:'@',
            quantityMax:'@',
            price:'@',
            data:'='
        },
        transclude: true,
        templateUrl: function(element, attrs) {
            if ( typeof attrs.templateUrl == 'undefined' ) {
                return 'ngCart/addtocart.html';
            } else {
                return attrs.templateUrl;
            }
        },
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;
            scope.attrs = attrs;
            scope.inCart = function(){
                return  ngCart.getItemById(attrs.id);
            };

            if (scope.inCart()){
                scope.q = ngCart.getItemById(attrs.id).getQuantity();
            } else {
                scope.q = parseInt(scope.quantity);
            }

            scope.qtyOpt =  [];
            for (var i = 1; i <= scope.quantityMax; i++) {
                scope.qtyOpt.push(i);
            }

            scope.alertWarning = function() {
                scope.$emit('alert', '请选择有效商品');
            };
        }
    };
}])

.directive('ngcartSummary', ['ngCart', function(ngCart){
    return {
        restrict : 'E',
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;
        },
        scope: {},
        transclude: true,
        templateUrl: function(element, attrs) {
            if ( typeof attrs.templateUrl == 'undefined' ) {
                return 'ngCart/summary.html';
            } else {
                return attrs.templateUrl;
            }
        }
    };
}])

.directive('ngcartCheckout', ['ngCart', 'fulfilmentProvider', '$timeout', '$ionicActionSheet', function(ngCart, fulfilmentProvider, $timeout, $ionicActionSheet){
    return {
        restrict : 'E',
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;

            scope.showPaymentMethods = function() {

              var sheet = {};
              sheet.buttonClicked = buttonClicked;
              sheet.buttons = [{
                text: '<i class="icon fa fa-paypal"></i> Paypal支付$'
              }, {
                text: '<i class="icon fa fa-wechat"></i> 微信支付￥'
              }];

              $ionicActionSheet.show(sheet);

              function buttonClicked(index) {
                var service = { 0: 'paypal', 1: 'wechat'}

                fulfilmentProvider.setService(service[index]);
                fulfilmentProvider.setSettings(scope.settings);
                fulfilmentProvider.checkout()
              }
            };

        },
        scope: {
            settings:'=',
            show: '=',
        },
        replace: true,
        templateUrl: function(element, attrs) {
            if ( typeof attrs.templateUrl == 'undefined' ) {
                return 'ngCart/checkout.html';
            } else {
                return attrs.templateUrl;
            }
        }
    };
}])
.directive("zoomView", ['$compile', '$ionicModal', '$ionicPlatform', '$cordovaSocialSharing', function ($compile, $ionicModal, $ionicPlatform, $cordovaSocialSharing) {
    return {

      restrict: "A",

      link: function(scope, elem, attr) {

        $ionicPlatform.ready(function () {

          elem.attr("ng-click", "showZoomView()");
          elem.removeAttr("zoom-view");
          $compile(elem)(scope);

          var zoomViewTemplate = '<ion-modal-view class="zoom-view"><ion-header-bar>'+
              '<button ng-click="closeZoomView()" class="button button-clear button-light button-icon ion-ios-close-empty"></button></ion-header-bar>'+
              '<ion-content ng-click="closeZoomView()"><ion-scroll zooming="true" direction="xy" style="width: 100%; height: 100%; position: absolute; top: 0; bottom: 0; left: 0; right: 0; ">'+
              '<img ng-src="{{ngSrc}}" style="width: 100%!important; display:block; width: 100%; height: auto; max-width: 400px; max-height: 700px; margin: auto; padding: 10px; " />'+
              '</ion-scroll> </ion-content>'+
              '<ion-footer-bar><h1 class="title"></h1><button class="button button-light button-icon ion-ios-download-outline" ng-click="downloadFile()"></button></ion-footer-bar>'
              '</ion-modal-view>';

          scope.zoomViewModal = $ionicModal.fromTemplate(zoomViewTemplate, {
            scope: scope,
            animation: "slide-in-right"
          });

          scope.showZoomView = function () {
            scope.zoomViewModal.show();
            scope.ngSrc = attr.zoomSrc;
          };

          scope.closeZoomView = function () {
            scope.zoomViewModal.hide();
          };

          scope.downloadFile = function() {
            var message = "分享图片",
                subject = '分享',
                file = scope.ngSrc,
                link = "http://www.may.bi";

            $cordovaSocialSharing
              .share(message, subject, file, link) // Share via native share sheet
              .then(function(result) {
                console.log('result:' + result);
                // Success!
              }, function(err) {
                console.log('err:' + err);
                scope.broadcast('alert', err);
                // An error occured. Show a message to the user
              });
          }
        });
      }
    };
}])
.directive('showMore', ['$timeout', function($timeout){
    return {
        templateUrl: 'showMore.html',
        restrict: 'A',
        replace: true,
        scope: {
            'title': '=',
        },
        link: function(scope, element, attrs){

                var showMoreHeight = parseInt(attrs.showMore);

                scope.expanded = false;
                scope.expandable = false;

                $timeout(function(){
                    renderStyles();
                }, 300);
                scope.toggle = function(){
                    scope.expanded = !scope.expanded;

                };

                function renderStyles(){
                    var elementHeight = element.find('p')[0].offsetHeight;
                    if(elementHeight > showMoreHeight && scope.expanded === false){
                        scope.expandable = true;
                    }
                }

                scope.showLessStyle = {
                    'max-height': showMoreHeight + 'px',
                    'overflow': 'hidden',
                    'margin-bottom': '6px',
                };


        }
    };
}])

.directive('addressForm', ['$rootScope', '$ionicModal', 'FetchData', 'ngCart', '$state', function($rootScope, $ionicModal, FetchData, ngCart, $state){
    return {
        restrict : 'A',
        scope: {
            'addrId': '=',
            'addresses': '=',
        },
        link: function(scope, element, attrs){
            scope.ngCart = ngCart;
            scope.addr = {};

            var addr_id = scope.addrId;
            if (addr_id) {
                FetchData.get('/api/address/get/'+addr_id).then(function(data){
                    scope.addr= data.address;
                });
            }
            $ionicModal.fromTemplateUrl('add_address.html', {
                scope: scope,
                animation: 'slide-in-right'
            }).then(function (modal) {
                scope.addressModal = modal;
            });
            scope.closeModal = function(){
                scope.addressModal.hide();

            };

            element.bind('click', function(){
                scope.addressModal.show();
            })

            FetchData.get('/api/address/hierarchy').then(function(data){
                scope.COUNTRIES= data.countries;
            });
            scope.$watch('addr["country"]', function(new_val) {
                FetchData.get('/api/address/hierarchy/'+scope.addr.country).then(function(data) {
                    scope.REGIONS= data.regions;
                });
            });

            scope.ngCart = ngCart;
            scope.saveAddress = function(){
                if (addr_id) {
                    FetchData.post('/api/address/update/'+addr_id, {
                        'receiver': scope.addr.receiver,
                        'street1': scope.addr.street1,
                        'street2': scope.addr.street2,
                        'city': scope.addr.city,
                        'state': scope.addr.state,
                        'postcode': scope.addr.postcode,
                        'country': scope.addr.country,
                        'mobile_number': scope.addr.mobile_number,
                    }).then(function(data) {
                        scope.addressModal.hide();
                        $state.transitionTo($state.current, $state.$current.params, { reload: true, inherit: true, notify: true });
                    });
                } else {
                    FetchData.post('/api/address/add', {
                        'receiver': scope.addr.receiver,
                        'street1': scope.addr.street1,
                        'street2': scope.addr.street2,
                        'city': scope.addr.city,
                        'state': scope.addr.state,
                        'postcode': scope.addr.postcode,
                        'country': scope.addr.country,
                        'mobile_number': scope.addr.mobile_number,
                    }).then(function(data) {
                        scope.addressModal.hide();
                        $state.transitionTo($state.current, $state.$current.params, { reload: true, inherit: true, notify: true });

                    });

                }
            }

        },
    };
}])

.directive('followBtn', ['User', 'AuthService', function(User, AuthService){
    return {
        restrict : 'E',
        scope: {
            user:'=',
        },
        transclude: true,
        templateUrl: 'user/followButton.html',
        link: function(scope, element, attrs){
            scope.currentUserID = AuthService.getUser().id;

            scope.follow = function(){
                var user = AuthService.getUser();

                if (scope.user.is_following){
                    scope.user.is_following= false;
                    scope.user.num_followers -= 1;

                    User.unfollow(scope.user.id)
                        .then(function(data){
                            scope.$emit('alert', "已取消关注");
                        }).catch(function(error){
                            scope.user.is_following= true;
                            scope.user.num_followers += 1;
                        });
                } else {
                    scope.user.is_following = true;
                    scope.user.num_followers += 1;

                    User.follow(scope.user.id)
                        .then(function(data){
                            scope.$emit('alert', "关注成功");
                        }).catch(function(error){
                            scope.user.is_following = false;
                            scope.user.num_followers -= 1;

                        });
                }
            };
        }
    };
}])

.directive('headerShrink', ['$document', function($document) {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            var resizeFactor, blurFactor;
            var scrollContent = $element[0];
            var header = document.body.querySelector('.avatar-section');
            $scope.$on('userDetailContent.scroll', function(event,scrollView) {
                var y = scrollView.__scrollTop;
                if (y >= 0) {
                  header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + Math.min(148, y) + 'px, 0)';
                  scrollContent.style.top = Math.max(64, 250 - y) + 'px';
                }
            });
        }
    }
}])

.directive('itemCarousel', ['$state', function($state) {
    return {
        restrict: 'E',
        scope: {
            board: '='
        },
        templateUrl: 'itemCarousel.html',
        link: function (scope, elem, attrs) {
            scope.items = scope.board.items;

            scope.goItem = function(item_id) {
                $state.go('tab.item', {itemID: item_id});
            };

            scope.goBoard= function(item_id) {
                $state.go('tab.board', {'boardID': scope.board.id})
            };


        }
    };
}])

"use strict";

angular.module('maybi.constants', [])

.constant("$ionicLoadingConfig", {
    "template": "请求中..."
})
.constant("Categories", {
    '':"全部",
    'food':"食品",
    'home':"家居",
    'clothes':"服饰",
    'accessories': "配饰",
    'electronics': "数码",
    'office and school supplies': "办公文具",
    'sports': "休闲健身",
})
.constant("ENV", {
    "DEBUG": false,
    //"FIREBASE_URL": "http://sizzling-inferno-6138.firebaseIO.com/",
    //"SERVER_URL": "http://127.0.0.1:8890",
    "SERVER_URL": "http://api.maybi.cn",
})
.constant("paypalSettings", {
    "PAYPAL_LIVE_CLIENT_ID": "",
    "PAYPAL_SANDBOX_CLIENT_ID": "",
    "ENV": "PayPalEnvironmentProduction",// PayPalEnvironmentProduction, PayPalEnvironmentSandbox
    "ShopName": "Maybi Shop",
    "MerchantPrivacyPolicyURL": "",
    "MerchantUserAgreementURL": "",

})

"use strict";

angular.module('maybi.filters', [])

.filter('reverse', function() {
    return function(items) {
        if (!angular.isArray(items)) return false;
        return items.slice().reverse();
    };
})

.filter('nl2br', ['$sce', function($sce){
    return function(msg,is_xhtml) {
        var is_xhtml = is_xhtml || true;
        var breakTag = (is_xhtml) ? '<br />' : '<br>';
        var msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
        return $sce.trustAsHtml(msg);
    }
}])

angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("about.html","<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">关于我们</div>\r\n  </div>\r\n  <ion-content class=\"has-header account\">\r\n    <ion-list>\r\n        <div class=\"about\">\r\n          <div class=\"logo\"></div>\r\n        </div>\r\n\r\n      <ion-item class=\"item item-icon-left\">\r\n          <i class=\"icon ion-ios-flag\"></i>\r\n          版本号\r\n          <span class=\"item-note\">\r\n              {{appUpdateService.getVersions()}}\r\n          </span>\r\n      </ion-item>\r\n      <ion-item class=\"item item-icon-left item-icon-right\" ng-click=\"$state.go(\'intro\')\">\r\n          <i class=\"icon ion-ios-information-empty\"></i>\r\n          介绍页\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item item-icon-left item-icon-right\"\r\n          onclick=\"window.open(\'http://may.bi/#/faq\', \'_blank\', \'location=no,toolbarposition=top,closebuttoncaption=关闭\')\">\r\n          <i class=\"icon ion-ios-help-outline\"></i>\r\n          常见问题\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item item-icon-left item-icon-right\"\r\n          onclick=\"window.open(\'http://may.bi/#/customer-service\', \'_blank\', \'location=no,toolbarposition=top,closebuttoncaption=关闭\')\">\r\n          <i class=\"icon ion-ios-chatboxes\"></i>\r\n          联系客服\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item item-icon-left item-icon-right\"\r\n          ng-click=\"$state.go(\'tab.feedback\')\">\r\n          <i class=\"icon ion-ios-compose-outline\"></i>\r\n          意见反馈\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item item-icon-left item-icon-right\"\r\n          onclick=\"window.open(\'itms-apps://itunes.apple.com/app/id1080870817\', \'_system\')\" ng-if=\"platform.isIOS()\">\r\n          <i class=\"icon ion-bag\"></i>\r\n          评分鼓励\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <div class=\"copyright\">\r\n        <p>Copyright @ 2015</p>\r\n        <p>深圳市美比科技有限公司</p>\r\n\r\n      </div>\r\n    </ion-list>\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("account.html","<ion-view>\r\n    <div class=\"buttons\">\r\n        <button class=\"button button-clear icon ion-ios-gear account-setting-btn pull-right\"\r\n            ng-click=\"$state.go(\'tab.settings\')\" ng-if=\"user.getUser().name\"></button>\r\n    </div>\r\n    <div class=\"avatar-section\">\r\n        <div ng-if=\"user.getUser().name\">\r\n            <a class=\"logo\" ng-click=\"$state.go(\'tab.profile\')\"\r\n                style=\"background: url({{user.getUser().avatar_url}}) center no-repeat; background-size: cover\">\r\n            </a>\r\n            <div class=\"avatar-wrap\">\r\n                <p><img class=\"avatar\" ng-src=\"{{user.getUser().avatar_url}}\" alt=\"\"></p>\r\n                <p ng-if=\"user.getUser().name\" class=\"user\">{{user.getUser().name}}</p>\r\n            </div>\r\n            <div class=\"social-btns\">\r\n                <a ng-href=\"#/myuserList/{{user.getUser().id}}/followers\">\r\n                    <strong>{{user.getUser().num_followers}} </strong>粉丝\r\n                </a>\r\n                <a ng-href=\"#/myuserList/{{user.getUser().id}}/followings\">\r\n                    <strong>{{user.getUser().num_followings}} </strong>关注\r\n                </a>\r\n            </div>\r\n        </div>\r\n        <div ng-click=\"showAuthBox()\" ng-if=\"!user.getUser().name\">\r\n            <a\r\n                class=\"logo\"\r\n                style=\"background: url(img/b7.jpg) center no-repeat; background-size: cover\">\r\n            </a>\r\n            <div class=\"avatar-wrap\">\r\n                <p><img class=\"avatar\" ng-src=\"{{user.getUser().avatar_url}}\" alt=\"\"></p>\r\n                <p ng-if=\"!user.getUser().name\" class=\"login-btn\">登陆</p>\r\n            </div>\r\n         </div>\r\n\r\n    </div>\r\n\r\n  <ion-content class=\"account-view\" style=\"top:250px\" overflow-scroll=\'false\' delegate-handle=\"userDetailContent\" on-scroll=\"onUserDetailContentScroll()\" header-shrink scroll-event-interval=\"5\">\r\n    <ion-list>\r\n      <div class=\"button-bar bar-light icon-top\">\r\n          <button class=\"button button-icon\" ng-click=\"$state.go(\'tab.cart\')\">\r\n              <i class=\"icon ion-ios-cart\"></i>\r\n              购物车\r\n          </button>\r\n          <button class=\"button button-icon\" ng-click=\"$state.go(\'tab.orders\')\">\r\n              <i class=\"icon ion-ios-paper-outline\"></i>\r\n              订单\r\n          </button>\r\n          <button class=\"button button-icon\" ng-click=\"$state.go(\'tab.coupons\')\">\r\n              <i class=\"icon ion-ios-pricetags\"></i>\r\n              折扣券\r\n          </button>\r\n      </div>\r\n\r\n      <div class=\"item item-divider\"></div>\r\n\r\n      <div class=\"button-bar bar-light switch-bar\">\r\n          <button class=\"button button-icon\" ng-click=\"switchListStyle(\'grid\')\"\r\n              ng-class=\"gridStyle==\'grid\'? \'active\': \'\'\">\r\n              <i class=\"icon ion-grid\"></i>\r\n          </button>\r\n          <button class=\"button button-icon\" ng-click=\"switchListStyle(\'list\')\"\r\n              ng-class=\"gridStyle==\'list\'? \'active\': \'\'\">\r\n              <i class=\"icon ion-navicon\"></i>\r\n          </button>\r\n      </div>\r\n\r\n    </ion-list>\r\n\r\n    <ion-refresher\r\n        pulling-text=\"下拉刷新...\"\r\n        on-refresh=\"doRefresh()\"\r\n        spinner=\"spiral\">\r\n    </ion-refresher>\r\n    <div class=\"view-post\">\r\n        <div class=\"list card \" ng-if=\"gridStyle == \'list\'\"\r\n            ng-repeat=\"post in posts track by $index\">\r\n            <photo-list post=\"post\" with-affix=\"false\"></photo-list>\r\n        </div>\r\n        <div class=\"\" ng-if=\"gridStyle==\'grid\'\">\r\n            <div class=\"col col-33 grid-image\" ng-repeat=\"post in posts track by $index\">\r\n                <img ng-src=\"{{::post.small_url}}\" ng-click=\"zoom(post.primary_image)\">\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"center-ico\" ng-if=\"isEmpty()\" style=\" margin-top: 20px;\">\r\n            <i class=\"icon ion-ios-camera\" style=\"font-size: 80pt;\"\r\n                ng-click=\"togglePhotoModal()\"></i>\r\n\r\n            <h1 >发布一条心情<br>出来露个脸呗</h1>\r\n        </div>\r\n\r\n        <ion-infinite-scroll\r\n            on-infinite=\"loadMore()\"\r\n            distance=\"1\"\r\n            spinner=\'spiral\'\r\n            ng-if=\"moreDataCanBeLoaded()\">\r\n        </ion-infinite-scroll>\r\n    </div>\r\n\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("address.html","<!-- 地址栏 -->\r\n<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">选择地址</div>\r\n      <button class=\"button button-clear button-dark icon\"\r\n          ng-class=\"editShown?\'ion-ios-color-wand-outline\': \'ion-ios-trash-outline\'\"\r\n          ng-click=\"toggleEditShown()\"></button>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\">\r\n<section>\r\n<div class=\"address-select-info\" ng-show=\"addresses.length != 0\">\r\n    <div class=\"address-row\" ng-repeat=\"addr in addresses\"\r\n        ng-click=\"selectAddress(addr)\">\r\n        <span class=\"addr-icon\"></span>\r\n        <div class=\"address-info\">\r\n            <div class=\"\">{{addr.receiver}}</div>\r\n            <div class=\"\">{{addr.street1}}</div>\r\n            <div class=\"\">{{addr.street2}}</div>\r\n            <div class=\"\">{{addr.city}}, {{addr.state}}</div>\r\n            <div class=\"\">{{addr.country}}, {{addr.postcode}}</div>\r\n        </div>\r\n        <div ng-hide=\"editShown\">\r\n            <span class=\"address-edit\">\r\n                <a address-form addr-id=\"addr.id\">修改地址</a>\r\n            </span>\r\n            <span class=\"select-icon select\"\r\n                ng-class=\"{\'selected\': selectedAddress == addr}\">\r\n            </span>\r\n        </div>\r\n        <div  ng-show=\"editShown\">\r\n            <span class=\"close-icon\" ng-click=\"removeAddr(addr.id)\">\r\n        </div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n<section>\r\n<div class=\"address-select-info\" address-form>\r\n    <div class=\"address-row\">\r\n        <span class=\"addr-icon\"></span>\r\n        <div class=\"address-info\">\r\n            <div class=\"\">新增收件地址</div>\r\n        </div>\r\n        <div class=\"go-add\">+</div>\r\n    </div>\r\n\r\n</div>\r\n</section>\r\n\r\n  </ion-content>\r\n\r\n    <ion-footer-bar class=\"bar-assertive footer-button\" ng-click=\"confirmAddress()\" >\r\n        <div class=\"title\">确定</div>\r\n    </ion-footer-bar>\r\n</ion-view>\r\n");
$templateCache.put("address_list.html","<!-- 地址栏 -->\r\n<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">地址管理</div>\r\n      <button class=\"button button-clear button-dark icon\"\r\n          ng-class=\"editShown?\'ion-ios-color-wand-outline\': \'ion-ios-trash-outline\'\"\r\n          ng-click=\"toggleEditShown()\"></button>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\">\r\n\r\n<section>\r\n<div class=\"address-select-info\" ng-show=\"addresses.length != 0\">\r\n    <div class=\"address-row\" ng-repeat=\"addr in addresses track by $index\">\r\n        <span class=\"addr-icon\"></span>\r\n        <div class=\"address-info\">\r\n            <div class=\"\">{{addr.receiver}}</div>\r\n            <div class=\"\">{{addr.street1}}</div>\r\n            <div class=\"\">{{addr.street2}}</div>\r\n            <div class=\"\">{{addr.city}}, {{addr.state}}</div>\r\n            <div class=\"\">{{addr.country}}, {{addr.postcode}}</div>\r\n        </div>\r\n        <div ng-hide=\"editShown\">\r\n            <span class=\"address-edit\">\r\n                <a href address-form addr-id=\"addr.id\">修改地址</a>\r\n            </span>\r\n        </div>\r\n        <div  ng-show=\"editShown\">\r\n            <span class=\"close-icon\" ng-click=\"removeAddr(addr.id)\">\r\n        </div>\r\n    </div>\r\n</div>\r\n</section>\r\n<section>\r\n<div class=\"address-select-info\" address-form >\r\n    <div class=\"address-row\">\r\n        <span class=\"addr-icon\"></span>\r\n        <div class=\"address-info\">\r\n            <div class=\"\">新增收件地址</div>\r\n        </div>\r\n        <div class=\"go-add\">+</div>\r\n    </div>\r\n\r\n</div>\r\n</section>\r\n\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("add_address.html","<!-- 添加地址 -->\r\n<ion-modal-view >\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"closeModal()\"></button>\r\n      <div class=\"title\">编辑地址</div>\r\n      <button class=\"button button-clear button-dark\" ng-click=\"saveAddress()\">\r\n          保存\r\n      </button>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\" style=\"overflow-y:hidden;\">\r\n\r\n<section>\r\n<form name=\"addressForm\" class=\"addressForm\">\r\n\r\n    <div class=\"list\">\r\n        <label class=\"item item-input\">\r\n            <div class=\"input-label\" ng-class=\"{\'warning\': addressForm.receiver.$error.required && !addressForm.receiver.$pristine}\">\r\n                收件人全称\r\n            </div>\r\n            <input type=\"text\" ng-model=\"addr.receiver\" name=\"receiver\" required />\r\n        </label>\r\n        <label class=\"item item-input item-select\">\r\n            <div class=\"input-label\" ng-class=\"addressForm.country.$error.required && !addressForm.country.$pristine\">\r\n                国家\r\n            </div>\r\n            <select ng-model=\"addr.country\" name=\"country\" required>\r\n                <option ng-selected=\"addr.country== k\" value=\"{{k}}\" ng-repeat=\"k in COUNTRIES\">{{k}}</option>\r\n            </select>\r\n        </label>\r\n        <label class=\"item item-input\">\r\n            <div class=\"input-label\" ng-class=\"{\'warning\': addressForm.street1.$error.required && !addressForm.street1.$pristine}\">\r\n                地址 1\r\n            </div>\r\n            <input type=\"text\" ng-model=\"addr.street1\" name=\"street1\" required />\r\n        </label>\r\n        <label class=\"item item-input\">\r\n            <div class=\"input-label\">\r\n                地址 2\r\n            </div>\r\n            <input type=\"text\" ng-model=\"addr.street2\" name=\"street2\" required />\r\n        </label>\r\n        <label class=\"item item-input\">\r\n            <div class=\"input-label\" ng-class=\"{\'warning\': addressForm.city.$error.required && !addressForm.city.$pristine}\">\r\n                城市\r\n            </div>\r\n            <input type=\"text\" ng-model=\"addr.city\" name=\"city\" required />\r\n        </label>\r\n        <label class=\"item item-input item-select\">\r\n            <div class=\"input-label\" ng-class=\"addressForm.state.$error.required && !addressForm.state.$pristine\">\r\n                州/省\r\n            </div>\r\n            <select ng-model=\"addr.state\" name=\"state\" required>\r\n                <option ng-selected=\"addr.state == k\" value=\"{{k}}\" ng-repeat=\"(k, v) in REGIONS\">{{v}}</option>\r\n            </select>\r\n        </label>\r\n        <label class=\"item item-input\">\r\n            <div class=\"input-label\" ng-class=\"{\'warning\': addressForm.postcode.$error.required && !addressForm.postcode.$pristine}\">\r\n                邮编\r\n            </div>\r\n            <input type=\"text\" ng-model=\"addr.postcode\" name=\"postcode\" required />\r\n        </label>\r\n        <label class=\"item item-input\">\r\n            <div class=\"input-label\" ng-class=\"{\'warning\': addressForm.mobile_number.$error.required && !addressForm.mobile_number.$pristine}\">\r\n                联系电话\r\n            </div>\r\n            <input type=\"text\" ng-model=\"addr.mobile_number\" name=\"mobile_number\" required />\r\n        </label>\r\n    </div>\r\n</form>\r\n</section>\r\n\r\n  </ion-content>\r\n\r\n</ion-modal-view>\r\n");
$templateCache.put("auth.html","<ion-modal-view>\r\n  <ion-header-bar>\r\n    <button class=\"button button-clear icon ion-ios-close-empty\" ng-click=\"closeAuthBox()\"></button>\r\n    <div class=\"title\">登陆</div>\r\n  </ion-header-bar>\r\n  <ion-content class=\"login-page overlay-content\" ng-controller=\"authCtrl\" >\r\n      <div class=\"logo\"></div>\r\n      <div class=\"logo-desc\">比邻中国的海外生活</div>\r\n    <div class=\"list list-inset\">\r\n      <label class=\"item item-input\">\r\n        <input type=\"email\" placeholder=\"邮箱地址\" ng-model=\"email\">\r\n      </label>\r\n\r\n      <label class=\"item item-input\">\r\n        <input type=\"password\" placeholder=\"密码\" ng-model=\"password\">\r\n      </label>\r\n    </div>\r\n\r\n    <button class=\"button button-block login-btn\" ng-click=\"login()\">\r\n        登陆\r\n    </button>\r\n\r\n    <div class=\"list login-btn-group\">\r\n        <button class=\"button button-clear button-dark pull-left\" ng-click=\"showForgotPWBox()\">\r\n            忘记密码?\r\n        </button>\r\n        <button class=\"button button-clear button-dark pull-right\" ng-click=\"showSignupBox()\">\r\n            邮箱注册\r\n        </button>\r\n    </div>\r\n\r\n    <div class=\"third-party-box\">\r\n        <p>使用第三方账号登陆</p>\r\n\r\n        <i ng-show=\"IsWechatInstalled\" ng-click=\"oauthLogin(\'wechat_app\')\" class=\"login-icon1 fa fa-wechat\"></i>\r\n        <i ng-click=\"oauthLogin(\'weibo_app\')\" class=\"login-icon1 fa fa-weibo\"></i>\r\n        <i ng-click=\"oauthLogin(\'facebook_app\')\" class=\"login-icon1 fa fa-facebook\"></i>\r\n    </div>\r\n  </ion-content>\r\n</ion-modal-view>\r\n");
$templateCache.put("bindEmail.html","<ion-modal-view>\r\n  <ion-header-bar>\r\n    <div class=\"buttons\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back button-dark\" ng-click=\"closeBindEmailBox()\"></button>\r\n    </div>\r\n    <div class=\"title\">绑定邮箱</div>\r\n  </ion-header-bar>\r\n  <ion-content class=\"login-page overlay-content\" scroll=\"false\" ng-controller=\"bindEmailCtrl\">\r\n    <div class=\"list list-inset\">\r\n      <label class=\"item item-input\">\r\n        <input type=\"email\" placeholder=\"邮箱地址\" ng-model=\"bindEmailForm.email\">\r\n      </label>\r\n    </div>\r\n\r\n    <button class=\"button button-block login-btn\" ng-click=\"bind()\">绑定</button>\r\n\r\n  </ion-content>\r\n</ion-modal-view>\r\n");
$templateCache.put("board.html","<ion-view>\r\n    <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">{{::board.title}}</div>\r\n    </div>\r\n\r\n    <ion-content class=\"has-header homepage\">\r\n        <div class=\"item item-banner-image\">\r\n            <img ng-src=\"{{::board.image}}\">\r\n        </div>\r\n\r\n        <ion-item class=\"item board-desc\" style=\"border-left: 3px solid #ea004f;\">\r\n            {{::board.desc}}\r\n        </ion-item>\r\n\r\n        <div class=\"col col-50 \"\r\n             style=\"display: inline-block\"\r\n             ng-repeat=\"item in board.items track by $index\" ng-click=\"goItem(item.item_id)\">\r\n            <div class=\"item item-image\">\r\n                <img ng-src=\"{{::item.thumbnail}}\" cache-src>\r\n            </div>\r\n            <div class=\"item item-text-wrap\" href=\"#\">\r\n                <h2 class=\"product-title\" style=\"overflow: hidden;\">{{::item.title}}</h2>\r\n                <p class=\"product-prices\">\r\n                    <span class=\"curr-price\">{{::item.price | currency}}</span>\r\n                    <del class=\"orig-price\">{{::item.orig_price | currency}}</del>\r\n                </p>\r\n            </div>\r\n        </div>\r\n\r\n\r\n\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("calFee.html","<!-- 运费估算 -->\r\n<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">运费估算</div>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\">\r\n\r\n<section>\r\n<form name=\"queryForm\" ng-submit=\"queryFee()\">\r\n    <div class=\"list\">\r\n        <label class=\"item item-input item-select\">\r\n           <div class=\"input-label\" ng-class=\"{\'warning\': queryForm.country.$error.required && !queryForm.country.$pristine}\">\r\n                国家\r\n            </div>\r\n            <select placeholder=\"请选择寄往国家\" ng-model=\"query.country\" name=\"country\"\r\n                ng-options=\"country for country in COUNTRIES\" required>\r\n            </select>\r\n        </label>\r\n        <label class=\"item item-input\">\r\n            <div class=\"input-label\" ng-class=\"{\'warning\': queryForm.weight.$error.required && !queryForm.weight.$pristine}\">\r\n               重量\r\n            </div>\r\n            <input style=\"margin-right: 12px\" class=\"text-right\" placeholder=\"请输入商品重量\" type=\"number\" ng-model=\"query.weight\" name=\"weight\" required /><span class=\"cal-unit\">克</span>\r\n       </label>\r\n    </div>\r\n    <div class=\"padding\">\r\n        <button class=\"button button-block button-assertive button-cart\">费用估算</button>\r\n    </div>\r\n</form>\r\n</section>\r\n\r\n<section>\r\n<div class=\"address-select-info\">\r\n    <div class=\"address-row\" ng-repeat=\"provider in provider_prices track by $index\">\r\n        <div class=\"address-info provider\">\r\n            <div class=\"info-header\">{{provider.name}}\r\n                ({{provider.service_intro.duration}})</div>\r\n            <div class=\"desc\">首重{{provider.init_weight}}g/${{provider.init_price}}，\r\n                续重{{provider.continued_weight}}g/${{provider.continued_price}}</div>\r\n            <div class=\"desc\">{{provider.rule_desc}}</div>\r\n        </div>\r\n        <div>\r\n            <span class=\"provider-price\">\r\n                {{provider.cn_shipping | currency }}\r\n            </span>\r\n        </div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("cart.html","<!-- 购物车 -->\r\n\r\n<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear button-dark icon ion-ios-arrow-back\"  ng-click=\"$state.go(\'tab.home\')\"></button>\r\n      <div class=\"title\">购物车</div>\r\n      <button class=\"button button-clear button-dark icon\" ng-class=\"editShown?\'ion-ios-color-wand-outline\': \'ion-ios-trash-outline\'\"  ng-click=\"toggleEditShown()\"></button>\r\n\r\n  </div>\r\n  <ion-content class=\"has-header has-footer has-subfooter\">\r\n\r\n    <div class=\"center-ico\"  ng-show=\"ngCart.getTotalItems() === 0\">\r\n        <i class=\"icon ion-ios-cart-outline\"></i>\r\n        <h1 >购物车为空\r\n        </h1>\r\n    </div>\r\n\r\n    <div ng-show=\"ngCart.getTotalItems() > 0\">\r\n\r\n        <table class=\"table ngCart cart-table\">\r\n            <thead>\r\n            <tr>\r\n                <td class=\"check-cell\" ng-click=\"selectAllEntries()\">\r\n                    <i class=\"icon select-icon\"\r\n                        ng-class=\" isSelectedAll? \'ion-ios-checkmark selected\':\'ion-ios-circle-outline\'\"\r\n                        ng-hide=\"editShown\">\r\n                    </i>\r\n                </td>\r\n\r\n                <td></td>\r\n                <td></td>\r\n                <td></td>\r\n            </tr>\r\n            </thead>\r\n\r\n            <tbody>\r\n            <tr ng-repeat=\"item in ngCart.getCart().items track by $index\">\r\n                <td class=\"check-cell\">\r\n                    <span class=\"close-icon\" ng-show=\"editShown\" ng-click=\"ngCart.removeItemById(item.getId())\">\r\n                    </span>\r\n                    <i class=\"icon select-icon\"\r\n                        ng-class=\" ngCart.getSelectedItemById(item.getId())? \'ion-ios-checkmark selected\':\'ion-ios-circle-outline\'\"\r\n                        ng-hide=\"editShown\"\r\n                        ng-click=\"selectEntry(item.getId())\">\r\n                    </i>\r\n\r\n                </td>\r\n\r\n                <td class=\"img-cell\">\r\n                    <div>\r\n                        <a ng-href=\"#/item/{{item.getData().item.item_id}}\">\r\n                            <img ng-src=\"{{item.getData().spec.images[0]}}\">\r\n                        </a>\r\n                    </div>\r\n                </td>\r\n                <td class=\"info-cell\">\r\n                    <div>{{ item.getName() }}</div>\r\n                    <div>\r\n                        <span ng-repeat=\"(k, v) in item.getData().spec.attributes\">\r\n                            {{ngCart.attrMap[k]}}: {{v}}\r\n                        </span>\r\n                    </div>\r\n                    <div class=\"btn-group\">\r\n                        <button class=\"btn del-num\"\r\n                            ng-class=\"{\'disabled\':item.getQuantity()==1}\"\r\n                            ng-click=\"setQuantity(item, -1, true)\">-</button>\r\n                        <button class=\"btn num\">{{ item.getQuantity() | number }}</button>\r\n                        <button class=\"btn add-num\"\r\n                            ng-click=\"setQuantity(item, 1, true)\">+</button>\r\n                    </div>\r\n                </td>\r\n                <td class=\"price-cell\">{{ item.getTotal() | currency }}</td>\r\n            </tr>\r\n            </tbody>\r\n            <tfoot>\r\n            <tr ng-show=\"ngCart.getShipping()\">\r\n                <td></td>\r\n                <td></td>\r\n                <td>Shipping:</td>\r\n                <td>{{ ngCart.getShipping() | currency }}</td>\r\n            </tr>\r\n            <tr>\r\n                <td class=\"check-cell\">\r\n                </td>\r\n                <td></td>\r\n                <td colspan=\"2\" class=\"total\">商品总价: {{ ngCart.totalCost() | currency }}</td>\r\n            </tr>\r\n            </tfoot>\r\n\r\n        </table>\r\n    </div>\r\n\r\n  </ion-content>\r\n    <div class=\"bar bar-subfooter bar-stable\">\r\n        <a class=\"button button-clear\">\r\n            总价:  <span class=\"footer-price\"> {{ ngCart.totalCost() |currency}}</span>\r\n        </a>\r\n        <button class=\"button button-assertive button-cart pull-right\" ng-click=\"$state.go(\'tab.checkout\')\">\r\n            结算({{ngCart.getTotalSelectedItems()}})\r\n\r\n        </button>\r\n    </div>\r\n\r\n</ion-view>\r\n");
$templateCache.put("category.html","<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">商品类目</div>\r\n  </div>\r\n  <ion-content class=\"has-header categories\">\r\n        <div class=\"cate-row\" ng-repeat=\"cate in categories\">\r\n            <ion-item class=\"main\">{{cate.cn}}</ion-item>\r\n            <div class=\"sub-list\">\r\n                <div class=\"sub\" ng-repeat=\"sub in cate.sub_list\">\r\n                    <a ng-href=\"#/category/{{sub.en}}/{{sub.cn}}\">{{sub.cn}}</a>\r\n                </div>\r\n            </div>\r\n        </div>\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("cateHome.html","<ion-view>\r\n    <form>\r\n    <div class=\"bar bar-header item-input-inset\">\r\n      <a href=\"#/home\" class=\"button button-icon icon ion-navicon\"></a>\r\n      <label class=\"item-input-wrapper\">\r\n        <i class=\"icon ion-ios-search placeholder-icon\"></i>\r\n        <input type=\"search\" placeholder=\"搜索商品，种类\" ng-model=\"searchQuery\">\r\n        <input type=\"submit\" ng-click=\"searchItem(searchQuery)\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>\r\n      </label>\r\n      <span class=\"cart-num\">{{ ngCart.getTotalItems() }}</span>\r\n      <a href=\"#/cart\" class=\"button button-icon icon ion-ios-cart\"></a>\r\n    </div>\r\n    </form>\r\n    <div class=\"bar bar-subheader\">\r\n      <ion-scroll direction=\"x\" scrollbar-x=\"false\" id=\"category-scroll\" delegate-handle=\"cateScroll\">\r\n        <div class=\"cate-scroll-row\" >\r\n            <a href class=\"main-cate-tab\" ng-repeat=\"(k, v) in Categories\" ng-class=\"{\'active\': currentTab==k}\" ng-click=\"changeTab(k, $index)\">{{v}}</a>\r\n        </div>\r\n      </ion-scroll>\r\n    </div>\r\n    <ion-content class=\"has-header has-subheader homepage\"  overflow-scroll=\"true\">\r\n\r\n        <ion-item class=\"item\" style=\"border-left: 3px solid #ea004f;\">\r\n            美比严选\r\n            <span class=\"item-note\" style=\"color: #ea004f;\">\r\n                全场满$79.99免邮\r\n            </span>\r\n        </ion-item>\r\n\r\n        <ion-slide-box show-pager=\"false\"\r\n            on-slide-changed=\"slideHasChanged($index)\"\r\n            active-slide=\"currentIndex\">\r\n            <ion-slide ng-repeat=\"(k,v) in Categories\">\r\n\r\n                <div ng-if=\"currentTab==k\">\r\n                    <ion-refresher\r\n                        pulling-text=\"下拉刷新...\"\r\n                        on-refresh=\"doRefresh()\"\r\n                        spinner=\"spiral\">\r\n                    </ion-refresher>\r\n\r\n                    <div class=\"col col-50 \"\r\n                         style=\"display: inline-block\"\r\n                        ng-repeat=\"item in items track by $index\" ng-click=\"goItem(item.item_id)\">\r\n                        <div class=\"item item-image\">\r\n                            <img ng-src=\"{{::item.thumbnail}}\">\r\n                        </div>\r\n                        <div class=\"item item-text-wrap\" href=\"#\">\r\n                            <h2 class=\"product-title\" style=\"overflow: hidden;\">{{::item.title}}</h2>\r\n                            <p class=\"product-prices\">\r\n                                <span class=\"curr-price\">{{::item.price | currency}}</span>\r\n                                <del class=\"orig-price\">{{::item.orig_price | currency}}</del>\r\n                            </p>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"center-ico\" ng-if=\"isEmpty()\">\r\n                        <i class=\"icon ion-ios-grid-view-outline\"></i>\r\n\r\n                        <h1 >暂无此类商品</h1>\r\n                    </div>\r\n\r\n                    <ion-infinite-scroll\r\n                        on-infinite=\"loadMore()\"\r\n                        distance=\"1\"\r\n                        spinner=\'spiral\'\r\n                        ng-if=\"moreDataCanBeLoaded()\">\r\n                    </ion-infinite-scroll>\r\n\r\n                </div>\r\n                <div ng-if=\"currentTab!=k\">\r\n                    <div style=\"background:#f9f9f9;padding-top:100%;height:0\"></div>\r\n                </div>\r\n\r\n\r\n\r\n            </ion-slide>\r\n        </ion-slide-box>\r\n\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("checkout.html","<!-- 购物车 -->\r\n<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back button-dark\"\r\n          ng-click=\"$state.go(\'tab.cart\')\"></button>\r\n\r\n      <div class=\"title\">结算</div>\r\n  </div>\r\n  <ion-content class=\"has-header has-footer\">\r\n\r\n<section>\r\n<div class=\"checkout-info\" ng-click=\"gotoAddress()\">\r\n    <div ng-show=\"addr.id\">\r\n        <span class=\"addr-icon\"></span>\r\n        <div class=\"address-info\">\r\n            <div class=\"addr-header\">收货人信息: </div>\r\n            <div class=\"\">{{addr.data.receiver}}</div>\r\n            <div class=\"\">{{addr.data.street1}}</div>\r\n            <div class=\"\">{{addr.data.street2}}</div>\r\n            <div class=\"\">{{addr.data.city}}, {{addr.data.state}}</div>\r\n            <div class=\"\">{{addr.data.country}}, {{addr.data.postcode}}</div>\r\n        </div>\r\n        <div class=\"select-arrow address\"></div>\r\n    </div>\r\n    <div ng-hide=\"addr.id\">\r\n        <span class=\"addr-icon\"></span>\r\n        <div class=\"address-info\">\r\n            <div class=\"\">新增收件地址</div>\r\n        </div>\r\n        <div class=\"go-add\">+</div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n<section class=\"clearfix\" ng-cloak>\r\n<div class=\"\" ng-show=\"ngCart.getTotalSelectedItems() > 0\">\r\n\r\n    <table class=\"table ngCart cart-table\">\r\n        <tbody>\r\n        <tr ng-repeat=\"item in ngCart.getCart().selectedItems track by $index\">\r\n            <td class=\"img-cell\">\r\n                <div>\r\n                    <a ng-href=\"#/item/{{item.getData().item.item_id}}\">\r\n                        <img ng-src=\"{{item.getData().spec.images[0]}}\">\r\n                    </a>\r\n                </div>\r\n            </td>\r\n            <td class=\"info-cell\">\r\n                <div>{{ item.getName() }}</div>\r\n                <div>\r\n                    <span ng-repeat=\"(k, v) in item.getData().spec.attributes\">\r\n                        {{ngCart.attrMap[k]}}: {{v}}\r\n                    </span>\r\n                </div>\r\n                <div class=\"btn-group cart-btn\">\r\n                    <span>数量: {{ item.getQuantity() | number }}</span>\r\n                </div>\r\n            </td>\r\n            <td class=\"price-cell\">{{ item.getTotal() | currency }}</td>\r\n        </tr>\r\n        </tbody>\r\n    </table>\r\n</div>\r\n</section>\r\n\r\n<section>\r\n<div class=\"checkout-info\">\r\n    <div class=\"icon partner-icon address\"></div>\r\n    <div class=\"partner-info\" ng-click=\"showProviderChoices()\">\r\n        <div ng-show=\"selectedProvider\" class=\"selected-partner\">{{selectedProvider.display_name}} ({{selectedProvider.service_intro.duration}}):\r\n            <span class=\"detail-price selectable\">{{selectedProvider.cn_shipping | currency }}</span>\r\n        </div>\r\n        <div ng-hide=\"selectedProvider\" class=\"selected-partner\">请选择运输方式</div>\r\n    </div>\r\n    <div class=\"select-arrow\" ng-class=\"{\'down-arrow\': providersShown}\"></div>\r\n</div>\r\n<div ng-show=\"providersShown\" class=\"checkout-choices\">\r\n    <div class=\"select-row\" ng-repeat=\"provider in provider_prices\"\r\n        ng-click=\"selectPartner(provider)\">\r\n        <span class=\"select-icon\"\r\n            ng-class=\"{\'selected\': selectedProvider.name == provider.name}\">\r\n        </span>\r\n        <div class=\"checkout-choice\">\r\n            {{provider.display_name}} ({{provider.service_intro.duration}})\r\n            <span class=\"detail-price selectable\">{{provider.cn_shipping | currency }}</span>\r\n        </div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n<section>\r\n<div class=\"checkout-info\">\r\n    <div class=\"icon coupon-icon address\"></div>\r\n    <div class=\"coupon-info\" ng-click=\"showCouponsChoices()\">\r\n        <div ng-show=\"coupon_codes\" class=\"\">{{coupon_codes.description}}\r\n            <span class=\"detail-price selectable\">-{{coupon_codes.saving }}</span>\r\n        </div>\r\n        <div ng-hide=\"coupon_codes\" class=\"\">使用折扣码/优惠券 </div>\r\n    </div>\r\n    <div class=\"select-arrow\" ng-class=\"{\'down-arrow\': couponsShown}\"></div>\r\n</div>\r\n<div ng-show=\"couponsShown\" class=\"checkout-choices\">\r\n    <div class=\"select-row\" ng-click=\"noCoupon()\">\r\n        <span class=\"select-icon\"\r\n            ng-class=\"{\'selected\': noCouponSelected == true}\">\r\n        </span>\r\n        <div class=\"checkout-choice\">\r\n            不使用\r\n        </div>\r\n    </div>\r\n    <div class=\"select-row\" ng-repeat=\"coupon in availableCoupons\"\r\n        ng-click=\"selectCoupon(coupon)\">\r\n        <span class=\"select-icon\"\r\n            ng-class=\"{\'selected\': coupon_codes.code == coupon.code}\">\r\n        </span>\r\n        <div class=\"checkout-choice\">\r\n            <span>{{coupon.description}}</span>\r\n            <span class=\"detail-price selectable\">-{{coupon.saving | currency }}</span>\r\n        </div>\r\n    </div>\r\n    <div class=\"select-row\">\r\n        <span class=\"select-icon\"\r\n            ng-click=\"selectInputCoupon()\"\r\n            ng-class=\"{\'selected\': couponInputSelected}\">\r\n        </span>\r\n        <div class=\"checkout-choice\">\r\n            <span>折扣码</span>\r\n            <input ng-model=\"couponInput\" type=\"text\" class=\"coupon-input\" placeholder=\"输入折扣码\">\r\n            <span class=\"detail-price selectable\">-{{coupon_codes.saving}}</span>\r\n            <span ng-click=\"confirmCoupon()\" class=\"use-btn\">使用</span>\r\n        </div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n\r\n<section>\r\n<div class=\"checkout-info\">\r\n    <div class=\"item-info-table\">\r\n        <dl class=\"item-info-field\">\r\n            <dt class=\"\">商品总价: </dt>\r\n            <dd class=\"detail-price\">{{order.amount_usd | currency }}</dd>\r\n        </dl>\r\n        <dl class=\"item-info-field\">\r\n            <dt class=\"\">运费: </dt>\r\n            <dd class=\"detail-price\">{{order.cn_shipping | currency }}</dd>\r\n        </dl>\r\n        <dl class=\"item-info-field\">\r\n            <dt class=\"\">税费: </dt>\r\n            <dd class=\"detail-price\">0</dd>\r\n        </dl>\r\n    </div>\r\n\r\n</div>\r\n</section>\r\n  </ion-content>\r\n\r\n  <ion-footer-bar align-title=\"left\" class=\"bar-stable\">\r\n    <a class=\"button button-clear\">\r\n        总计: <span class=\"footer-price\"> {{ order.final |currency}}</span>\r\n    </a>\r\n    <h1 class=\"title\"></h1>\r\n    <ngcart-checkout settings=\"{ coupon: coupon_codes.code,\r\n                        logistic_provider: selectedProvider.name,\r\n                        order_type: \'new\'}\">\r\n                        去付款</ngcart-checkout>\r\n  </ion-footer-bar>\r\n</ion-view>\r\n");
$templateCache.put("coupons.html","<ion-view>\r\n    <ion-header-bar>\r\n        <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">折扣券</div>\r\n    </ion-header-bar>\r\n\r\n    <ion-content class=\"has-header has-footer\">\r\n\r\n        <ion-list>\r\n            <ion-item class=\"item\" ng-repeat=\"c in user.getUser().consumable_coupons\">\r\n                {{c.description}}  {{c.number}}张\r\n                <span class=\"item-note\">\r\n                    有效期 {{c.expire_date}}\r\n                </span>\r\n\r\n            </ion-item>\r\n        </ion-list>\r\n        <div class=\"center-ico\" ng-if=\"notices.==0\">\r\n            <i class=\"icon ion-ios-camera\"></i>\r\n\r\n            <h1 >暂无动态</h1>\r\n        </div>\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("explore.html","<ion-view view-title=\"Chats\">\r\n  <ion-content>\r\n    <ion-list>\r\n      <ion-item class=\"item-remove-animate item-avatar item-icon-right\" ng-repeat=\"chat in chats\" type=\"item-text-wrap\" href=\"#/tab/chats/{{chat.id}}\">\r\n        <img ng-src=\"{{chat.face}}\">\r\n        <h2>{{chat.name}}</h2>\r\n        <p>{{chat.lastText}}</p>\r\n        <i class=\"icon ion-chevron-right icon-accessory\"></i>\r\n\r\n        <ion-option-button class=\"button-assertive\" ng-click=\"remove(chat)\">\r\n          Delete\r\n        </ion-option-button>\r\n      </ion-item>\r\n    </ion-list>\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("expressForm.html","<!-- 代寄出国 -->\r\n<ion-view>\r\n    <div class=\"bar bar-header\">\r\n        <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$state.go(\'tab.home\')\">首页2</button>\r\n        <div class=\"title\">代寄出国</div>\r\n    </div>\r\n\r\n    <ion-content class=\"has-header\">\r\n        <div class=\"logistic-row\">\r\n            <ul class=\"progress-indicator\">\r\n                <li class=\"completed\">\r\n                    <span class=\"bubble\"></span>\r\n                    <div class=\"logistic-status\">核验清单</div>\r\n                </li>\r\n                <li ng-repeat=\"status in STATUES\">\r\n                    <span class=\"bubble\"></span>\r\n                    <div class=\"logistic-status\">{{status}}</div>\r\n                </li>\r\n            </ul>\r\n        </div>\r\n        <div class=\"checkout-info\" ng-click=\"gotoAddress()\">\r\n            <div ng-show=\"addr.id\">\r\n                <span class=\"addr-icon\"></span>\r\n                <div class=\"address-info\">\r\n                    <p class=\"addr-header\">寄往收货人信息: </p>\r\n                    <div class=\"\">{{addr.data.receiver}}</div>\r\n                    <div class=\"\">{{addr.data.street1}}</div>\r\n                    <div class=\"\">{{addr.data.street2}}</div>\r\n                    <div class=\"\">{{addr.data.city}}, {{addr.data.state}}</div>\r\n                    <div class=\"\">{{addr.data.country}}, {{addr.data.postcode}}</div>\r\n                </div>\r\n                <div class=\"select-arrow address\"></div>\r\n            </div>\r\n            <div ng-hide=\"addr.id\">\r\n                <span class=\"addr-icon\"></span>\r\n                <div class=\"address-info\">\r\n                    <div class=\"\">填写收件人信息</div>\r\n                </div>\r\n                <div class=\"go-add\">+</div>\r\n            </div>\r\n        </div>\r\n        <div class=\"\">\r\n            <table class=\"table ngCart cart-table express\">\r\n                <thead>\r\n                <tr>\r\n                    <td class=\"title\">\r\n                        <span>物品名称</span>\r\n                    </td>\r\n                    <td class=\"cate\">\r\n                        <span><a href=\"\" onclick=\"window.open(\'http://may.bi/#/limit\', \'_blank\', \'location=no,toolbarposition=top,closebuttoncaption=关闭\')\">敏感物品</a></span>\r\n                    </td>\r\n                    <td class=\"quantity\">\r\n                        <span>数量</span>\r\n                    </td>\r\n                    <td class=\"value\">\r\n                        <span>申报价值</span>\r\n                    </td>\r\n                    <td class=\"note\">\r\n                        <span>备注</span>\r\n                    </td>\r\n                    <td class=\"ico\"></td>\r\n                </tr>\r\n                </thead>\r\n\r\n                <tbody>\r\n                <tr ng-repeat=\"entry in entries track by $index\">\r\n                    <td class=\"title\">\r\n                        {{ entry.title }}\r\n                    </td>\r\n                    <td class=\"cate\">\r\n                        {{ entry.main_category==\'special\'? \'是\': \'否\' }}\r\n                    </td>\r\n                    <td class=\"quantity\">\r\n                        {{ entry.quantity }}\r\n                    </td>\r\n                    <td class=\"value\">\r\n                        ￥{{ entry.amount }}\r\n                    </td>\r\n                    <td class=\"note\">\r\n                        {{ entry.remark }}\r\n                    </td>\r\n                    <td class=\"ico\">\r\n                        <span class=\"close-icon\" ng-click=\"removeEntry(entry)\">\r\n                        </span>\r\n                    </td>\r\n                </tr>\r\n                </tbody>\r\n            </table>\r\n\r\n            <button class=\"button button-block\" ng-click=\"addEntry()\">\r\n                <i class=\"ion-ios-plus-outline\"></i>\r\n                添加代寄物品\r\n            </button>\r\n        </div>\r\n        <div class=\"express-noti\">\r\n\r\n            <p class=\"notice\">下单须知: </p>\r\n\r\n            <p>1. 提交清单后，美比工作人员会先核实，核实通过后订单进入“跟踪快递”。</p>\r\n\r\n            <p>2. “跟踪快递”状态后，用户把待寄物品寄到美比仓库收货地址，并尽快填写包裹的快递单号。</p>\r\n\r\n            <p>3. 包裹到达仓库之后，进入“入库称重”，用户根据称得重量，选择运输方式后交付运费。</p>\r\n\r\n            <p>4. 交付运费后，订单进入\"支付运费\"。仓库人员将24小时内提交运输。</p>\r\n\r\n        </div>\r\n    </ion-content>\r\n    <ion-footer-bar class=\"bar-stable item-button-right\">\r\n        <button class=\"button button-assertive button-cart\" ng-click=\"submit()\">提交清单</button>\r\n    </ion-footer-bar>\r\n</ion-view>\r\n");
$templateCache.put("expressItem_add.html","<!-- 添加代寄物品 -->\r\n<ion-view>\r\n    <div class=\"bar bar-header\">\r\n        <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">添加代寄物品</div>\r\n        <button class=\"button button-clear button-dark\" ng-click=\"addItem()\">保存</button>\r\n    </div>\r\n\r\n    <ion-content class=\"has-header\">\r\n        <div class=\"list\">\r\n            <label class=\"item item-input\">\r\n                <span class=\"input-label\">物品名称</span>\r\n                <input type=\"text\" ng-model=\"item.title\">\r\n            </label>\r\n            <label class=\"item item-toggle\">\r\n                敏感物品\r\n                <label class=\"toggle toggle-assertive\">\r\n                    <input type=\"checkbox\" ng-model=\"item.main_category\">\r\n                    <div class=\"track\">\r\n                        <div class=\"handle\"></div>\r\n                    </div>\r\n                </label>\r\n            </label>\r\n            <label class=\"item item-input\">\r\n                <span class=\"input-label\">数量</span>\r\n                <input type=\"number\" ng-model=\"item.quantity\">\r\n            </label>\r\n            <label class=\"item item-input\">\r\n                <span class=\"input-label\">申报价值(￥)</span>\r\n                <input type=\"number\" ng-model=\"item.amount\">\r\n            </label>\r\n            <label class=\"item item-input\">\r\n                <span class=\"input-label\">备注</span>\r\n                <input type=\"text\" placeholder=\"如颜色，尺寸\" ng-model=\"item.remark\">\r\n            </label>\r\n        </div>\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("favors.html","<!-- 商品列表 -->\r\n<ion-view>\r\n    <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">收藏商品</div>\r\n    </div>\r\n    <ion-content class=\"has-header homepage\">\r\n        <div class=\"col col-50 animated fadeIn\"\r\n            collection-repeat=\"item in items\" ng-click=\"goItem(item.item_id)\">\r\n            <div class=\"item item-image\">\r\n                <img ng-src=\"{{item.thumbnail}}\" cache-src>\r\n            </div>\r\n            <div class=\"item item-text-wrap\" href=\"#\">\r\n                <h2 class=\"product-title\" style=\"overflow: hidden;\">{{item.title}}</h2>\r\n                <p class=\"product-prices\">\r\n                    <span class=\"curr-price\">{{item.price | currency}}</span>\r\n                    <del class=\"orig-price\">{{item.orig_price | currency}}</del>\r\n                </p>\r\n            </div>\r\n        </div>\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("feedback.html","<!-- 意见反馈 -->\r\n<ion-view>\r\n    <div class=\"bar bar-header\">\r\n        <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">意见反馈</div>\r\n    </div>\r\n\r\n    <ion-content class=\"has-header\">\r\n        <div class=\"faq-row\">\r\n            <div class=\"faq-title\">\r\n                意见反馈:\r\n            </div>\r\n            <div class=\"faq-desc\">\r\n                <textarea ng-model=\"text\" class=\"ng-pristine ng-untouched ng-valid\"></textarea>\r\n                <button ng-click=\"feedback()\" class=\"button button-assertive pull-right button\">提交</button>\r\n            </div>\r\n        </div>\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("forgotPassword.html","<ion-modal-view>\r\n  <ion-header-bar>\r\n    <div class=\"buttons\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back button-dark\" ng-click=\"closeForgotPWBox()\"></button>\r\n    </div>\r\n    <div class=\"title\">忘记密码</div>\r\n  </ion-header-bar>\r\n  <ion-content class=\"login-page overlay-content\" scroll=\"false\" ng-controller=\"forgotPWCtrl\">\r\n    <div class=\"list list-inset\">\r\n      <label class=\"item item-input\">\r\n        <input type=\"email\" placeholder=\"邮箱地址\" ng-model=\"forgotPWForm.email\">\r\n      </label>\r\n    </div>\r\n\r\n    <button class=\"button button-block login-btn\" ng-click=\"submit()\">提交</button>\r\n\r\n  </ion-content>\r\n</ion-modal-view>\r\n");
$templateCache.put("home.html","<ion-view>\r\n    <form>\r\n    <div class=\"bar bar-header item-input-inset\">\r\n      <a href=\"#/cateHome\" class=\"button button-icon icon ion-grid\"></a>\r\n      <label class=\"item-input-wrapper\">\r\n        <i class=\"icon ion-ios-search placeholder-icon\"></i>\r\n        <input type=\"search\" placeholder=\"搜索商品，种类\" ng-model=\"searchQuery\">\r\n        <input type=\"submit\" ng-click=\"searchItem(searchQuery)\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>\r\n      </label>\r\n      <span class=\"cart-num\">{{ ngCart.getTotalItems() }}</span>\r\n      <a href=\"#/cart\" class=\"button button-icon icon ion-ios-cart\"></a>\r\n    </div>\r\n    </form>\r\n    <ion-content class=\"has-header homepage\"  overflow-scroll=\"true\">\r\n        <ion-slide-box delegate-handle=\"image-viewer\">\r\n            <!--ng-style=\"{\'height\':(banners?\'auto\':\'0px\'),\'padding-top\':(banners?\'0\':\'42.1875%\')}\">-->\r\n            <ion-slide ng-repeat=\"banner in banners track by $index\" >\r\n                <img ng-src=\"{{ ::banner.img }}\" ng-click=\"redirectTo(banner)\">\r\n            </ion-slide>\r\n        </ion-slide-box>\r\n\r\n        <div class=\"row intro-box\">\r\n            <div class=\"col col-25\">\r\n                <a href=\"#/categories\">\r\n                    <i class=\"icon category\"></i>\r\n                    <p>商品分类</p>\r\n                </a>\r\n\r\n            </div>\r\n            <div class=\"col col-25\">\r\n                <a href=\"#/calculate\">\r\n                    <i class=\"icon calculate\"></i>\r\n                    <p>运费估算</p>\r\n                </a>\r\n            </div>\r\n            <div class=\"col col-25\">\r\n                <a href=\"#/express\">\r\n                    <i class=\"icon send\"></i>\r\n                    <p>待寄出国</p>\r\n                </a>\r\n\r\n            </div>\r\n            <div class=\"col col-25\">\r\n                <a href=\"#/limit\">\r\n                    <i class=\"icon limit\"></i>\r\n                    <p>邮寄限制</p>\r\n                </a>\r\n            </div>\r\n        </div>\r\n\r\n        <ion-item class=\"item\" style=\"border-left: 3px solid #ea004f;\">\r\n            美周专题\r\n        </ion-item>\r\n\r\n\r\n        <ion-refresher\r\n            pulling-text=\"下拉刷新...\"\r\n            on-refresh=\"doRefresh()\"\r\n            spinner=\"spiral\">\r\n        </ion-refresher>\r\n\r\n        <div class=\"animated fadeIn\" ng-repeat=\"board in boards track by $index\" >\r\n            <div class=\"item item-banner-image\">\r\n                <div class=\"tri\"></div>\r\n                <img ng-src=\"{{ ::board.image }}\" ng-click=\"goBoard(board.id)\">\r\n            </div>\r\n            <item-carousel board=\"board\"></item-carousel>\r\n            <div class=\"item item-divider\"></div>\r\n        </div>\r\n        <ion-infinite-scroll\r\n            on-infinite=\"loadMore()\"\r\n            distance=\"1\"\r\n            spinner=\'spiral\'\r\n            ng-if=\"moreDataCanBeLoaded()\">\r\n        </ion-infinite-scroll>\r\n\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("intro.html","<ion-view class=\"view-intro\">\r\n\r\n    <ion-content scroll=\"false\">\r\n        <div class=\"intro-slider\">\r\n            <ion-slide-box active-slide=\"slideIndex\" show-pager=\"true\" on-slide-changed=\"slideChanged($index)\">\r\n\r\n                <ion-slide ng-repeat=\"item in slides\">\r\n\r\n                    <div class=\"content\" ng-if=\"$index == slideIndex\">\r\n                        <span class=\"top\"><h2>{{ item.top }}</h2></span>\r\n\r\n                        <div class=\"phone {{ device }}\">\r\n                            <img ng-src=\"{{ item.img }}\">\r\n                        </div>\r\n                    </div>\r\n\r\n                </ion-slide>\r\n\r\n                <ion-slide>\r\n                    <div class=\"content\" ng-if=\"slides.length == slideIndex\">\r\n\r\n                        <div class=\"last\">\r\n                            <div class=\"logo2 step1\">\r\n                                <img src=\"img/icon.jpg\">\r\n                                <span class=\"icon2-logo\"></span>\r\n                            </div>\r\n\r\n                            <p>为每个人提供专家服务</p>\r\n\r\n                            <button class=\"button button-block button-clear step2\" ui-sref=\"tab.explore\" ng-click=\"goHome()\">开始</button>\r\n                        </div>\r\n\r\n                    </div>\r\n                </ion-slide>\r\n            </ion-slide-box>\r\n\r\n        </div>\r\n\r\n        <!--\r\n        <button class=\"button button-positive button-fab left\" ng-if=\"slideIndex\" ng-click=\"previous()\"><i class=\"icon ion-ios-arrow-left\"></i></button>\r\n\r\n        <button class=\"button button-positive button-fab right\" ng-hide=\"slideIndex === slides.length\" ng-click=\"next()\"><i class=\"icon ion-ios-arrow-right\"></i></button>\r\n        -->\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("item.html","<!-- 商品详情 -->\r\n<ion-view>\r\n    <div class=\"buttons\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back item-header-button\" ng-click=\"$ionicGoBack()\"></button>\r\n      <button class=\"button button-clear icon ion-share item-header-button pull-right\" ng-click=\"share(item)\"></button>\r\n    </div>\r\n\r\n  <ion-content class=\"item-page has-footer\">\r\n\r\n    <ion-slide-box delegate-handle=\"image-viewer\"\r\n        ng-style=\"{\'height\':(images?\'auto\':\'0px\'),\'padding-top\':(images?\'0\':\'100%\')}\">\r\n        <ion-slide ng-repeat=\"img in images\">\r\n            <img ng-src=\"{{ img.url }}\" ng-click=\"zoom(img.url)\">\r\n        </ion-slide>\r\n    </ion-slide-box>\r\n\r\n    <ion-item class=\"item item-details\">\r\n        <div class=\"item-title\">\r\n            {{ item.title }}\r\n        </div>\r\n        <div class=\"product-prices\">\r\n            <span class=\"curr-price\">{{item.price | currency}}</span>\r\n            <del class=\"orig-price\">{{item.orig_price | currency}}</del>\r\n            <div class=\"product-discount\">{{item.discount}}% Off</div>\r\n        </div>\r\n    </ion-item>\r\n    <ion-item class=\"item item-details\">\r\n        <div class=\"item-info\">\r\n            <div class=\"item-info-table\">\r\n                <dl class=\"item-info-field\">\r\n                    <dt class=\"item-info-key\">运费：</dt>\r\n                    <dd class=\"item-info-val\">满 $79 免运费</dd>\r\n                </dl>\r\n                <dl class=\"item-info-field\">\r\n                    <dt class=\"item-info-key\">商品编号：</dt>\r\n                    <dd class=\"item-info-val\">{{item.item_id}}</dd>\r\n                </dl>\r\n                <dl class=\"item-info-field\">\r\n                    <dt class=\"item-info-key\">商品重量：</dt>\r\n                    <dd class=\"item-info-val\">{{item.weight}}g</dd>\r\n                </dl>\r\n                <dl class=\"item-info-field\">\r\n                    <dt class=\"item-info-key\">库存所在地：</dt>\r\n                    <dd class=\"item-info-val\">中国</dd>\r\n                </dl>\r\n            </div>\r\n        </div>\r\n    </ion-item>\r\n    <ion-item class=\"item item-desc\">\r\n        <p class=\"info-header\">商品详情:</p>\r\n        <div class=\"description\" ng-bind-html=\"item.detail\"></div>\r\n    </ion-item>\r\n  </ion-content>\r\n  <div class=\"bar bar-footer bar-light\">\r\n      <button class=\"button button-clear icon ion-ios-heart\"\r\n          ng-class=\"{\'like-icon button-assertive\':item.is_favored, \'button-light\':!item.is_favored}\"\r\n          ng-click=\"favor(item.item_id)\">\r\n          <span class=\"footer-price\">{{item.price | currency}}</span>\r\n      </button>\r\n      <button class=\"button button-assertive button-cart icon ion-ios-cart\"\r\n          ng-click=\"showSpecsBox()\">\r\n          加入购物车\r\n      </button>\r\n  </div>\r\n</ion-view>\r\n");
$templateCache.put("itemCarousel.html","<ion-scroll direction=\"x\" scrollbar-x=\"false\" class=\"wide-as-needed item-carousel\">\r\n    <div class=\"col col-33 \"\r\n         style=\"display: inline-block\"\r\n        ng-repeat=\"item in items\" ng-click=\"goItem(item.item_id)\">\r\n        <div class=\"item item-image\">\r\n            <img ng-src=\"{{::item.thumbnail}}\">\r\n        </div>\r\n        <div class=\"item item-text-wrap\" href=\"#\">\r\n            <p class=\"\">{{::item.title}}</p>\r\n            <p class=\"product-prices\">\r\n                <span class=\"curr-price\">{{::item.price | currency}}</span>\r\n            </p>\r\n        </div>\r\n    </div>\r\n    <div class=\"col col-33 \"\r\n         style=\"display: inline-block\"\r\n        ng-click=\"goBoard()\">\r\n        <div class=\"item item-image\">\r\n            <div class=\"item-image-text\">\r\n                <p>查看全部<p>\r\n                <p>See All<p>\r\n            </div>\r\n        </div>\r\n        <div class=\"item item-text-wrap\" style=\"background: transparent\">\r\n            <p class=\"\" style=\"color:transparent\">See </p>\r\n            <p class=\"\" style=\"color:transparent\">All </p>\r\n        </div>\r\n    </div>\r\n</ion-scroll>\r\n");
$templateCache.put("limit.html","<ion-view>\r\n    <div class=\"bar bar-header\">\r\n        <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">邮寄限制</div>\r\n    </div>\r\n\r\n\r\n    <ion-content class=\"has-header homepage\">\r\n<div class=\"faq-row\">\r\n    <div class=\"faq-title\">普通商品:</div>\r\n    <div class=\"faq-desc\">\r\n    衣物类、书箱、鞋帽类、围巾类、床上用品类、窗帘类、玩具类、各种背包、提包与行李箱类、女生用品（纸巾、卫生棉等）、文具类、餐具类、厨房用品类、各种石头类工艺品、画框类、电器及其它电子产品（不带电池）、其它不需要海关检验检疫的物品;\r\n    </div>\r\n</div>\r\n\r\n<div class=\"faq-row\">\r\n    <div class=\"faq-title\">敏感商品:</div>\r\n    <div class=\"faq-desc\">\r\n    地方小吃、干货、茶叶、各种零食饼干、常用药品（感冒药、消炎药、肠胃药、清火去湿及其它非精神类或带有麻醉性质的药品）、光碟、带有电池的电子产品、国际品牌的全新物品、化妆品等；\r\n    </div>\r\n</div>\r\n\r\n\r\n<div class=\"faq-row\">\r\n    <div class=\"faq-title\">禁运商品:</div>\r\n    <div class=\"faq-desc\">\r\n    液体类、粉末类、文物古玩类、来自疫区的食品药品、易燃易爆品、各种管制刀具（包括菜刀）、枪枝、鲜活类、毒品、化学品、色情及政治内容的阅读物、世界各国流通货币、有价证券、邮票等海关明令禁止运输的物品;\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("logistics.html","<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">物流详情</div>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\">\r\n\r\n<section class=\"clearfix\" ng-cloak>\r\n<div class=\"logistic-row\">\r\n    <span class=\"\">\r\n        包裹编号：{{logistic.partner_tracking_no}}\r\n    </span>\r\n    <span class=\"pull-right\">\r\n        <ul class=\"logistic-nav\">\r\n            <li class=\"\"\r\n                ng-repeat=\"lo in order.logistics track by $index\"\r\n                ng-if=\"order.logistics.length > 1\"\r\n                ng-class=\"{\'current\': currTab==$index}\"\r\n                ng-click=\"goTab($index, lo)\">\r\n                包裹{{$index+1}}</li>\r\n        </ul>\r\n    </span>\r\n</div>\r\n<div class=\"\">\r\n    <table class=\"table ngCart cart-table\">\r\n        <tbody>\r\n        <tr ng-repeat=\"entry in logistic.entries track by $index\">\r\n            <td class=\"img-cell\">\r\n                <div>\r\n                    <img ng-src=\"{{entry.spec.images[0]}}\">\r\n                </div>\r\n            </td>\r\n            <td class=\"info-cell\">\r\n                <div>{{ entry.item.title }}</div>\r\n                <div>\r\n                    <span ng-repeat=\"(k, v) in entry.spec.attributes\">\r\n                        {{ngCart.attrMap[k]}}: {{v}}\r\n                    </span>\r\n                </div>\r\n                <div class=\"btn-group cart-btn\">\r\n                    <span>数量: {{ entry.quantity | number }}</span>\r\n                </div>\r\n            </td>\r\n            <td class=\"price-cell\">{{ entry.amount_usd | currency }}</td>\r\n        </tr>\r\n    </table>\r\n</div>\r\n\r\n<div class=\"logistic-row\">\r\n    <ul class=\"progress-indicator\">\r\n        <li ng-class=\"{\'completed\': allStatus.indexOf(logistic.current_status) >= $index}\"\r\n             ng-repeat=\"status in logistic.all_status\">\r\n            <span class=\"bubble\"></span>\r\n            <div class=\"logistic-status\">{{status.desc}}</div>\r\n        </li>\r\n    </ul>\r\n</div>\r\n<div class=\"logistic-row\">\r\n    <ul class=\"tracking\">\r\n        <li ng-repeat=\"h in logistic.history | reverse\">\r\n            <div class=\"\">{{h.desc}}</div>\r\n            <div class=\"time\">{{h.time}}</div>\r\n        </li>\r\n    </ul>\r\n</div>\r\n</section>\r\n\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("notification.html","<ion-view class=\"view-post\">\r\n    <ion-header-bar>\r\n        <div class=\"title\">通知</div>\r\n    </ion-header-bar>\r\n\r\n    <ion-content class=\"has-header\">\r\n\r\n    <ion-refresher\r\n        pulling-text=\"下拉刷新...\"\r\n        on-refresh=\"doRefresh()\"\r\n        spinner=\"spiral\">\r\n    </ion-refresher>\r\n\r\n    <div class=\"list card notice\" ng-repeat=\"notice in notices track by $index\">\r\n        <div class=\"item item-avatar\">\r\n            <img  ng-src=\"{{::notice.user.avatar_thumb}}\" ng-click=\"zoom(notice.user.avatar_url)\">\r\n            <h2>{{::notice.user.name}}\r\n                <div class=\"post-type notice\">\r\n                    {{::notice.sub_title}}\r\n                </div>\r\n                <span class=\"item-note\">{{::notice.created_at | amTimeAgo}}</span>\r\n            </h2>\r\n            <p class=\"post-body\" ng-bind-html=\"notice.content | nl2br\">\r\n        </div>\r\n    </div>\r\n    <div class=\"center-ico\" ng-if=\"isEmpty()\">\r\n        <i class=\"icon ion-ios-camera\"></i>\r\n\r\n        <h1 >暂无动态</h1>\r\n    </div>\r\n    <ion-infinite-scroll\r\n        on-infinite=\"loadMore()\"\r\n        distance=\"1\"\r\n        spinner=\'spiral\'\r\n        ng-if=\"moreDataCanBeLoaded()\">\r\n    </ion-infinite-scroll>\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("order.html","<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$state.go(\'tab.orders\')\"></button>\r\n      <div class=\"title\">订单详情</div>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\">\r\n\r\n<section class=\"orders\">\r\n<div class=\"checkout-info\">\r\n    <span class=\"addr-icon\"></span>\r\n    <div class=\"address-info\">\r\n        <p class=\"addr-header\">收货人信息: </p>\r\n        <div class=\"\">{{order.address.receiver}}</div>\r\n        <div class=\"\">{{order.address.street1}}</div>\r\n        <div class=\"\">{{order.address.street2}}</div>\r\n        <div class=\"\">{{order.address.city}}, {{order.address.state}}</div>\r\n        <div class=\"\">{{order.address.country}}, {{order.address.postcode}}</div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n<section class=\"clearfix\" ng-cloak>\r\n<div class=\"\">\r\n    <table class=\"table ngCart cart-table\">\r\n        <tbody>\r\n        <tr ng-repeat=\"entry in order.entries track by $index\">\r\n            <td class=\"img-cell\">\r\n                <div>\r\n                    <img ng-src=\"{{entry.spec.images[0]}}\">\r\n                </div>\r\n            </td>\r\n            <td class=\"info-cell\">\r\n                <div>{{ entry.item.title }}</div>\r\n                <div>\r\n                    <span ng-repeat=\"(k, v) in entry.spec.attributes\">\r\n                        {{ngCart.attrMap[k]}}: {{v}}\r\n                    </span>\r\n                </div>\r\n                <div class=\"btn-group cart-btn\">\r\n                    <span>数量: {{ entry.quantity | number }}</span>\r\n                </div>\r\n            </td>\r\n            <td class=\"price-cell\">{{ entry.amount_usd | currency }}</td>\r\n        </tr>\r\n    </table>\r\n</div>\r\n</section>\r\n<section>\r\n<div class=\"checkout-info\">\r\n    <div class=\"icon partner-icon address\"></div>\r\n    <div class=\"partner-info\">\r\n        <div class=\"selected-partner\">{{order.provider.display_name}} ({{order.provider.service_intro.duration}}):\r\n            <span class=\"detail-price pull-right\">{{order.cn_shipping | currency }}</span>\r\n        </div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n<section>\r\n<div class=\"checkout-info\">\r\n    <div class=\"icon coupon-icon address\"></div>\r\n    <div class=\"coupon-info\">\r\n        <div ng-show=\"order.discount.length==1\" class=\"\">{{order.discount[0].desc}}\r\n            <span class=\"detail-price pull-right\">- {{order.discount[0].value | currency }}</span>\r\n        </div>\r\n        <div ng-show=\"order.discount.length==0\" class=\"\">\r\n            不使用\r\n        </div>\r\n    </div>\r\n</div>\r\n</section>\r\n\r\n\r\n<section>\r\n<div class=\"checkout-info\">\r\n    <div class=\"item-info-table\">\r\n        <dl class=\"item-info-field\">\r\n            <dt class=\"\">商品总价: </dt>\r\n            <dd class=\"detail-price\">{{order.amount_usd | currency }}</dd>\r\n        </dl>\r\n        <dl class=\"item-info-field\">\r\n            <dt class=\"\">运费: </dt>\r\n            <dd class=\"detail-price\">{{order.cn_shipping | currency }}</dd>\r\n        </dl>\r\n        <dl class=\"item-info-field\">\r\n            <dt class=\"\">税费: </dt>\r\n            <dd class=\"detail-price\">0</dd>\r\n        </dl>\r\n    </div>\r\n</div>\r\n<div class=\"order-bottom\">\r\n    <div class=\"\">\r\n        订单号：{{order.short_id}}\r\n    </div>\r\n    <div class=\"\">\r\n        创建时间: {{order.created_at}}\r\n    </div>\r\n</div>\r\n</section>\r\n  </ion-content>\r\n  <ion-footer-bar align-title=\"left\" class=\"bar-stable\">\r\n    <a class=\"button button-clear\">\r\n        总计: <span class=\"footer-price\"> {{ order.final |currency}}</span>\r\n    </a>\r\n    <h1 class=\"title\"></h1>\r\n    <div class=\"buttons\">\r\n        <ngcart-checkout ng-if=\"order.payment_status==\'UNPAID\'\" settings=\"{ order_id: order.id , order_type: \'existed\'}\">\r\n            去付款\r\n        </ngcart-checkout>\r\n        <button class=\"button button-clear\" ng-disabled=\"order.payment_status==\'PAID\'\"\r\n            ng-if=\"order.payment_status==\'PAID\'\">\r\n            已付款\r\n        </button>\r\n        <button class=\"button button-default\"\r\n            ng-click=\"cancelOrder()\"\r\n            ng-if=\"order.payment_status==\'UNPAID\'\">\r\n            取消订单\r\n        </button>\r\n    </div>\r\n  </ion-footer-bar>\r\n</ion-view>\r\n");
$templateCache.put("orders.html","<!-- 商品详情 -->\r\n<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$state.go(\'tab.account\')\"></button>\r\n      <div class=\"title\">我的订单</div>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\">\r\n\r\n<section>\r\n<div class=\"order-btn-row\">\r\n    <div class=\"btn-group cart-btn\">\r\n        <button class=\"btn order-btn\"\r\n            ng-class=\"{\'active\': orderType == \'COMMODITIES\'}\"\r\n            ng-click=\"setType(\'COMMODITIES\')\">商城订单</button>\r\n        <button class=\"btn order-btn\"\r\n            ng-class=\"{\'active\': orderType == \'TRANSFER\'}\"\r\n            ng-click=\"setType(\'TRANSFER\')\">转运订单</button>\r\n    </div>\r\n</div>\r\n<div class=\"order-detail\" ng-repeat=\"order in orders track by $index\">\r\n    <table ng-if=\"orderType==\'COMMODITIES\'\" class=\"table ngCart cart-table\">\r\n        <thead>\r\n        <tr>\r\n            <td class=\"padding  first-cell\" colspan=\"2\">\r\n                <button class=\"button button-clear button-dark button-small\">\r\n                    订单号: {{order.short_id}}\r\n                </button>\r\n                <button class=\"button button-default button-small\">\r\n                    状态:  {{order.current_status}}\r\n                </button>\r\n            </td>\r\n            <td class=\"detail-cell\">\r\n                <a class=\"button button-stable button-small\" ng-href=\"#/order/{{order.id}}\">详情 <i class=\"icon ion-ios-arrow-right\"></i></a>\r\n            </td>\r\n        </tr>\r\n        </thead>\r\n\r\n        <tbody>\r\n        <tr ng-repeat=\"entry in order.entries track by $index\">\r\n\r\n            <td class=\"img-cell\">\r\n                <div>\r\n                    <a ng-href=\"#/order/entry/{{entry.item.item_id}}\">\r\n                        <img ng-src=\"{{entry.spec.images[0]}}\">\r\n                    </a>\r\n                </div>\r\n            </td>\r\n            <td class=\"info-cell\">\r\n                <div>{{ entry.item.title }}</div>\r\n                <div>\r\n                    <span ng-repeat=\"(k, v) in entry.spec.attributes\">\r\n                        {{ngCart.attrMap[k]}}: {{v}}\r\n                    </span>\r\n                </div>\r\n                <div class=\"btn-group cart-btn\">\r\n                    <span>数量: {{ entry.quantity | number }}</span>\r\n                </div>\r\n            </td>\r\n            <td class=\"price-cell\">{{ entry.amount_usd | currency }}</td>\r\n        </tr>\r\n        </tbody>\r\n\r\n        <tfoot>\r\n        <tr>\r\n            <td class=\"status-cell\" ng-if=\"order.payment_status==\'PAID\'\">\r\n                <a class=\"button button-default  button-small\"\r\n                    ng-href=\"#/order/logistics/{{order.id}}\">\r\n                    查看物流\r\n                </a>\r\n            </td>\r\n\r\n            <td class=\"status-cell\" ng-if=\"order.payment_status==\'UNPAID\'\">\r\n                <a class=\"button button-asseritive button-cart button-small\"\r\n                    ng-href=\"#/order/{{order.id}}\">\r\n                    去付款\r\n                </a>\r\n            </td>\r\n            <td colspan=\"2\" class=\"fee-cell\">运费:\r\n                <span class=\"price-cell\">{{ order.cn_shipping | currency }}</span>\r\n                总计:\r\n                <span class=\"price-cell\">{{ order.final | currency }}</span>\r\n            </td>\r\n        </tr>\r\n        </tfoot>\r\n    </table>\r\n\r\n    <table ng-if=\"orderType==\'TRANSFER\'\" class=\"table ngCart cart-table express\">\r\n        <thead>\r\n        <tr>\r\n            <td class=\"padding first-cell\" colspan=\"5\">\r\n                <button class=\"button button-clear  button-dark button-small\">\r\n                    订单号: {{order.short_id}}\r\n                </button>\r\n                <button class=\"button button-default button-small\">\r\n                    状态:  {{order.current_status}}\r\n                </button>\r\n                <span class=\"pull-right\">\r\n                    <a class=\"button button-default  button-small\"\r\n                        ng-href=\"#/order/transfer/{{order.id}}\">\r\n                        查看物流\r\n                    </a>\r\n                </span>\r\n            </td>\r\n\r\n        </tr>\r\n        <tr>\r\n            <td class=\"title1\">\r\n                <span>商品名称:</span>\r\n            </td>\r\n            <td class=\"cate\">\r\n                <span>类型:</span>\r\n            </td>\r\n            <td class=\"quantity1\">\r\n                <span>数量:</span>\r\n            </td>\r\n            <td class=\"value\">\r\n                <span>申报价值:</span>\r\n            </td>\r\n            <td class=\"note\">\r\n                <span>备注:</span>\r\n            </td>\r\n        </tr>\r\n        </thead>\r\n\r\n        <tbody>\r\n        <tr ng-repeat=\"entry in order.entries track by $index\">\r\n            <td class=\"title1\">\r\n                {{ entry.title }}\r\n            </td>\r\n            <td class=\"cate\">\r\n                {{ entry.main_category }}\r\n            </td>\r\n            <td class=\"quantity1\">\r\n                {{ entry.quantity }}\r\n            </td>\r\n            <td class=\"value\">\r\n                ￥{{ entry.amount }}\r\n            </td>\r\n            <td class=\"note\">\r\n                {{ entry.remark }}\r\n            </td>\r\n        </tr>\r\n        </tbody>\r\n\r\n        <tfoot>\r\n        <tr>\r\n            <td class=\"status-cell\" ng-if=\"order.payment_status==\'PAID\'\">\r\n                <a class=\"button button-default  button-small\"\r\n                    ng-href=\"#/order/logistics/{{order.id}}\">\r\n                    查看物流\r\n                </a>\r\n            </td>\r\n\r\n            <td class=\"status-cell\" ng-if=\"order.payment_status==\'UNPAID\' && order.status ==\'WAREHOUSE_IN\'\">\r\n                <a class=\"button button-asseritive button-cart button-small\"\r\n                    ng-href=\"#/order/transfer/{{order.id}}\">\r\n                    去付款\r\n                </a>\r\n            </td>\r\n            <td colspan=\"4\" class=\"fee-cell\">运费:\r\n                <span class=\"price-cell\">{{ order.cn_shipping | currency }}</span>\r\n                总计:\r\n                <span class=\"price-cell\">{{ order.final | currency }}</span>\r\n            </td>\r\n        </tr>\r\n        </tfoot>\r\n    </table>\r\n\r\n</div>\r\n</section>\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("profile.html","<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">个人资料</div>\r\n  </div>\r\n  <ion-content class=\"has-header account\">\r\n    <ion-list>\r\n\r\n      <ion-item class=\"item-divider\">\r\n      </ion-item>\r\n\r\n      <ion-item class=\"item item-icon-right\" ng-click=\"togglePhotoModal()\">\r\n          上传头像\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item item-icon-right\"  ng-click=\"setUsername()\">\r\n          用户名\r\n          <span class=\"item-note\">\r\n              {{user.getUser().name}}\r\n          </span>\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n    </ion-list>\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("settings.html","<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">设置</div>\r\n  </div>\r\n  <ion-content class=\"has-header account\">\r\n    <ion-list>\r\n      <ion-item class=\"item-divider\"></ion-item>\r\n      <ion-item class=\"item item-icon-left item-icon-right\" ng-click=\"$state.go(\'tab.like_posts\')\">\r\n          <i class=\"icon ion-ios-grid-view-outline\"></i>\r\n          赞过帖子\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item item-icon-left item-icon-right\" ng-click=\"$state.go(\'tab.favors\')\">\r\n          <i class=\"icon ion-ios-heart-outline\"></i>\r\n          收藏商品\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item-divider\"></ion-item>\r\n\r\n      <ion-item class=\"item item-icon-left item-icon-right\" ng-click=\"$state.go(\'tab.profile\')\">\r\n          <i class=\"icon ion-ios-person-outline\"></i>\r\n          个人资料\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n\r\n      <ion-item class=\"item item-icon-left item-icon-right\" ng-click=\"$state.go(\'tab.address_list\')\">\r\n          <i class=\"icon ion-ios-location\"></i>\r\n          收货地址\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n\r\n      <ion-item class=\"item-divider\"></ion-item>\r\n\r\n      <ion-item class=\"item item-icon-right\" ng-click=\"$state.go(\'tab.about\')\">\r\n          关于我们\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n\r\n      <ion-item class=\"item-divider\">\r\n      </ion-item>\r\n\r\n      <ion-item class=\"item item-icon-right\" ng-click=\"logout()\">\r\n          登出\r\n          <i class=\"icon ion-ios-arrow-right\"></i>\r\n      </ion-item>\r\n      <ion-item class=\"item-divider\"></ion-item>\r\n    </ion-list>\r\n  </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("showMore.html","<div>\r\n    <div ng-style=\'expandable&&!expanded? showLessStyle : \"\"\'>\r\n        <p ng-bind-html=\"title||\'\' | nl2br\"></p>\r\n    </div>\r\n    <div ng-if=\"expandable\" class=\"expand-btn\">\r\n        <button class=\"button button-small button-clear button-dark \"\r\n           ng-click=\'$event.stopPropagation();toggle()\'>{{expanded? \'收起\':\'展开全文\'}}\r\n        </button>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("signup.html","<ion-modal-view>\r\n  <ion-header-bar>\r\n    <div class=\"buttons\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back button-dark\" ng-click=\"closeSignupBox()\"></button>\r\n    </div>\r\n    <div class=\"title\">注册</div>\r\n  </ion-header-bar>\r\n  <ion-content class=\"signup-page overlay-content\" ng-controller=\"signupCtrl\">\r\n    <div class=\"list list-inset\">\r\n      <label class=\"item item-input\">\r\n        <input type=\"email\" placeholder=\"邮箱地址\" ng-model=\"signupForm.email\">\r\n      </label>\r\n\r\n      <label class=\"item item-input\">\r\n        <input type=\"password\" placeholder=\"密码\" ng-model=\"signupForm.password\">\r\n      </label>\r\n\r\n      <label class=\"item item-input\">\r\n        <input type=\"text\" placeholder=\"用户名\" ng-model=\"signupForm.name\">\r\n      </label>\r\n    </div>\r\n\r\n    <button class=\"button button-block login-btn\" ng-click=\"signup()\">\r\n        注册\r\n    </button>\r\n\r\n\r\n    <div class=\"third-party-box\">\r\n        <p>使用第三方账号登陆</p>\r\n        <div ng-show=\"IsWechatInstalled\" ng-click=\"oauthLogin(\'wechat\')\" class=\"login-icon wechat\"></div>\r\n        <div ng-click=\"oauthLogin(\'weibo\')\" class=\"login-icon weibo\"></div>\r\n        <div ng-click=\"oauthLogin(\'qq\')\" class=\"login-icon qq\"></div>\r\n\r\n    </div>\r\n  </ion-content>\r\n</ion-modal-view>\r\n");
$templateCache.put("specs-dialog.html","<ion-modal-view>\r\n  <ion-header-bar>\r\n    <div class=\"buttons\">\r\n      <button class=\"button button-clear\" ng-click=\"closeSpecsBox()\">关闭</button>\r\n    </div>\r\n  </ion-header-bar>\r\n  <ion-content class=\"topic-create\">\r\n    <ion-item class=\"item item-thumbnail-left\">\r\n        <img ng-src=\"{{selectedSpec.images[0]}}\">\r\n        <h2>{{item.title}}</h2>\r\n        <p>{{selectedSpec.price | currency}} x {{quantity}}</p>\r\n        <div class=\"footer-price\">{{subTotal(selectedSpec.price, quantity) | currency}}</div>\r\n    </ion-item>\r\n    <ion-item class=\"spec-options\">\r\n        <div class=\"spec-options-table\">\r\n            <dl class=\"spec-info-field\" ng-repeat=\"(k, v) in item.attributes_desc\">\r\n                <dt class=\"spec-info-key\">{{v}}</dt>\r\n                <dd class=\"spec-info-val\">\r\n                <span class=\"spec-attr\"\r\n                    ng-class=\"{\'selected\': attr==selectedAttr[k],\r\n                            \'disabled\': remainSpec.indexOf(attr) == -1}\"\r\n                    ng-click=\"setAttr(k, attr)\"\r\n                    ng-repeat=\"attr in attrChoices[k]\">\r\n                        {{attr}}\r\n                    </span>\r\n                </dd>\r\n            </dl>\r\n            <dl class=\"spec-info-field\">\r\n                <dt class=\"spec-info-key\">数量：</dt>\r\n                <dd class=\"spec-info-val\">\r\n                    <div class=\"btn-group\">\r\n                        <button class=\"btn del-num\"\r\n                            ng-click=\"setQuantity(-1, true)\">-</button>\r\n                        <button class=\"btn num\">{{quantity}}</button>\r\n                        <button class=\"btn add-num\"\r\n                            ng-click=\"setQuantity(1, true)\">+</button>\r\n                    </div>\r\n                </dd>\r\n            </dl>\r\n        </div>\r\n    </ion-item>\r\n  </ion-content>\r\n\r\n    <ion-footer-bar  class=\"bar-assertive footer-button\" >\r\n        <ngcart-addtocart id=\"{{selectedSpec.sku}}\" name=\"{{item.title}}\" price=\"{{selectedSpec.price}}\" quantity=\"{{quantity}}\" quantity-max=\"5\" data=\"selectedSpecData\">加入购物车</ngcart-addtocart>\r\n    </ion-footer-bar>\r\n\r\n</ion-modal-view>\r\n");
$templateCache.put("tabs.html","<!--\r\nCreate tabs with an icon and label, using the tabs-positive style.\r\nEach tab\'s child <ion-nav-view> directive will have its own\r\nnavigation history that also transitions its views in and out.\r\n-->\r\n<ion-tabs class=\"maybi-tabs tabs-icon-top tabs-color-active-positive {{hideTabs}}\">\r\n\r\n  <!-- Explore Tab -->\r\n  <ion-tab title=\"首页2\" icon-off=\"ion-aperture\" icon-on=\"ion-aperture\" href=\"#/explore\">\r\n    <ion-nav-view name=\"tab-explore\"></ion-nav-view>\r\n  </ion-tab>\r\n\r\n  <!-- Home Tab -->\r\n  <ion-tab title=\"购买\" icon-off=\"ion-ios-cart-outline\" icon-on=\"ion-ios-cart\" href=\"#/home\">\r\n    <ion-nav-view name=\"tab-home\"></ion-nav-view>\r\n  </ion-tab>\r\n\r\n  <!-- Photo Tab -->\r\n  <ion-tab class=\"icon-center\" title=\"\" icon-off=\"icon-center\" icon-on=\"icon-center\" ng-click=\"togglePhotoModal()\">\r\n    <ion-nav-view name=\"tab-capture\"></ion-nav-view>\r\n  </ion-tab>\r\n\r\n  <!-- Noti Tab -->\r\n  <ion-tab title=\"通知\" icon-off=\"ion-ios-bell-outline\" icon-on=\"ion-ios-bell\" href=\"#/notification\">\r\n    <ion-nav-view name=\"tab-noti\"></ion-nav-view>\r\n  </ion-tab>\r\n\r\n  <!-- Account Tab -->\r\n  <ion-tab title=\"我的\" icon-off=\"ion-ios-person-outline\" icon-on=\"ion-ios-person\" href=\"#/account\">\r\n    <ion-nav-view name=\"tab-account\"></ion-nav-view>\r\n  </ion-tab>\r\n\r\n\r\n</ion-tabs>\r\n");
$templateCache.put("transfer_logistics.html","<ion-view>\r\n  <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$state.go(\'tab.orders\')\"></button>\r\n      <div class=\"title\">物流详情</div>\r\n  </div>\r\n\r\n  <ion-content class=\"has-header\">\r\n\r\n\r\n<section ng-if=\"order.payment_status == \'PAID\'\">\r\n    <div class=\"checkout-info\">\r\n        <span class=\"addr-icon\"></span>\r\n        <div class=\"address-info\">\r\n            <p class=\"addr-header\">收货人信息: </p>\r\n            <div class=\"\">{{order.address.receiver}}</div>\r\n            <div class=\"\">{{order.address.street1}}</div>\r\n            <div class=\"\">{{order.address.street2}}</div>\r\n            <div class=\"\">{{order.address.city}}, {{order.address.state}}</div>\r\n            <div class=\"\">{{order.address.country}}, {{order.address.postcode}}</div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"checkout-info\">\r\n        <div class=\"icon partner-icon address\"></div>\r\n        <div class=\"partner-info\">\r\n            <div class=\"selected-partner\">{{order.provider.display_name}} ({{order.provider.desc}}):\r\n                <span class=\"detail-price pull-right\">{{order.cn_shipping | currency }}</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"checkout-info\">\r\n        <div class=\"icon coupon-icon address\"></div>\r\n        <div class=\"coupon-info\">\r\n            <div ng-show=\"order.discount.length==1\" class=\"\">{{order.discount[0].desc}}\r\n                <span class=\"detail-price pull-right\">- {{order.discount[0].value | currency }}</span>\r\n            </div>\r\n            <div ng-show=\"order.discount.length==0\" class=\"\">\r\n                不使用\r\n            </div>\r\n        </div>\r\n    </div>\r\n</section>\r\n\r\n<section class=\"clearfix\" ng-if=\"order.status == \'WAREHOUSE_IN\'\">\r\n    <div class=\"checkout-info\" ng-click=\"gotoAddress()\">\r\n        <div ng-show=\"addr.id\">\r\n            <span class=\"addr-icon\"></span>\r\n            <div class=\"address-info\">\r\n                <p class=\"addr-header\">寄往收货人信息: </p>\r\n                <div class=\"\">{{addr.data.receiver}}</div>\r\n                <div class=\"\">{{addr.data.street1}}</div>\r\n                <div class=\"\">{{addr.data.street2}}</div>\r\n                <div class=\"\">{{addr.data.city}}, {{addr.data.state}}</div>\r\n                <div class=\"\">{{addr.data.country}}, {{addr.data.postcode}}</div>\r\n            </div>\r\n            <div class=\"select-arrow address\"></div>\r\n        </div>\r\n        <div ng-hide=\"addr.id\">\r\n            <span class=\"addr-icon\"></span>\r\n            <div class=\"address-info\">\r\n                <div class=\"\">填写收件人信息</div>\r\n            </div>\r\n            <div class=\"go-add\">+</div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"checkout-info\">\r\n        <div class=\"icon partner-icon address\"></div>\r\n        <div class=\"partner-info\" ng-click=\"showProviderChoices()\">\r\n            <div ng-show=\"selectedProvider\" class=\"selected-partner\">\r\n                {{selectedProvider.display_name}} ({{selectedProvider.service_intro.duration}}):\r\n                <span class=\"detail-price selectable\">{{selectedProvider.cn_shipping | currency }}</span>\r\n            </div>\r\n            <div ng-hide=\"selectedProvider\" class=\"selected-partner\">请选择运输方式</div>\r\n        </div>\r\n        <div class=\"select-arrow\" ng-class=\"{\'down-arrow\': providersShown}\"></div>\r\n    </div>\r\n    <div ng-show=\"providersShown\" class=\"checkout-choices\">\r\n        <div class=\"select-row\" ng-repeat=\"provider in provider_prices\"\r\n            ng-click=\"selectPartner(provider)\">\r\n            <span class=\"select-icon\"\r\n                ng-class=\"{\'selected\': selectedProvider.name == provider.name}\">\r\n            </span>\r\n            <div class=\"checkout-choice\">\r\n                {{provider.display_name}} ({{provider.service_intro.duration}})\r\n                <span class=\"detail-price selectable\">{{provider.cn_shipping | currency }}</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"checkout-info\">\r\n        <div class=\"icon coupon-icon address\"></div>\r\n        <div class=\"coupon-info\" ng-click=\"showCouponsChoices()\">\r\n            <div ng-show=\"coupon_codes\" class=\"\">{{coupon_codes.description}}\r\n                <span class=\"detail-price selectable\">-{{coupon_codes.saving | currency }}</span>\r\n            </div>\r\n            <div ng-hide=\"coupon_codes\" class=\"\">使用折扣码/优惠券 </div>\r\n        </div>\r\n        <div class=\"select-arrow\" ng-class=\"{\'down-arrow\': couponsShown}\"></div>\r\n    </div>\r\n    <div ng-show=\"couponsShown\" class=\"checkout-choices\">\r\n        <div class=\"select-row\" ng-click=\"noCoupon()\">\r\n            <span class=\"select-icon\"\r\n                ng-class=\"{\'selected\': noCouponSelected == true}\">\r\n            </span>\r\n            <div class=\"checkout-choice\">\r\n                不使用\r\n            </div>\r\n        </div>\r\n        <div class=\"select-row\" ng-repeat=\"coupon in availableCoupons\"\r\n            ng-click=\"selectCoupon(coupon)\">\r\n            <span class=\"select-icon\"\r\n                ng-class=\"{\'selected\': coupon_codes.code == coupon.code}\">\r\n            </span>\r\n            <div class=\"checkout-choice\">\r\n                {{coupon.description}}\r\n                <span class=\"detail-price selectable\">-{{coupon.saving | currency }}</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"select-row\">\r\n            <span class=\"select-icon\"\r\n                ng-click=\"selectInputCoupon()\"\r\n                ng-class=\"{\'selected\': couponInputSelected}\">\r\n            </span>\r\n            <div class=\"checkout-choice\">\r\n                折扣码 <input ng-model=\"couponInput\" type=\"text\" class=\"\" placeholder=\"输入折扣码\">\r\n                <span class=\"detail-price selectable\">-{{coupon_codes.saving}}</span>\r\n                <span ng-click=\"confirmCoupon()\" class=\"use-btn\">使用</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</section>\r\n\r\n<section>\r\n    <div class=\"logistic-row\">\r\n        <span class=\"\">\r\n            包裹编号：{{logistic.partner_tracking_no}}\r\n        </span>\r\n        <span class=\"pull-right\">\r\n            <ul class=\"logistic-nav\">\r\n                <li class=\"\"\r\n                    ng-repeat=\"lo in order.logistics\"\r\n                    ng-if=\"order.logistics.length > 1\"\r\n                    ng-class=\"{\'current\': currTab==$index}\"\r\n                    ng-click=\"goTab($index, lo)\">\r\n                    包裹{{$index+1}}</li>\r\n            </ul>\r\n        </span>\r\n    </div>\r\n\r\n    <table class=\"table ngCart cart-table\">\r\n        <tbody>\r\n        <tr ng-repeat=\"entry in logistic.entries track by $index\">\r\n            <td class=\"img-cell\">\r\n                <div>\r\n                    <img ng-src=\"{{entry.item.primary_img}}\">\r\n                </div>\r\n            </td>\r\n            <td class=\"info-cell\">\r\n                <div>\r\n                    {{ entry.title }}\r\n                </div>\r\n                <div>\r\n                    <span>数量: {{ entry.quantity | number }}</span>\r\n                </div>\r\n                <div class=\"\">\r\n                    备注:{{ entry.remark }}\r\n                </div>\r\n                <div class=\"tracking-note\">\r\n                    <input type=\"text\" placeholder=\"请填写快递单号\"\r\n                        ng-model=\"entry.shipping_info.number\">\r\n                    <button class=\"button button-energized button-small\"\r\n                        ng-click=\"fillTracking(entry)\">\r\n                        保存\r\n                    </button>\r\n                </div>\r\n            </td>\r\n            <td class=\"price-cell\">￥{{ entry.amount }}</td>\r\n        </tr>\r\n    </table>\r\n\r\n    <div class=\"logistic-row\">\r\n        <ul class=\"progress-indicator\">\r\n            <li ng-class=\"{\'completed\': allStatus.indexOf(logistic.current_status) >= $index}\"\r\n                 ng-repeat=\"status in logistic.all_status\">\r\n                <span class=\"bubble\"></span>\r\n                <div class=\"logistic-status\">{{status.desc}}</div>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"logistic-row\">\r\n        <ul class=\"tracking\">\r\n            <li ng-repeat=\"h in logistic.history| reverse\">\r\n                <div class=\"\">{{h.desc}}</div>\r\n                <div class=\"time\">{{h.time}}</div>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n</section>\r\n\r\n  </ion-content>\r\n\r\n  <ion-footer-bar align-title=\"left\" class=\"bar-stable\">\r\n    <a class=\"button button-clear\">\r\n        总计: <span class=\"footer-price\"> {{ order.final |currency}}</span>\r\n    </a>\r\n    <h1 class=\"title\"></h1>\r\n    <div class=\"buttons\">\r\n        <ngcart-checkout ng-if=\"order.status==\'WAREHOUSE_IN\'\" settings=\"{ order_id: order.id , order_type: \'existed\'}\">\r\n            去付款\r\n        </ngcart-checkout>\r\n        <button class=\"button button-default\"\r\n            ng-click=\"cancelOrder()\"\r\n            ng-if=\"order.payment_status==\'UNPAID\'\">\r\n            取消订单\r\n        </button>\r\n    </div>\r\n  </ion-footer-bar>\r\n\r\n</ion-view>\r\n");
$templateCache.put("userDetail.html","<!-- 用户详情 -->\r\n<ion-view>\r\n    <div class=\"buttons\">\r\n        <button class=\"button button-clear icon ion-ios-arrow-back account-setting-btn pull-left\" ng-click=\"$ionicGoBack()\"></button>\r\n    </div>\r\n    <div class=\"avatar-section\">\r\n        <a class=\"logo\"\r\n            style=\"background: url({{::user.avatar_url}}) center no-repeat; background-size: cover\">\r\n        </a>\r\n        <div class=\"avatar-wrap\">\r\n            <p><img class=\"avatar\" ng-src=\"{{::user.avatar_url}}\" alt=\"\"></p>\r\n            <p class=\"user\">{{::user.name}} <follow-btn user=\"user\"></p>\r\n        </div>\r\n        <div class=\"social-btns\">\r\n            <a ng-href=\"#/userList/{{::user.id}}/followers\">\r\n                <strong>{{user.num_followers}} </strong>粉丝\r\n            </a>\r\n            <a ng-href=\"#/userList/{{::user.id}}/followings\">\r\n                <strong>{{user.num_followings}} </strong>关注\r\n            </a>\r\n        </div>\r\n    </div>\r\n\r\n    <ion-content class=\"account-view\" overflow-scroll=\'false\' delegate-handle=\"userDetailContent\" on-scroll=\"onUserDetailContentScroll()\" header-shrink scroll-event-interval=\"5\">\r\n      <div class=\"button-bar bar-light switch-bar\">\r\n          <button class=\"button button-icon\" ng-click=\"switchListStyle(\'grid\')\"\r\n              ng-class=\"gridStyle==\'grid\'? \'active\': \'\'\">\r\n              <i class=\"icon ion-grid\"></i>\r\n          </button>\r\n          <button class=\"button button-icon\" ng-click=\"switchListStyle(\'list\')\"\r\n              ng-class=\"gridStyle==\'list\'? \'active\': \'\'\">\r\n              <i class=\"icon ion-navicon\"></i>\r\n          </button>\r\n      </div>\r\n\r\n      <div class=\"view-post\">\r\n        <ion-refresher\r\n            pulling-text=\"下拉刷新...\"\r\n            on-refresh=\"doRefresh()\"\r\n            spinner=\"spiral\">\r\n        </ion-refresher>\r\n        <div class=\"list card \" ng-if=\"gridStyle == \'list\'\"\r\n            ng-repeat=\"post in posts track by $index\">\r\n            <photo-list post=\"post\" with-affix=\"false\"></photo-list>\r\n        </div>\r\n        <div class=\"\" ng-if=\"gridStyle==\'grid\'\">\r\n            <div class=\"col col-33 grid-image\" ng-repeat=\"post in posts track by $index\">\r\n                <img ng-src=\"{{::post.small_url}}\" ng-click=\"zoom(post.primary_image)\">\r\n            </div>\r\n        </div>\r\n\r\n        <div class=\"center-ico\" ng-if=\"isEmpty()\">\r\n            <i class=\"icon ion-ios-camera\"></i>\r\n\r\n            <h1 >这人还没发布过</h1>\r\n        </div>\r\n\r\n        <ion-infinite-scroll\r\n            on-infinite=\"loadMore()\"\r\n            distance=\"1\"\r\n            spinner=\'spiral\'\r\n            ng-if=\"moreDataCanBeLoaded()\">\r\n        </ion-infinite-scroll>\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("userList.html","<ion-view class=\"view-post\">\r\n    <ion-header-bar>\r\n        <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">{{::title}}</div>\r\n    </ion-header-bar>\r\n\r\n    <ion-content class=\"has-header\">\r\n\r\n    <ion-refresher\r\n        pulling-text=\"下拉刷新...\"\r\n        on-refresh=\"doRefresh()\"\r\n        spinner=\"spiral\">\r\n    </ion-refresher>\r\n\r\n    <div class=\"list card notice\" ng-repeat=\"user in users track by $index\">\r\n        <div class=\"item item-avatar\">\r\n            <img  ng-src=\"{{::user.avatar_thumb}}\"\r\n                ng-click=\"zoom(user.avatar_url)\">\r\n            <h2>{{::user.name}}\r\n                <span class=\"item-note\">\r\n                <follow-btn user=\"user\"></follow-btn>\r\n                </span>\r\n            </h2>\r\n        </div>\r\n    </div>\r\n    <div class=\"center-ico\" ng-if=\"users.length==0\">\r\n        <h1 >暂无用户</h1>\r\n    </div>\r\n    <ion-infinite-scroll\r\n        on-infinite=\"loadMore()\"\r\n        distance=\"1\"\r\n        spinner=\'spiral\'\r\n        ng-if=\"moreDataCanBeLoaded()\">\r\n    </ion-infinite-scroll>\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("item/items.html","<!-- 商品列表 -->\r\n<ion-view>\r\n    <div class=\"bar bar-header\">\r\n      <button class=\"button button-clear icon ion-ios-arrow-back\" ng-click=\"$ionicGoBack()\"></button>\r\n      <div class=\"title\">#{{title}}</div>\r\n    </div>\r\n    <ion-content class=\"has-header homepage\">\r\n        <ion-refresher\r\n            pulling-text=\"下拉刷新...\"\r\n            on-refresh=\"doRefresh()\"\r\n            spinner=\"spiral\">\r\n        </ion-refresher>\r\n\r\n        <div class=\"col col-50 animated fadeIn\"\r\n            collection-repeat=\"item in items\" ng-click=\"goItem(item.item_id)\">\r\n            <div class=\"item item-image\">\r\n                <img ng-src=\"{{item.thumbnail}}\" cache-src>\r\n            </div>\r\n            <div class=\"item item-text-wrap\" href=\"#\">\r\n                <h2 class=\"product-title\" style=\"overflow: hidden;\">{{item.title}}</h2>\r\n                <p class=\"product-prices\">\r\n                    <span class=\"curr-price\">{{item.price | currency}}</span>\r\n                    <del class=\"orig-price\">{{item.orig_price | currency}}</del>\r\n                </p>\r\n            </div>\r\n        </div>\r\n\r\n        <ion-infinite-scroll\r\n            on-infinite=\"loadMore()\"\r\n            distance=\"1\"\r\n            spinner=\'spiral\'\r\n            ng-if=\"moreDataCanBeLoaded()\">\r\n        </ion-infinite-scroll>\r\n\r\n        <div class=\"center-ico\" ng-if=\"isEmpty()\">\r\n            <i class=\"icon ion-ios-grid-view-outline\"></i>\r\n\r\n            <h1 >暂无此类商品</h1>\r\n        </div>\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("ngCart/addtocart.html","<div class=\"title\"\r\n       ng-click=\"ngCart.addItem(id, name, price, quantity, data)\"\r\n       ng-transclude>加入购物车</button>\r\n</div>\r\n");
$templateCache.put("ngCart/checkout.html","<div class=\"buttons\">\r\n    <button class=\"button button-assertive button-large button-cart pull-right\"  ng-click=\"showPaymentMethods()\">去支付</button>\r\n</div>\r\n");
$templateCache.put("photogram/home.html","<ion-view class=\"view-post\">\r\n    <ion-header-bar class=\"bar bar-header\">\r\n        <button class=\"button button-clear button-dark icon ion-navicon\"\r\n              ng-click=\"openPopover($event)\"></button>\r\n        <div class=\"title\">美比</div>\r\n    </ion-header-bar>\r\n\r\n    <ion-content class=\"has-header\" overflow-scroll=\"false\" >\r\n        <ion-refresher\r\n            pulling-text=\"下拉刷新...\"\r\n            on-refresh=\"doRefresh()\"\r\n            spinner=\"spiral\">\r\n        </ion-refresher>\r\n        <div ng-repeat=\"post in posts track by $index\">\r\n            <photo-list post=\"post\"></photo-list>\r\n        </div>\r\n\r\n        <div class=\"center-ico\" ng-if=\"isEmpty()\">\r\n            <i class=\"icon ion-ios-camera\"></i>\r\n\r\n            <h1 >No photo</h1>\r\n        </div>\r\n\r\n        <ion-infinite-scroll\r\n            on-infinite=\"loadMore()\"\r\n            distance=\"1\"\r\n            spinner=\'spiral\'\r\n            ng-if=\"moreDataCanBeLoaded()\">\r\n        </ion-infinite-scroll>\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("photogram/ionCrop.html","<div>\r\n    <input type=\"file\" id=\"browseBtn\" image=\"image\" accept=\"image/*\" style=\"display: none\"/>\r\n</div>\r\n");
$templateCache.put("photogram/like_posts.html","<ion-view class=\"view-post\">\r\n    <ion-header-bar class=\"bar bar-header\">\r\n        <button class=\"button button-clear button-dark icon ion-ios-arrow-back\"\r\n              ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">赞过帖子</div>\r\n    </ion-header-bar>\r\n\r\n    <ion-content class=\"has-header\" overflow-scroll=\"false\">\r\n        <ion-refresher\r\n            pulling-text=\"下拉刷新...\"\r\n            on-refresh=\"doRefresh()\"\r\n            spinner=\"spiral\">\r\n        </ion-refresher>\r\n        <div class=\"list card \"\r\n            ng-repeat=\"post in posts track by $index\">\r\n            <photo-list post=\"post\"></photo-list>\r\n        </div>\r\n\r\n        <div class=\"center-ico\" ng-if=\"isEmpty()\">\r\n            <i class=\"icon ion-ios-camera\"></i>\r\n\r\n            <h1 >您还没赞过吧</h1>\r\n        </div>\r\n\r\n        <ion-infinite-scroll\r\n            on-infinite=\"loadMore()\"\r\n            distance=\"1\"\r\n            spinner=\'spiral\'\r\n            ng-if=\"moreDataCanBeLoaded()\">\r\n        </ion-infinite-scroll>\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("photogram/locationModal.html","<ion-modal-view id=\"ion-google-place-container\">\r\n    <form>\r\n    <div class=\"bar bar-header item-input-inset\">\r\n        <label class=\"item-input-wrapper\">\r\n            <i class=\"icon ion-ios-search placeholder-icon\"></i>\r\n            <input class=\"google-place-search\" type=\"search\" ng-model=\"searchQuery\"\r\n                placeholder=\"输入邮编或地址\">\r\n            <input type=\"submit\" ng-click=\"search(searchQuery)\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>\r\n        </label>\r\n        <button class=\"button button-clear\" ng-click=\"closeModal()\">\r\n            取消\r\n        </button>\r\n    </div></form>\r\n    <ion-content class=\"has-header has-header\">\r\n        <ion-list>\r\n            <ion-item type=\"item-text-wrap\" ng-click=\"setCurrentLocation()\" ng-if=\"displayCurrentLocation\">\r\n                <i class=\"icon ion-ios-location\"></i> 获取当前位置\r\n            </ion-item>\r\n            <ion-item ng-repeat=\"location in locations\" type=\"item-text-wrap\" ng-click=\"selectLocation(location)\">\r\n                {{location}}\r\n            </ion-item>\r\n        </ion-list>\r\n    </ion-content>\r\n</ion-modal-view>\r\n");
$templateCache.put("photogram/my_posts.html","<ion-view class=\"view-post\">\r\n    <ion-header-bar class=\"bar bar-header\">\r\n        <button class=\"button button-clear button-dark icon ion-ios-arrow-back\"\r\n              ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">我的发布</div>\r\n    </ion-header-bar>\r\n\r\n    <ion-content class=\"has-header\" overflow-scroll=\"false\">\r\n        <ion-refresher\r\n            pulling-text=\"下拉刷新...\"\r\n            on-refresh=\"doRefresh()\"\r\n            spinner=\"spiral\">\r\n        </ion-refresher>\r\n        <div class=\"list card \"\r\n            ng-repeat=\"post in posts track by $index\">\r\n            <photo-list post=\"post\"></photo-list>\r\n        </div>\r\n\r\n        <div class=\"center-ico\" ng-if=\"isEmpty()\">\r\n            <i class=\"icon ion-ios-camera\"></i>\r\n\r\n            <h1 >您还没发布过</h1>\r\n        </div>\r\n\r\n        <ion-infinite-scroll\r\n            on-infinite=\"loadMore()\"\r\n            distance=\"1\"\r\n            spinner=\'spiral\'\r\n            ng-if=\"moreDataCanBeLoaded()\">\r\n        </ion-infinite-scroll>\r\n        <!--<div ng-if=\"!moreDataCanBeLoaded()\" class=\"item item-divider no-more-data\">没有更多数据啦!</div>-->\r\n\r\n    </ion-content>\r\n</ion-view>\r\n");
$templateCache.put("photogram/photoFilter.html","<div>\r\n    <div class=\"capture-photo\">\r\n        <img ng-src=\"{{image}}\" id=\"original-image\" style=\"display:none\">\r\n        <div vin\r\n            filter=\"\'normal\'\"\r\n            class=\"image\"\r\n            ng-class=\"{disabled: loading}\"\r\n            name=\"vin-image\"\r\n            image=\"image\"></div>\r\n        <ion-spinner ng-show=\"loading\"></ion-spinner>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("photogram/photoFilterCarousel.html","<ion-scroll direction=\"x\" scrollbar-x=\"false\" class=\"wide-as-needed  photo-carousel\">\r\n    <a ng-click=\"applyFilter(\'normal\')\" >\r\n        <div class=\"image\">\r\n            <img ng-src=\"img/vintage/normal.jpg\" id=\"normal\" >\r\n        </div>\r\n        <p>原图</p>\r\n    </a>\r\n    <a ng-repeat=\"(filter, cn) in filters\" ng-click=\"applyFilter(filter)\" >\r\n        <div class=\"image\">\r\n            <img ng-src=\"img/vintage/{{filter}}.jpg\" id=\"{{filter}}\" >\r\n        </div>\r\n        <p>{{ cn }}</p>\r\n    </a>\r\n</ion-scroll>\r\n");
$templateCache.put("photogram/photoList.html","<div class=\"list card\"  ng-click=\"goPost()\">\r\n    <div class=\"item item-avatar\" ion-affix data-affix-within-parent-with-class=\"card\">\r\n        <img  ng-src=\"{{post.user.avatar_thumb}}\" ng-click=\"$event.stopPropagation();goUser()\">\r\n        <h2>{{post.user.name}}\r\n            <div class=\"post-type\" ng-class=\"{{\'post.type.en\'}}\">\r\n                <i class=\"icon ion-bookmark\"></i> {{post.type.cn}}\r\n            </div>\r\n            <span class=\"item-note\">{{post.created_at | amTimeAgo}}</span>\r\n        </h2>\r\n    </div>\r\n\r\n    <div class=\"item item-image\" >\r\n        <img ng-src=\"{{post.large_url}}\"\r\n            ng-click=\"$event.stopPropagation();zoom()\">\r\n    </div>\r\n    <div class=\"item item-body\">\r\n        <p show-more=\'40\' class=\"post-body\" title=\"post.title\"></p>\r\n    </div>\r\n\r\n\r\n    <div class=\"item item-buttons\">\r\n        <div class=\"row\">\r\n            <div class=\"col col-50 text-left\">\r\n                <button ng-click=\"$event.stopPropagation();like()\"\r\n                    ng-class=\"post.is_liked ? \'ion-ios-heart\' : \'ion-ios-heart-outline\' \"\r\n                    class=\"button button-clear button-dark icon-left button-heart\">\r\n                    {{post.num_likes || \'喜欢\'}}\r\n                </button>\r\n                <button ng-click=\"\"\r\n                    class=\"button button-clear button-dark icon-left ion-ios-chatbubble-outline\">\r\n                    {{post.num_comments || \'评论\'}}\r\n                </button>\r\n                <button ng-click=\"$event.stopPropagation();actions()\"\r\n                    class=\"button button-clear button-dark icon-left ion-ios-more\" >\r\n                </button>\r\n            </div>\r\n            <div class=\"col col-50 text-left\">\r\n                <button ng-click=\"$event.stopPropagation();sameCity()\"\r\n                        ng-if=\"post.location\"\r\n                    class=\"button button-clear button-dark icon-left ion-ios-location\">\r\n                    <span>{{::post.location}}</span>\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"tag-row\" style=\"margin-left:12px\">\r\n        <button class=\"button button-small button-stable tag\"\r\n            ng-repeat=\"tag in post.tags track by $index\"\r\n            ng-click=\"$event.stopPropagation();searchTag(tag)\">\r\n            {{::tag}}\r\n        </button>\r\n    </div>\r\n    <div class=\"item item-divider\"></div>\r\n</div>\r\n");
$templateCache.put("photogram/photoListNoAffix.html","<div class=\"list card\"  ng-click=\"goPost()\">\r\n    <div class=\"item item-avatar\">\r\n        <img  ng-src=\"{{::post.user.avatar_thumb}}\" ng-click=\"$event.stopPropagation();goUser()\">\r\n        <h2>{{::post.user.name}}\r\n            <div class=\"post-type\" ng-class=\"{{\'post.type.en\'}}\">\r\n                <i class=\"icon ion-bookmark\"></i> {{::post.type.cn}}\r\n            </div>\r\n            <span class=\"item-note\">{{::post.created_at | amTimeAgo}}</span>\r\n        </h2>\r\n    </div>\r\n\r\n    <div class=\"item item-image\" >\r\n        <img ng-src=\"{{::post.large_url}}\"\r\n            ng-click=\"$event.stopPropagation();zoom()\">\r\n    </div>\r\n    <div class=\"item item-body\">\r\n        <p show-more=\'40\' class=\"post-body\" title=\"post.title\"></p>\r\n    </div>\r\n\r\n\r\n    <div class=\"item item-buttons\">\r\n        <div class=\"row\">\r\n            <div class=\"col col-50 text-left\">\r\n                <button ng-click=\"$event.stopPropagation();like()\"\r\n                    ng-class=\"post.is_liked ? \'ion-ios-heart\' : \'ion-ios-heart-outline\' \"\r\n                    class=\"button button-clear button-dark icon-left button-heart\">\r\n                    {{post.num_likes || \'喜欢\'}}\r\n                </button>\r\n                <button ng-click=\"\"\r\n                    class=\"button button-clear button-dark icon-left ion-ios-chatbubble-outline\">\r\n                    {{post.num_comments || \'评论\'}}\r\n                </button>\r\n                <button ng-click=\"$event.stopPropagation();actions()\"\r\n                    class=\"button button-clear button-dark icon-left ion-ios-more\" >\r\n                </button>\r\n            </div>\r\n            <div class=\"col col-50 text-left\">\r\n                <button ng-click=\"$event.stopPropagation();sameCity()\" ng-if=\"post.location\"\r\n                    class=\"button button-clear button-dark icon-left ion-ios-location\">\r\n                    <span>{{::post.location}}</span>\r\n                </button>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"tag-row\" style=\"margin-left:12px\">\r\n        <button class=\"button button-small button-stable tag\"\r\n            ng-repeat=\"tag in post.tags track by $index\"\r\n            ng-click=\"$event.stopPropagation();searchTag(tag)\">\r\n            {{::tag}}\r\n        </button>\r\n    </div>\r\n    <div class=\"item item-divider\"></div>\r\n</div>\r\n");
$templateCache.put("photogram/photoTag.html","<div class=\"photo-tag\">\r\n    <div class=\"send\">\r\n        <div class=\"arrow\"></div>\r\n        选择下面一种标签..\r\n    </div>\r\n    <div class=\"row\">\r\n        <div class=\"col col-33\" ng-click=\"selectType(\'SERVICE\')\">\r\n            <div tag-select tag-type=\"SERVICE\" ng-model=\"tags\"\r\n                class=\"tag tag-service\"\r\n                ng-class=\"type==\'SERVICE\'? \'selected\':\'unselect\'\"></div>\r\n            <p ng-class=\"type==\'SERVICE\'? \'selected\':\'\'\">服务</p>\r\n        </div>\r\n        <div class=\"col col-33\" ng-click=\"selectType(\'SHOW\')\">\r\n            <div tag-select tag-type=\"SHOW\" ng-model=\"tags\"\r\n                class=\"tag tag-show\"\r\n                ng-class=\"type==\'SHOW\'? \'selected\':\'unselect\'\"></div>\r\n            <p ng-class=\"type==\'SHOW\'? \'selected\':\'\'\">心情</p>\r\n        </div>\r\n        <div class=\"col col-33\" ng-click=\"selectType(\'TRADE\')\">\r\n            <div tag-select tag-type=\"TRADE\" ng-model=\"tags\"\r\n                class=\"tag tag-trade\"\r\n                ng-class=\"type==\'TRADE\'? \'selected\':\'unselect\'\"></div>\r\n            <p ng-class=\"type==\'TRADE\'? \'selected\':\'\'\">买卖</p>\r\n        </div>\r\n\r\n    </div>\r\n</div>\r\n");
$templateCache.put("photogram/popover.html","<ion-popover-view class=\"photo-popover\">\r\n  <ion-content>\r\n\r\n    <ion-list>\r\n      <ion-item ng-click=\"changeTab(\'\')\">\r\n          全部\r\n      </ion-item>\r\n      <ion-item ng-click=\"changeTab(\'service\')\">\r\n          服务\r\n      </ion-item>\r\n      <ion-item ng-click=\"changeTab(\'trade\')\">\r\n          买卖\r\n      </ion-item>\r\n      <ion-item ng-click=\"changeTab(\'show\')\">\r\n          心情\r\n      </ion-item>\r\n    </ion-list>\r\n\r\n  </ion-content>\r\n</ion-popover-view>\r\n");
$templateCache.put("photogram/postDetail.html","<ion-view class=\"view-post\">\r\n    <ion-header-bar>\r\n        <button class=\"button button-clear button-dark icon ion-ios-arrow-back\"\r\n              ng-click=\"$ionicGoBack()\"></button>\r\n        <div class=\"title\">详情</div>\r\n        <button class=\"button button-clear button-dark icon ion-ios-more\"\r\n              ng-click=\"actions()\"></button>\r\n    </ion-header-bar>\r\n\r\n    <ion-content class=\"has-header has-footer\" overflow-scroll=\"false\" >\r\n\r\n\r\n    <div class=\"list card animated fadeIn\">\r\n        <div class=\"item item-avatar\">\r\n            <img  ng-src=\"{{::post.user.avatar_thumb}}\" ng-click=\"goUser(post.user.id)\">\r\n            <h2>{{::post.user.name}}\r\n                <div class=\"post-type\"\r\n                    ng-class=\"post.type?post.type.en:\'UNCLASSIFIED\'\" >\r\n                    <i class=\"icon ion-bookmark\"></i> {{::post.type.cn}}\r\n                </div>\r\n                <span class=\"item-note\">{{::post.created_at | amTimeAgo}}</span>\r\n            </h2>\r\n        </div>\r\n\r\n        <div class=\"item item-image full-height\"\r\n            ng-repeat=\"img in images\"\r\n            ng-click=\"zoom(img)\" >\r\n            <img ng-src=\"{{::img}}\">\r\n        </div>\r\n\r\n        <div class=\"item item-body\">\r\n            <p class=\"post-body\" ng-bind-html=\"post.title || \'\' | nl2br\">\r\n        </div>\r\n\r\n        <div class=\"item item-buttons\">\r\n            <div class=\"row\">\r\n                <div class=\"col col-60 text-left\">\r\n                    <button ng-click=\"sameCity()\" ng-if=\"post.location\"\r\n                        class=\"button button-clear button-dark icon-left ion-ios-location\">\r\n                        <span>{{::post.location}}</span>\r\n                    </button>\r\n                </div>\r\n                <div class=\"col col-40 text-right\">\r\n                    <button ng-click=\"like()\"\r\n                        ng-class=\"post.is_liked ? \'ion-ios-heart\' : \'ion-ios-heart-outline\' \"\r\n                        class=\"button button-clear button-dark icon-left button-heart\">\r\n                        {{post.num_likes || \'喜欢\'}}\r\n                    </button>\r\n                    <button\r\n                        class=\"button button-clear button-dark icon-left ion-ios-chatbubble-outline\">\r\n                        {{post.num_comments || \'评论\'}}\r\n                    </button>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div class=\"tag-row\" style=\"margin-left:12px\">\r\n            <button class=\"button button-small button-stable tag\"\r\n                ng-repeat=\"tag in post.tags\"\r\n                ng-click=\"searchTag(tag)\">\r\n                {{::tag}}\r\n            </button>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"list avatar-row\">\r\n        <div class=\"avatar-list\">\r\n            <div class=\"avatar-pic\" ng-repeat=\"like in post.likes|limitTo:7\">\r\n                <img ng-src=\"{{::like.user.avatar_thumb}}\" ng-click=\"goUser(like.user.id)\">\r\n            </div>\r\n        </div>\r\n        <div class=\"more\" >\r\n            <a ng-href=\"#/userList/{{::post.post_id}}/postLikes\">\r\n                <img src=\"img/icons/more.jpg\">\r\n            </a>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"item item-divider\"></div>\r\n    <div class=\"list\">\r\n        <div class=\"item item-avatar\" ng-repeat=\"comment in post.comments\" ng-click=\"deleteComment(comment)\">\r\n            <img ng-src=\"{{::comment.user.avatar_thumb}}\" ng-click=\"goUser(comment.user.id)\">\r\n            <h2>{{::comment.user.name}}\r\n                <span class=\"item-note\">\r\n                    {{::comment.created_at | amTimeAgo}}\r\n                </span>\r\n\r\n            </h2>\r\n            <p>{{::comment.content}}</p>\r\n\r\n        </div>\r\n    </div>\r\n    </ion-content>\r\n\r\n    <ion-footer-bar keyboard-attach  class=\"bar bar-stable item-input-inset\">\r\n        <button ng-click=\"like()\"\r\n            ng-class=\"post.is_liked ? \'ion-ios-heart\' : \'ion-ios-heart-outline\' \"\r\n            class=\"button button-clear button-icon \">\r\n        </button>\r\n        <label class=\"item-input-wrapper\">\r\n          <input ng-model=\"message\" placeholder=\"说些什么\" type=\"text\"/>\r\n        </label>\r\n        <button class=\"button button-clear button-icon\" ng-click=\"comment()\">评论</button>\r\n    </ion-footer-bar>\r\n</ion-view>\r\n");
$templateCache.put("photogram/postModal.html","<ion-modal-view class=\"modal-post\">\r\n    <ion-header-bar>\r\n        <button class=\"button button-clear button-dark\" ng-click=\"closePost()\">取消</button>\r\n        <div class=\"title\">发布信息</div>\r\n    </ion-header-bar>\r\n    <ion-scroll direction=\"y\" style=\"right: 0;bottom: 0;left: 0;position: absolute;\"\r\n        class=\"has-header has-footer\">\r\n        <div class=\"list\">\r\n            <div class=\"item item-input post-textarea wide-as-needed primary_image\">\r\n                <a ng-click=\"editImage(form.primary_image)\" style=\"bottom: 16px;\">\r\n                    <div class=\"image\" style=\"background-image: url({{form.primary_image}});\r\n                                background-position: center;\r\n                                background-repeat: no-repeat;\r\n                                background-size: cover;\">\r\n                    </div>\r\n                </a>\r\n                <textarea ng-model=\"form.title\" autofocus placeholder=\"描述一下吧\"></textarea>\r\n            </div>\r\n            <div class=\"item item-divider\"></div>\r\n\r\n            <ion-item class=\"item item-icon-left item-icon-right\" ng-click=\"getLocation()\">\r\n                <i class=\"icon ion-ios-location\"></i>\r\n                发布于\r\n                <div class=\"item-note\">\r\n                    <ion-google-place placeholder=\"输入地址或邮编\"\r\n                        ng-model=\"form.location\"\r\n                        geocode=\"form.geo\"\r\n                        current-location=\"true\" ></ion-google-place>\r\n                </div>\r\n                <i class=\"icon ion-ios-arrow-right\"></i>\r\n            </ion-item>\r\n            <div class=\"item item-icon-left item-icon-right item-tag\" ng-model=\"form.tags\" tag-type=\"{{form.type}}\" tag-select>\r\n                <i class=\"icon ion-ios-pricetags energized\"></i>\r\n                标签\r\n                <div class=\"item-note\">\r\n                    添加\r\n                </div>\r\n                <i class=\"icon ion-ios-arrow-right\"></i>\r\n            </div>\r\n            <div class=\"tag-row\" style=\"margin-left:12px\">\r\n                <span class=\"tag selected\"\r\n                    ng-repeat=\"tag in form.tags\"\r\n                    ng-click=\"setOption(tag)\">\r\n                    {{tag}} <i class=\"ion-ios-close-empty\"></i>\r\n                </span>\r\n            </div>\r\n            <!--<div class=\"row tag-row\">\r\n                <div class=\"col col-20 tag-text\">推荐标签</div>\r\n                <div class=\"col col-80\">\r\n                    <ion-scroll direction=\"x\" scrollbar-x=\"false\">\r\n                        <div style=\"width:400px\">\r\n                            <span class=\"tag\"\r\n                                ng-repeat=\"tag in [\'买卖\',\'服务\',\'房屋\',\'心情\',\'晒\', \'约\']\"\r\n                                ng-click=\"setOption(tag)\">\r\n                                {{tag}} <i class=\"ion-ios-plus-empty\"></i>\r\n                            </span>\r\n                        </div>\r\n                    </ion-scroll>\r\n                </div>\r\n            </div>-->\r\n            <div class=\"item item-input item-stacked-label\">\r\n                <div class=\"input-label\">补充图片\r\n                    <div class=\"add-image\"\r\n                        ng-click=\"increasePhotosModal()\"\r\n                        ng-show=\"form.photos.length < 4\">\r\n                        <i class=\"icon ion-ios-plus-empty\"></i>\r\n                    </div>\r\n                </div>\r\n                <ion-scroll direction=\"x\" scrollbar-x=\"false\" class=\"wide-as-needed\">\r\n                    <a ng-repeat=\"photo in form.photos track by $index\">\r\n                       <i class=\"icon ion-ios-close\"\r\n                           ng-click=\"editAdditionImage($index)\" ></i>\r\n                        <div class=\"image add\" style=\"background-image: url({{photo}});\r\n                                    background-position: center;\r\n                                    background-repeat: no-repeat;\r\n                                    background-size: cover;\">\r\n                        </div>\r\n                    </a>\r\n                </ion-scroll>\r\n            </div>\r\n        </div>\r\n\r\n    </ion-scroll>\r\n    <ion-footer-bar class=\"bar-assertive footer-button\"\r\n        ng-click=\"submitPost(form)\" keyboard-attach >\r\n        <div class=\"title\">发表 <i class=\"icon ion-arrow-right-c\"></i></div>\r\n    </ion-footer-bar>\r\n</ion-modal-view>\r\n");
$templateCache.put("photogram/tagsModal.html"," <ion-modal-view class=\"tag-modal\">\r\n    <ion-header-bar>\r\n        <button class=\"button button-clear button-dark\" ng-click=\"closeModal()\">取消</button>\r\n        <div class=\"title\">添加标签</div>\r\n        <button class=\"button button-clear button-dark\" ng-click=\"confirmTags()\">确定</button>\r\n    </ion-header-bar>\r\n    <div class=\"bar bar-subheader item-input-inset\">\r\n        <label class=\"item-input-wrapper\">\r\n            <i class=\"icon ion-ios-search placeholder-icon\"></i>\r\n            <input type=\"search\" placeholder=\"搜索或添加新标签\" ng-model=\"ui.searchQuery\">\r\n        </label>\r\n        <button class=\"button button-clear button-icon icon ion-ios-close-empty\"\r\n            ng-click=\"clearSearch()\">\r\n        </button>\r\n    </div>\r\n\r\n    <ion-content class=\"has-subheader has-header has-footer\">\r\n        <div class=\"list\">\r\n            <ion-item ng-click=\"addNewTag()\" ng-if=\"ui.searchQuery\">\r\n                <i class=\"icon ion-ios-plus-empty\"></i> 添加新标签: {{ui.searchQuery}}\r\n            </ion-item>\r\n            <div class=\"item item-divider\">{{options.name}}</div>\r\n            <div class=\"item item-icon-right\"\r\n                ng-repeat=\"tag in options.tag_list | filter: ui.searchQuery\"\r\n                ng-click=\"setOption(tag)\">\r\n                {{tag}}\r\n                <i class=\"icon select-icon\"\r\n                    ng-class=\"compareValues(tag)? \'ion-ios-checkmark selected\':\'ion-ios-circle-outline\'\">\r\n                </i>\r\n            </div>\r\n        </div>\r\n    </ion-content>\r\n    <ion-footer-bar align-title=\"left\" class=\"bar bar-stable\">\r\n        <span class=\"button button-clear\">\r\n        已选：\r\n            <button class=\"button button-light icon-right ion-ios-close-empty tag\"\r\n                ng-repeat=\"tag in ui.checkedTags\"\r\n                ng-click=\"setOption(tag)\">\r\n                {{tag}}\r\n            </button>\r\n        </span>\r\n    </ion-footer-bar>\r\n\r\n</ion-modal-view>\r\n");
$templateCache.put("user/followButton.html","<div class=\"follow_btn\" ng-if=\"currentUserID != user.id\">\r\n    <button class=\"button button-small button-outline\"\r\n        ng-class=\"user.is_following?\'\' :\'button-energized\'\" ng-click=\"follow()\">{{user.is_following? \"已关注\":\"关注\"}}</button>\r\n\r\n</div>\r\n");}]);
'use strict';
PhotoService.$inject = ['$ionicActionSheet', 'ENV', '$jrCrop', '$rootScope', '$http', '$ionicModal', '$cordovaCamera', '$cordovaImagePicker', '$q'];
ionCropDirective.$inject = ['$jrCrop', '$ionicActionSheet'];
PhotoFilterFactory.$inject = ['$rootScope', '$q', '$ionicModal'];
vintageDirective.$inject = ['Vintage', '$timeout'];
photoFilterCarouselDirective.$inject = ['Vintage', '$timeout'];
Vintage.$inject = ['$q'];
angular
    .module('ion-photo', [
      'ionic',
      'ngCordova',
      'jrCrop'
    ])
    .factory('PhotoService', PhotoService)
    // Photo Crop
    .directive('ionCrop', ionCropDirective)
    // Photo Filter
    .factory('PhotoFilter', PhotoFilterFactory)
    .directive('vin', vintageDirective)
    .directive('photoFilter', photoFilterDirective)
    .directive('photoTag', photoTag)
    .directive('photoCarousel', photoFilterCarouselDirective)
    .factory('Vintage', Vintage);

function PhotoService($ionicActionSheet, ENV, $jrCrop, $rootScope, $http,
        $ionicModal, $cordovaCamera, $cordovaImagePicker, $q) {

    // Default Setting
    var setting = {
      jrCrop: false,
      quality: 80,
      allowEdit: false,
      correctOrientation: true,
      targetWidth: 800,
      targetHeight: 800,
      saveToPhotoAlbum: false,
      allowRotation: false,
      aspectRatio: 0
    };

    return {
      open: open,
      crop: cropModal,
      filter: filterModal,
      upload: uploadToS3,
    };

    function open(options) {
        var defer = $q.defer();
        var options = options || {};

        if (window.cordova) {
            capture(options)
                .then(function (image) {
                    console.log('resolved image');
                    defer.resolve(image);
                })
        } else {
            $rootScope.$broadcast('alert', "请到设置允许打开相机");
        }

        function capture(option) {
            var defer = $q.defer();

            // Primary Image
            if ((option.pieces === 1 && option.allowFilter === true) || option.allowEdit === true) {
                var options = {
                    quality: option.quality ? option.quality : setting.quality,
                    aspectRatio: option.aspectRatio ? option.aspectRatio : setting.aspectRatio,
                    allowRotation: option.allowRotation ? option.allowRotation : setting.allowRotation,
                    allowEdit: option.allowEdit ? option.allowEdit : setting.allowEdit,
                    correctOrientation: option.correctOrientation ? option.correctOrientation : setting.correctOrientation,
                    targetWidth: option.width ? option.width : setting.targetWidth,
                    targetHeight: option.height ? option.height : setting.targetHeight,
                    saveToPhotoAlbum: option.saveToPhotoAlbum ? option.saveToPhotoAlbum : setting.saveToPhotoAlbum,
                    destinationType: window.cordova ? Camera.DestinationType.DATA_URL : null,
                    encodingType: window.cordova ? Camera.EncodingType.JPEG : null,
                    popoverOptions: window.cordova ? CameraPopoverOptions : null,
                };
                options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                $cordovaCamera
                    .getPicture(options)
                    .then(function (imageData) {
                        defer.resolve('data:image/jpeg;base64,'+imageData);
                    }, function (err) {
                        defer.reject('Error When taking Photo:' + err);
                    });
            }
            // Multi Select
            if (option.allowFilter === false) {
                var options = {
                   maximumImagesCount: option.pieces,
                   width: option.width ? option.width : setting.targetWidth,
                   height: option.height ? option.height : setting.targetHeight,
                   quality: option.quality ? option.quality : setting.quality,
                   outputType: imagePicker.OutputType.BASE64_STRING,
                };

                if (ionic.Platform.isAndroid()) {
                    //options.outputType = imagePicker.OutputType.FILE_URI;
                } else {
                    options.outputType = imagePicker.OutputType.BASE64_STRING;
                }

                $cordovaImagePicker.getPictures(options)
                    .then(function (results) {
                        var imgs = [];
                        for (var i = 0; i < results.length; i++) {
                            imgs.push('data:image/jpeg;base64,'+results[i].replace(/(\r\n|\n|\r)/g, ""));
                        }
                        defer.resolve(imgs);
                    }, function(error) {
                        defer.reject('error when choosing photos: '+ error);
                    });
            }

            console.log('capture image', options);

            return defer.promise;
        }

        return defer.promise;
    }

    function cropModal(image, option) {
        var defer = $q.defer();
        $jrCrop.crop({
            url: image,
            aspectRatio: option.aspectRatio ? option.aspectRatio : false,
            allowRotation: option.allowRotation ? option.allowRotation : false,
            width: option.width ? option.width : setting.targetWidth,
            height: option.height ? option.height : setting.targetHeight,
            cancelText: '取消',
            chooseText: '确定'
        }).then(function(canvas) {
            defer.resolve(canvas);
        })

        return defer.promise;
    }

    function filterModal(image, callback) {
        //image = 'data:image/jpeg;base64,' + image;

        var template = '<ion-modal-view class="modal-capture"><ion-header-bar class="bar bar-header">'+
            '<button class="button button-clear button-icon ion-ios-arrow-back" ng-click="closeFilter()"></button><div class="title"></div>' +
            '<button class="button button-icon " ng-click="submitFilter()">下一步</button>' +
            '</ion-header-bar><ion-content class="has-header has-carousel"><photo-filter image="image" loading="loading"></photo-filter></ion-content>'+
            '<div class="bar bar-subfooter bar-carousel">'+
            '<photo-tag tags="form.tags" type="form.type" ng-if="currentTab==\'标签\'"></photo-tag>'+
            '<photo-carousel image="image" loading="loading" ng-if="currentTab==\'滤镜\'"></photo-carousel></div>'+
            '<div class="bar bar-footer">' +
            '<div class="bar-filter" ng-repeat="tab in [\'标签\', \'滤镜\']" ng-click="changeTab(tab)">'+
            '<div class="footer-tab" ng-class="{\'active\': currentTab==tab}" >{{tab}}</div>'+
            '</div></div>'+
            '</ion-modal-view>';
        var scope = $rootScope.$new(true);

        scope.image = image;
        scope.form = {
            photo: '',
            tags: [],
            type: '',
        };

        scope.submitFilter = function() {
            if (!scope.form.type){
                scope.$emit('alert', '请选择一个标签');
                return
            }
            var canvas = document.getElementById('vin-image'); //
            console.log('Submit Filter');
            scope.form.photo = canvas.src;
            callback(scope.form);
            scope.closeFilter();
        };

        scope.closeFilter = function(){
            console.log('Close Modal Filter');
            scope.modalFilter.hide();
            scope.modalFilter.remove();
        };

        scope.currentTab = '标签';
        scope.changeTab = function(tab){
            scope.currentTab = tab;
        };

        scope.modalFilter = $ionicModal.fromTemplate(template, {
            scope: scope
        });
        scope.modalFilter.show();
    }

    function dataURItoBlob(dataURI) {
	    var binary = atob(dataURI.split(',')[1]);
	    var array = [];
	    for (var i = 0; i < binary.length; i++) {
	        array.push(binary.charCodeAt(i));
	    }

	    var mimeString = 'image/jpeg';
	    return new Blob([new Uint8Array(array)], {
	        type: mimeString
	    });
	}

    function uploadToS3(imageData, filename, successCallback, failCallback) {
        var data = dataURItoBlob(imageData);
        var bucket = new AWS.S3({
            params: {
                Bucket: 'maybi-img'
            }
        });
        var params = {
            Key: filename,
            Body: data,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg',
            ACL: "public-read",
        };

        bucket.putObject(params, function(err, data) {
            if (err) {
                //console.log(JSON.stringify(err));
                failCallback(err);
            } else {
                //data.Location is your s3 image path
                //console.log(JSON.stringify(data));
                successCallback(data);
            }
        }).on('httpUploadProgress',function(progress) {
            // Log Progress Information
            console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
        });
    }

    function uploadThumbnails(imageData, filename) {

        window.imageResizer.resizeImage(
            successCallback,
            function (error) {
                console.log("Error : \r\n" + error);
            }, imageData, 400, 400, {
                resizeType: ImageResizer.RESIZE_TYPE_MAX_PIXEL,
                imageDataType: ImageResizer.IMAGE_DATA_TYPE_BASE64,
                format: 'jpeg',
                quality: 100,
            }
        );

        function successCallback(data){
            var bucket = new AWS.S3({
                params: {
                    Bucket: 'maybi'
                }
            });
            var params = {
                Key: '400/'+filename,
                Body: data.imageData,
                ContentEncoding: 'base64',
                ContentType: 'image/jpeg',
                ACL: "public-read",
            };

            bucket.putObject(params, function(err, data) {
                if (err) {
                    //console.log(JSON.stringify(err));
                } else {
                    //data.Location is your s3 image path
                    //console.log(JSON.stringify(data));
                }
            }).on('httpUploadProgress',function(progress) {
                // Log Progress Information
                console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
            });
        }


    }

}

// jrCrop
function ionCropDirective($jrCrop, $ionicActionSheet) {

    return {
        restrict: 'A',
        scope: {
            ngModel: '=',
            option: '=',
            cropSave: '&'
        },
        templateUrl: 'photogram/ionCrop.html',
        link: ionCropLink
    };

    function ionCropLink(scope, element) {

        // Triggered on a button click, or some other target
        scope.action = action;
        element.bind('click', getElem);
        scope.crop = crop;
        angular.element(document.getElementById('browseBtn'))
            .on('change', fileUpload);


        function getElem() {
            document.getElementById('browseBtn').click();
        }

        // Show the action sheet
        function action() {
            var buttons = [{
                text: '<i class="icon ion-camera"></i> 拍照'
            }, {
                text: '<i class="icon ion-images"></i> 相册'
            }];
            $ionicActionSheet.show({
              buttons: buttons,
              titleText: '裁剪',
              cancelText: '取消',
              buttonClicked: function (index) {

                if (index === 0) {
                  console.log('Photo Camera');
                }
                // Photo Album
                if (index === 1) {
                  document.getElementById('browseBtn')
                    .click();
                }
                return true;
              }
            });
        }

        function fileUpload(e) {

            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = function (event) {
              var image = event.target.result;
              scope.crop(image);
            };

            // Clear input file
            angular.element(document.getElementById('browseBtn'))
                .val('');

        }

        function crop(image) {

            console.log(scope.option);

            $jrCrop.crop({
                url: image,
                width: scope.option ? scope.option.width : 200,
                height: scope.option ? scope.option.height : 200,
                cancelText: 'Cancel',
                chooseText: 'Save'
            }).then(function (canvas) {
                var image = canvas.toDataURL();
                //            var name = $scope.option ? $scope.option.name : 'thumb';
                //            var filename = ($scope.option ? $scope.option.name : '') + '_' + name + window.Number(new window.Date() + '.jpg';

                //var file = base64ToBlob(image.replace('data:image/png;base64,', ''), 'image/jpeg');
                //            file.name = filename;

                //upload(file);
                console.log(image);
                scope.ngModel = image;
            });

        }
    }
}

// Photo Filter
function PhotoFilterFactory($rootScope, $q, $ionicModal) {

    return {
        load: modalFilter
    };

    function modalFilter(image, done) {
        var template =
            '<ion-modal-view class="modal-capture"><ion-header-bar>'+
            '<button class="button button-clear button-icon ion-ios-arrow-back" ng-click="closeCapture()"></button>'+
            '<div class="title"></div>' +
            '<button class="button button-icon " ng-click="submitCapture()">下一步</button>' +
            '</ion-header-bar><ion-content><photo-filter image="form.photo"></photo-filter></ion-content></ion-modal-view>';


        var image = image.toDataURL();

        var scope = $rootScope.$new(true);
        scope.closeCapture = closeModalCapture;
        scope.submitCapture = submitCapture;
        scope.form = {
            photo: image
        };

        scope.modal = $ionicModal.fromTemplate(template, {
            scope: scope
        });

        scope.modal.show();

        function submitCapture() {
            var canvas = document.getElementById('vin-image');
            var dataUrl = canvas.src;
            done(dataUrl);
            closeModalCapture();
        }

        function closeModalCapture() {
            scope.modal.hide();
            scope.modal.remove();
        }
    }
}

function photoFilterDirective() {
    return {
      restrict: 'E',
      scope: {
        image: '=',
        loading: '='
      },
      transclude: true,
      templateUrl: 'photogram/photoFilter.html'
    };
}

function photoFilterCarouselDirective(Vintage, $timeout) {
    return {
        restrict: 'E',
        scope: {
            image: '=',
            loading: '='
        },
        templateUrl: 'photogram/photoFilterCarousel.html',
        link: function (scope, elem, attrs) {
            scope.filters = Vintage.filters;
            scope.applyFilter = function(effect) {
                var originalImage = document.getElementById('original-image');
                var currImage = document.getElementById('vin-image');
                currImage.src = originalImage.src;
                scope.loading = true;
                if (effect == 'normal') {
                    scope.loading = false;
                } else {
                    Vintage.effect(effect).
                        then(function(resp){
                          scope.loading = false;
                        })
                }
            }
        }
    };
}

function photoTag() {
    return {
        restrict: 'E',
        scope: {
            tags: '=',
            type: '=',
        },
        templateUrl: 'photogram/photoTag.html',
        link: function (scope, elem, attrs) {
            scope.tags = [];
            scope.selectType = function(type){
                scope.type = type;
            }
        }
    };
}

function vintageDirective(Vintage, $timeout) {
    return {
      restrict: 'A',
      scope: {
        filter: '=',
        name: '@',
        image: '=',
        loading: '='
      },
      template: '<img ng-src="{{ image }}" id="{{ name }}">',
    };
}

function Vintage($q){
    var vintagePresetsCN = {
      'vintage': '葡萄',
      'sepia': '褐色',
      'greenish': '绿意',
      'reddish': '泛红',
      'random': '随机',
    };


    var vintagePresets = {
      /**
       * Basic vintage effect
       */
      vintage: {
        curves: (function() {
          var rgb = function (x) {
            return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
          },
          r = function(x) {
            return -0.2 * Math.pow(255 * x, 0.5) * Math.sin(Math.PI * (-0.0000195 * Math.pow(x, 2) + 0.0125 * x ) ) + x;
          },
          g = function(x) {
            return -0.001045244139166791 * Math.pow(x,2) + 1.2665372554875318 * x;
          },
          b = function(x) {
            return 0.57254902 * x + 53;
          },
          c = {r:[],g:[],b:[]};
          for(var i=0;i<=255;++i) {
            c.r[i] = r( rgb(i) );
            c.g[i] = g( rgb(i) );
            c.b[i] = b( rgb(i) );
          }
          return c;
        })(),
        screen: {
          r: 227,
          g: 12,
          b: 169,
          a: 0.15
        },
        vignette: 0.7,
        viewFinder: false // or path to image 'img/viewfinder.jpg'
      },
      /**
       * Sepia effect
       */
      sepia: {
        curves: (function() {
          var rgb = function (x) {
            return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
          },
          c = {r:[],g:[],b:[]};
          for(var i=0;i<=255;++i) {
            c.r[i] = rgb(i);
            c.g[i] = rgb(i);
            c.b[i] = rgb(i);
          }
          return c;
        })(),
        sepia: true
      },
      /**
       * Greenish effect
       */
      greenish: {
        curves: (function() {
          var rgb = function (x) {
            return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
          },
          c = {r:[],g:[],b:[]};
          for(var i=0;i<=255;++i) {
            c.r[i] = rgb(i);
            c.g[i] = rgb(i);
            c.b[i] = rgb(i);
          }
          return c;
        })(),
        vignette: 0.6,
        lighten: 0.1,
        screen: {
          r: 255,
          g: 255,
          b: 0,
          a: 0.15
        }
      },
      /**
       * Reddish effect
       */
      reddish: {
        curves: (function() {
          var rgb = function (x) {
            return -12 * Math.sin( x * 2 * Math.PI / 255 ) + x;
          },
          c = {r:[],g:[],b:[]};
          for(var i=0;i<=255;++i) {
            c.r[i] = rgb(i);
            c.g[i] = rgb(i);
            c.b[i] = rgb(i);
          }
          return c;
        })(),
        vignette: 0.6,
        lighten: 0.1,
        screen: {
          r: 255,
          g: 0,
          b: 0,
          a: 0.15
        }
      },
      random: function () {
        var d = [!1, "assets/images/viewfinder.jpg"],
            g = 30 - Math.floor(60 * Math.random()),
            a = 30 - Math.floor(60 * Math.random()),
            h = function () {
                if (0.5 <= Math.random()) return !1;
                for (var a = 5 <= Math.random(), d = 5 <= Math.random() ? d : function (a) {
                    return a
                }, g = a ? g : function (a) {
                    return a
                }, h = a ? h : function (a) {
                    return a
                }, k = a ? k : function (a) {
                    return a
                }, a = {
                    r: [],
                    g: [],
                    b: []
                }, p = 0; 255 >= p; ++p) a.r[p] =
                g(d(p)),
                a.g[p] = h(d(p)),
                a.b[p] = k(d(p));
                return a
            }(),
            k;
        k = 0.5 <= Math.random() ? !1 : {
                r: Math.floor(255 * Math.random()),
                g: Math.floor(255 * Math.random()),
                b: Math.floor(255 * Math.random()),
                a: 0.4 * Math.random()
            };
        return {
                contrast: g,
                brightness: a,
                curves: h,
                screen: k,
                desaturate: Math.random(),
                vignette: Math.random(),
                lighten: 0.3 * Math.random(),
                noise: Math.floor(50 * Math.random()),
                viewFinder: false,
                sepia: 0.5 <= Math.random()
            }
        }
    };

    return {
      filters: vintagePresetsCN,
      effect: filter,
    };

    function filter(effect) {
        var defer = $q.defer();
        var image = document.getElementById('vin-image');

        var options = {
            onError: function() {
                alert('ERROR');
            },
            onStop: function() {
                defer.resolve(effect);
            }
        };
        var eff = effect!='random' ? vintagePresets[effect] : vintagePresets[effect]();

        new VintageJS(image, options, eff);

        return defer.promise;
    }
}

'use strict';

PhotogramFactory.$inject = ['FetchData', 'ENV', '$http', '$q', '$rootScope', 'Storage', 'PhotoService'];
photoList.$inject = ['Photogram', '$q', '$timeout', '$rootScope', '$state', 'photoShare'];
photoShare.$inject = ['$rootScope', 'Photogram', '$ionicActionSheet', '$cordovaSocialSharing', 'sheetShare', 'AuthService', '$ionicPopup'];
var photogramModule = angular.module('maybi.photogram', [])

photogramModule.factory('Photogram', PhotogramFactory);
photogramModule.directive('photoList', photoList);
photogramModule.service('photoShare', photoShare);

function PhotogramFactory(FetchData, ENV, $http, $q, $rootScope, Storage, PhotoService) {

    var posts = [];
    var currentTab = '';
    var hasNextPage = true;
    var isEmpty = false;
    var nextPage = 0;
    var perPage = 10;

    return {
        post: createPost,
        delPost: delPost,
        getDetail: getDetail,
        search: search,
        addComment: addComment,
        deleteComment: deleteComment,
        like: like,
        unlike: unlike,
        report: report,

        getUserPosts: getUserPosts,
        getUserLikes: getUserLikes,
        fetchTopPosts: fetchTopPosts,
        increaseNewPosts: increaseNewPosts,
        getPosts: function() {
            return posts;
        },
        setCurrentTab: function(tab) {
            currentTab = tab;
        },
        getCurrentTab: function() {
            return currentTab;
        },
        hasNextPage: function() {
            return hasNextPage;
        },
        isEmpty: function() {
            return isEmpty;
        },
    };

    function increaseNewPosts() {
        var deferred = $q.defer();
        $http.get(ENV.SERVER_URL + '/api/post/list', {
            params: {
                type: currentTab,
                page: nextPage,
                per_page: perPage,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.posts.length < perPage) {
                    hasNextPage = false;
                }
                nextPage++;
                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

    function fetchTopPosts() {
        var deferred = $q.defer();
        hasNextPage = true;
        isEmpty = false;

        $http.get(ENV.SERVER_URL + '/api/post/list', {
            params: {
                type: currentTab,
                page: 0,
                per_page: perPage,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.posts.length < perPage) {
                    hasNextPage = false;
                }
                nextPage=1;
                if (r.posts.length === 0) {
                    isEmpty = true;
                }

                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

    function getUserPosts(userId, page) {
        var deferred = $q.defer();
        hasNextPage = true;
        isEmpty = false;

        $http.get(ENV.SERVER_URL + '/api/post/list', {
            params: {
                page: page,
                per_page: perPage,
                user_id: userId,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.posts.length < perPage) {
                    hasNextPage = false;
                }
                if (page == 0 && r.posts.length === 0) {
                    isEmpty = true;
                }
                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

    function getUserLikes(userId, page) {
        var deferred = $q.defer();
        hasNextPage = true;
        isEmpty = false;

        $http.get(ENV.SERVER_URL + '/api/post/likes', {
            params: {
                page: page,
                per_page: perPage,
                user_id: userId,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.posts.length < perPage) {
                    hasNextPage = false;
                }
                if (page == 0 && r.posts.length === 0) {
                    isEmpty = true;
                }
                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

    function search(query) {
        var deferred = $q.defer();
        hasNextPage = true;
        isEmpty = false;

        $http.get(ENV.SERVER_URL + '/api/post/list', {
            params: {
                type: currentTab,
                page: 0,
                per_page: perPage,
                title: query,
            }
        }).success(function(r, status) {
            if (status === 200 && r.message == "OK"){
                if (r.posts.length < perPage) {
                    hasNextPage = false;
                }
                if (r.posts.length === 0) {
                    isEmpty = true;
                }
                nextPage = 1;
                deferred.resolve(r);
            } else {
                deferred.reject();
            }
        }).error(function (data){
            deferred.reject();
        });
        return deferred.promise;
    }

    function createPost(form) {
        var deferred = $q.defer();
        var primary_filename = 'primary/' + new Date().getTime() + ".jpeg";

        PhotoService.upload(form.primary_image, primary_filename,
            function(data){
                $http.post(ENV.SERVER_URL + '/api/post/image_uploaded', {
                    url: primary_filename,
                    type: 'primary_image',
                });
                $rootScope.$broadcast('alert', "发送成功");

            }, function(error){
                $rootScope.$broadcast('alert', "发送失败，请重试");
                deferred.reject(error);
                return deferred.promise;
            });

        form.primary_image = 'http://assets.maybi.cn/'+primary_filename;

        var photos = [];
        angular.forEach(form.photos, function(img, index){
            var filename = 'photo/'+index+'/' + new Date().getTime() + ".jpeg";
            PhotoService.upload(img, filename,
                function(data){
                    $http.post(ENV.SERVER_URL + '/api/post/image_uploaded', {
                        url: filename,
                        type: 'photos',
                    });

                }, function(error){
                    deferred.reject(error);
                    return deferred.promise;
                });

            photos.push('http://assets.maybi.cn/'+filename);

        });

        form.photos = photos;

        FetchData.post('/api/post/create', form)
            .then(function(r) {
                deferred.resolve(r);
            }).catch(function (error){
                deferred.reject(error);
            });

        return deferred.promise;

    }


    function delPost(postId) {
        var deferred = $q.defer();

        FetchData.post('/api/post/delete/'+ postId).then(function(r) {
            deferred.resolve(r);
        }).catch(function (error){
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getDetail(postId) {
        var deferred = $q.defer();

        FetchData.get('/api/post/detail/' + postId)
            .then(function(r) {
                deferred.resolve(r);
            }).catch(function (error){
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function addComment(postId, text) {
        var deferred = $q.defer();

        FetchData.post('/api/post/comment/add', {
            post_id: postId,
            content: text,
        }).then(function(r) {
            deferred.resolve(r);
        }).catch(function (error){
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function deleteComment(commentId, postId) {
        var deferred = $q.defer();

        FetchData.post('/api/post/comment/delete', {
            comment_id: commentId,
            post_id: postId,
        }).then(function(r) {
            deferred.resolve(r);
        }).catch(function (error){
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function like(postId) {
        var deferred = $q.defer();

        FetchData.post('/api/post/like/'+postId)
            .then(function(r) {
                deferred.resolve(r);
            }).catch(function (error){
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function unlike(postId) {
        var deferred = $q.defer();

        FetchData.post('/api/post/unlike/'+postId)
            .then(function(r) {
                deferred.resolve(r);
            }).catch(function (error){
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function report(postId, subject) {
        var deferred = $q.defer();

        FetchData.post('/api/post/report', {
            post_id: postId,
            subject: subject
        }).then(function(r) {
            deferred.resolve(r);
        }).catch(function (error){
            deferred.reject(error);
        });

        return deferred.promise;
    }
}

function photoList(Photogram, $q, $timeout, $rootScope, $state, photoShare){
    return {
        restrict: 'E',
        scope: {
            post: '=',
            withAffix: '=',
        },
        replace: true,
        link: function(scope, elem, attrs) {
            scope.like = function(){
                if (scope.post.is_liked){
                    scope.post.is_liked = false;
                    scope.post.num_likes -= 1;
                    Photogram.unlike(scope.post.post_id)
                        .then(function(data){
                        }).catch(function(error){
                            scope.post.is_liked = true;
                            scope.post.num_likes += 1;
                        });
                } else {
                    scope.post.is_liked= true;
                    scope.post.num_likes += 1;
                    Photogram.like(scope.post.post_id)
                        .then(function(data){
                        }).catch(function(error){
                            scope.post.is_liked= false;
                            scope.post.num_likes -= 1;
                        });
                }
            };
            scope.goPost = function() {
                for(var name in $state.current.views) {
                    var name = name;
                }

                if (name=="tab-explore"){
                    $state.go('tab.postDetail', {postID: scope.post.post_id});
                } else {
                    $state.go('tab.myPostDetail', {postID: scope.post.post_id});
                }
            };
            scope.actions = function(){
                photoShare.popup(scope.post);
            }
            scope.zoom = function() {
                if (ionic.Platform.isAndroid()) {
                    PhotoViewer.show(scope.post.primary_image, ''); //cordova photoviewer
                } else {
                    ImageViewer.show(scope.post.primary_image);    // cordova ImageViewer for IOS
                }
            };

            scope.goUser = function(){
                $state.go('tab.userDetail', {userID: scope.post.user.id});
            };

            scope.searchTag = function(tag){

            };
        },


        templateUrl: function(element, attrs) {
            if ( typeof attrs.withAffix == 'undefined' ) {
                return 'photogram/photoList.html';
            } else {
                return 'photogram/photoListNoAffix.html';
            }
        },
    }

}

function photoShare($rootScope, Photogram, $ionicActionSheet, $cordovaSocialSharing,
        sheetShare, AuthService, $ionicPopup){

    this.popup = function(post) {
      var sheet = {};
      sheet.destructiveText = '<i class="icon fa fa-info-circle"></i> 举报';
      sheet.cancelText = '取消';
      sheet.buttonClicked = buttonClicked;
      sheet.destructiveButtonClicked = destructiveButtonClicked;
      sheet.cssClass = 'actions-menu';
      sheet.buttons = [{
        text: '<i class="icon fa fa-share-alt"></i> 分享'
      }];
      if (post.user.id == AuthService.getUser().id) {
          sheet.buttons.push({
            text: '<i class="icon fa fa-trash"></i> 删除'
          })
      }

      $ionicActionSheet.show(sheet);

      function destructiveButtonClicked(){
        var buttons = [
            { text: '垃圾广告' },
            { text: '虚假信息' },
            { text: '恶意攻击' },
            { text: '暴力色情' },
            { text: '触犯法规' },
            { text: '其他原因' },
        ];
        $ionicActionSheet.show({
            buttons: buttons,
            titleText: '举报原因',
            cssClass: 'actions-menu',
            cancelText: '取消',
            buttonClicked: function(index) {
                var subject = buttons[index].text;
                Photogram.report(post.post_id, subject).then(function(data){
                    $rootScope.$emit('alert', "已举报");
                });
                return true;
            }
        });
        return true;
      }

      function buttonClicked(index) {

        if (index == 0){
            if ($rootScope.IsWechatInstalled && $rootScope.IsQQInstalled){
                sheetShare.popup(post, 'post');
            } else {
                var message = "分享图片",
                    subject = '分享',
                    file = post.primary_image,
                    link = "http://www.may.bi";

                $cordovaSocialSharing
                    .share(message, subject, file, link) // Share via native share sheet
                    .then(function(result) {
                        console.log('result:' + result);
                    }, function(err) {
                        $rootScope.$emit('alert', err);
                    });
            }

        } else if (index == 1) {
            Photogram.delPost(post.post_id).then(function(data){
                $rootScope.$emit('alert', "删除成功");
            })

        }
        return true;

      }
    }


}

angular.module('ion-geo', [])
    .service('geoService', ['$ionicPlatform', '$q', '$cordovaGeolocation',
            function($ionicPlatform, $q, $cordovaGeolocation){
        this.getLocation = getLocation;

        function getLocation() {
            return $q(function (resolve, reject) {
                var posOptions = {timeout: 9000, enableHighAccuracy: false};
                $ionicPlatform.ready(function() {
                    $cordovaGeolocation.getCurrentPosition(posOptions)
                        .then(function (position) {
                            resolve(position);
                        }, function (error) {
                            error.from = 'getLocation';
                            reject(error);
                        });
                })
            });
        }

    }])
    .directive('ionGooglePlace', [
        '$ionicModal',
        '$ionicPlatform',
        '$http',
        '$q',
        '$timeout',
        '$rootScope',
        'geoService',
        function($ionicModal, $ionicPlatform, $http, $q, $timeout, $rootScope, geoService) {
            return {
                require: '?ngModel',
                restrict: 'E',
                template: '<input type="text" readonly="readonly" id="ion-geo" class="ion-google-place" autocomplete="off">',
                replace: true,
                scope: {
                    ngModel: '=?',
                    geocode: '=?',
                    currentLocation: '@',
                },
                link: function(scope, element, attrs, ngModel) {
                    var unbindBackButtonAction;

                    scope.locations = [];
                    var searchEventTimeout = undefined;

                    scope.displayCurrentLocation = false;
                    scope.currentLocation = scope.currentLocation === "true"? true:false;

                    if(!!navigator.geolocation && scope.currentLocation){
                        scope.displayCurrentLocation = true;
                    }

                    $ionicModal.fromTemplateUrl('photogram/locationModal.html', {
                        scope: scope,
                        focusFirstInput: true,
                        animation: 'slide-in-right',
                    }).then(function(modal){

                        scope.popup = modal;

                        scope.selectLocation = function(location){
                            ngModel.$setViewValue(location);
                            ngModel.$render();
                            scope.popup.hide();

                            if (unbindBackButtonAction) {
                                unbindBackButtonAction();
                                unbindBackButtonAction = null;
                            }
                            scope.$emit('ionGooglePlaceSetLocation',location);
                        };

                        scope.setCurrentLocation = function(){
                            var location = '正在获取位置...';
                            ngModel.$setViewValue(location);
                            ngModel.$render();
                            scope.popup.hide();
                            reverseGeocoding(scope.geocode)
                                .then(function(location){
                                    ngModel.$setViewValue(location);
                                    element.attr('value', location);
                                    ngModel.$render();
                                }).catch(function(error){
                                    console.log('erreur catch', JSON.stringify(error));
                                    var location = '获取当前位置失败';
                                    ngModel.$setViewValue(location);
                                    ngModel.$render();
                                    scope.popup.hide();
                                    $timeout(function(){
                                        ngModel.$setViewValue(null);
                                        ngModel.$render();
                                        scope.popup.hide();
                                    }, 2000);
                                });
                        };

                        scope.search = function(query){
                            if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                            searchEventTimeout = $timeout(function() {
                                if(!query) return;
                                //if(query.length < 3);

                                $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
                                    params: {
                                        address: query,
                                        language: 'en',
                                        key: 'AIzaSyC57Wo22mMcQufa-9I0LHQl9XXr0Nu0IiU',
                                    }
                                }).success(function(res){
                                    var addresses = [];
                                    angular.forEach(res['results'], function(address){
                                        var formatted_addr = getAvailableAddress(address);
                                        if (formatted_addr) {
                                            addresses.push(formatted_addr);
                                        }
                                    })
                                    scope.locations = addresses;
                                }).catch(function(err){
                                    console.log(JSON.stringify(err));
                                });
                            }, 350); // we're throttling the input by 350ms to be nice to google's API
                        };

                        scope.closeModal = function(){

                        }

                        var onClick = function(e){
                            e.preventDefault();
                            e.stopPropagation();

                            unbindBackButtonAction = $ionicPlatform.registerBackButtonAction(closeOnBackButton, 250);

                            scope.popup.show();
                        };

                        scope.closeModal = function(){
                            scope.searchQuery = '';
                            scope.popup.hide();

                            if (unbindBackButtonAction){
                                unbindBackButtonAction();
                                unbindBackButtonAction = null;
                            }
                        };

                        closeOnBackButton = function(e){
                            e.preventDefault();

                            scope.popup.hide();

                            if (unbindBackButtonAction){
                                unbindBackButtonAction();
                                unbindBackButtonAction = null;
                            }
                        }

                        element.bind('click', onClick);
                        element.bind('touchend', onClick);
                    });

                    if(attrs.placeholder){
                        element.attr('placeholder', attrs.placeholder);
                    }

                    ngModel.$formatters.unshift(function (modelValue) {
                        if (!modelValue) return '';
                        return modelValue;
                    });

                    ngModel.$parsers.unshift(function (viewValue) {
                        return viewValue;
                    });

                    ngModel.$render = function(){
                        if(!ngModel.$viewValue){
                            element.val('');
                        } else {
                            element.val(ngModel.$viewValue || '');
                        }
                    };

                    scope.$on("$destroy", function(){
                        if (unbindBackButtonAction){
                            unbindBackButtonAction();
                            unbindBackButtonAction = null;
                        }
                    });

                    function reverseGeocoding(location) {
                        return $q(function (resolve, reject) {
                            var lat = location[1];
                            var lng = location[0];
                            $http.get('https://maps.googleapis.com/maps/api/geocode/json', {
                                params: {
                                    latlng: lat + ',' + lng,
                                    language: 'en',
                                    key: ''
                                }
                            }).success(function(res){
                                var results = res['results'];
                                if (res['status'] == 'OK') {
                                    if (results[1]) {
                                        var formatted_addr = getAvailableAddress(results[1]);
                                    } else {
                                        var formatted_addr = getAvailableAddress(results[0]);
                                    }
                                    resolve(formatted_addr);
                                } else {
                                    var error = {
                                        status: res['status'],
                                        from: 'reverseGeocoding'
                                    };
                                    reject(error);
                                }
                            }).catch(function(err){
                                console.log(JSON.stringify(err));
                                reject(error);
                            })
                        });
                    }

                    function getAvailableAddress(address) {
                        var elements = {};
                        var formatted_addr = null;
                        angular.forEach(address.address_components, function (address_component) {
                            elements[address_component.types[0]] = address_component.short_name;
                        });
                        if (elements.locality && elements.administrative_area_level_1) {
                            formatted_addr = [elements.locality,
                                elements.administrative_area_level_1,
                                elements.country].join(',');
                        }

                        return formatted_addr;
                    }
                }
            };
        }
    ]);

(function(){

angular.module('tag-select', [])
.directive('tagSelect', ['$ionicModal','$timeout', '$filter', '$cordovaToast', 'FetchData', function ($ionicModal, $timeout, $filter, $cordovaToast, FetchData) {
    return {
        restrict: 'A',
        require : 'ngModel',
        scope: {
            ngModel: '=?',
            tagType: '@',
        },
        link: function (scope, iElement, iAttrs, ngModelController) {

            scope.ui = {
                checkedTags: scope.ngModel,
                value: null,
                searchQuery: ''
            };

            // getting options template

            /*
            ngModelController.$render = function(){
                scope.ui.value = ngModelController.$viewValue;
            };
            */

            scope.confirmTags = function(){
                ngModelController.$setViewValue(scope.ui.checkedTags);
                ngModelController.$render();

                scope.modal.hide().then(function(){
                    scope.ui.searchQuery = '';
                });

            };
            scope.setOption = function(tag){
                // add or remove tag
                if (!getTagByName(tag)) {
                    if (scope.ui.checkedTags.length < 3){
                        scope.ui.checkedTags.push(tag);
                    } else {
                        $cordovaToast.show('最多只能添加3个标签哦', 'short', 'center')
                    }
                } else {
                    removeTagByName(tag);
                }
            }

            scope.compareValues = function(tag){
                return getTagByName(tag);
            };

            var getTagByName = function(tag){
                var found = null;
                angular.forEach(scope.ui.checkedTags, function (t) {
                    if  (t === tag) {
                        found = tag ;
                    }
                });
                return found;
            }

            var removeTagByName = function(tag){
                angular.forEach(scope.ui.checkedTags, function (t, index) {
                    if  (t == tag) {
                        scope.ui.checkedTags.splice(index, 1);
                    }
                });
            }

            scope.clearSearch = function(){
                scope.ui.searchQuery= '';
            };

            scope.closeModal = function(){
                scope.modal.hide();
            };

            scope.addNewTag = function(){
                var tag = scope.ui.searchQuery;
                scope.setOption(tag);
                scope.clearSearch();

            }

            //loading the modal
            $ionicModal.fromTemplateUrl('photogram/tagsModal.html', {
                scope: scope,
                animation: 'slide-in-right',
            }).then(function(modal){
                scope.modal = modal;
            });

            scope.$on('$destroy', function(){
                scope.modal.remove();
            });

            iElement.on('click', function(){
                scope.modal.show();
                FetchData.get('/api/post/tags/'+scope.tagType).then(function(data){
                    scope.options = data.tags_group;
                });

            });

            //#TODO ?: WRAP INTO $timeout?
            ngModelController.$render();

        }
    };
}])

})();
