//angularjs的一般基础功能模块
angular.module('sun',['components','basics']);
angular.module('basics',['baseConf','staticVal','factor','commonService']);
angular.module('baseConf',[])
    //处理angularjs与jquery表单提交的形式不同，后台接收可能不到传参。
    .config(function($httpProvider) {
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
            var param = function(obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '='
                        + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]'
                ? param(data)
                : data;
        }];
    })
    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            try{
                text = text.replace(/<[//]{0,1}(script|style)[^><]*>/ig,"");
                text = text.replace(/(onabort|onblur|onchange|onclick|ondblclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onreset|onresize|onselect|onsubmit|onunload)/ig,'马赛克');
                //<a href="http://www.baidu.com" target="_blank">hello</a>
                //if(text){
                //    /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/
                //}else{
                //    text = "your script is not allowed!only a style!"
                //}
                text = '<pre style="width:inherit;white-space: pre-wrap;word-wrap: break-word;">'+text+'</pre>';
                return $sce.trustAsHtml(text);
            }catch(e){
            }
        };
    }])
;
angular.module('factor',[])
    //socket服务
    .factory('socket',function($rootScope,global){
        var socket = io(global.SocketAddr ,
        //var socket = io('ws://121.41.123.2:5000',
            {
                //"pingInterval":1000,
                //"pingTimeout":60000
            }
        );
        return{
            on:function(eventName,callback){
                socket.on(eventName,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        callback.apply(socket,args);
                    });
                });
            },
            emit:function(eventName,data,callback){
                socket.emit(eventName,data,function(){
                    var args = arguments;
                    $rootScope.$apply(function(){
                        if(callback){
                            callback.apply(socket,args);
                        }
                    });
                });
            },
            socket1:socket
        };
    })
    .factory('global',function(){
        var host = window.location.host;
        if(host == "test.geminno.cn"){
            return{
                URL:'http://test.geminno.cn/project/index.php/api/',
                SocketAddr:'ws://121.41.41.46:5000',
                NODE:'http://121.41.41.46:5000',
                NODE_FILE:'http://121.41.41.46:8000',
                UPTOKEN_URL:'http://121.41.41.46:8000/',
                Technologies:[
                    {id:1,name:'吐槽空间'},
                    {id:182,name:'C语言专区'},
                    {id:183,name:'C++专区'},
                    {id:184,name:'Java技术专区'},
                    {id:185,name:'Android技术专区'},
                    {id:186,name:'ios苹果专区'}
                ]
            };
        }else if(host == "www.geminno.cn"){
            return{
                URL:'http://www.geminno.cn/project/index.php/api/',
                SocketAddr:'ws://121.41.123.2:5000',
                NODE:'http://121.41.123.2:5000',
                NODE_FILE:'http://121.41.123.2:8000',
                UPTOKEN_URL:'http://121.41.123.2:8000/',
                Technologies:[
                    {id:1,name:'吐槽空间'},
                    {id:186,name:'C语言专区'},
                    {id:187,name:'C++专区'},
                    {id:188,name:'Java技术专区'},
                    {id:189,name:'Android技术专区'},
                    {id:190,name:'ios苹果专区'}
                ]
            };
        }
    })
;
angular.module('commonService',[])
    .service('Crypto',function(){
        var crypto = {
            sha1 : function(s){
                return hex_sha1(s);
            }
        };
        return crypto;
    })
    .service('Moment',function(){
        var service = {
            now:function(){
                return moment().format('YYYY-MM-DD hh:mm:ss');
            },
            timestamp:function(){
                return moment().valueOf();
            },
            timestampformat:function(timestamp){
                return (new Date(timestamp)).format("yyyy-MM-dd hh:mm:ss");
            },
            uptime:function(){
                return moment().format('YYYY-MM-DD-hh-mm-ss');
            }
        };
        return service;
    })
    .directive('inputFocus',function($http) {
//      http://115.28.91.11:5000/api/test
        var FOCUS_CLASS = 'input-focused';
        return {
            restrict: 'AE',
            priority: 1,
            require: 'ngModel',
            scope: {
                ngModel: '@',
                iptCb:'&'
            },
            link: function (scope, element, attrs, ngmodel) {
                //获取所有以formerString开头的
                var formerString = "gem";
                var msg = {};
                for (var i in attrs) {
                    if ((i).indexOf(formerString) == 0) {
                        console.log(i, attrs[i]);
                        var _i = i.substr(formerString.length);
                        attrs[_i] = attrs[i];
                        msg[_i] = attrs[i];
                    }
                }
                var initVal = "";
                element.bind('focus', function () {
                    initVal = ngmodel.$viewValue;
                    console.log('focus', initVal);
//                            element.addClass(FOCUS_CLASS);
                }).
                    bind('blur', function () {
                        console.log('blur', initVal);
                        if (initVal != ngmodel.$viewValue) {
//                                element.removeClass(FOCUS_CLASS);
                            if (!attrs.url || attrs.url.replace(/(^\s*)|(\s*$)/g, "") == "") {
                                console.log('url不存在');
                                return;
                            } else {
                                if (ngmodel.$viewValue == undefined) {
                                    console.log('为空不上传！');
                                    return;
                                } else {
                                    var att = scope.ngModel;
                                    msg[att] = ngmodel.$viewValue;
                                    $http.post(attrs.url, msg)
                                        .success(function (data, status, headers, config) {
                                            console.log(data);
                                            scope.iptCb({cb:data});
                                        }).error(function (data, status, headers, config) {
                                            console.log('后台错误');
                                        });
                                }
                            }
                        }
                    });
            }
        };
    });
;

angular.module('components',['ui.sun.tpls','ui.sun.tabs','ui.sun.chatroom','ui.sun.faqs','ui.sun.faqs.form','ui.sun.sce','ui.sun.luntan','ui.sun.upload']);
angular.module('ui.sun.tpls',[]);

//<sce mode-type="html|text" bind-data="tttt"></sce>
angular.module("ui.sun.sce", [])
    .directive('sce', function ($compile,$parse) {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            controller:"SceController",
            scope:{
                modeType:"@",
                bindData:"="
            },
            template:function(element,attrs){
                if(attrs.modeType == "html"){
                    return '<p ng-bind-html="bindData"></p>';
                }else{
                    return '<p ng-bind="bindData"></p>';
                }
            },
            link:function(scope,element,attrs){
//                if(attrs.modeType == "html"){
//                    var parsed = $parse(attrs.ngBindHtml);
//                    function getStringValue(){
//                        return (parsed(scope)||'').toString();
//                    }
//                    scope.$watch(getStringValue,function(){
//                       $compile(element,null,-9999)(scope);
//                    });
////                    scope.bindData = $sce.trustAsHtml(scope.bindData);
//                }
            }
        };
    })
    .controller('SceController', ['$scope','$attrs','$sce', function ngBindHtmlCtrl($scope,$attrs,$sce) {
        if($attrs.modeType == "html"){
            function filterBD(text) {
                text = text.replace(/<[//]{0,1}(script|style)[^><]*>/ig,"");
                text = text.replace(/(onabort|onblur|onchange|onclick|ondblclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onreset|onresize|onselect|onsubmit|onunload)/ig,'马赛克');
                return text;
            };
            function safehtml(str) {
                //reg1替换script标签，reg2替换style以外的属性
                var reg1rep = '<unsupported-tag>';
                var reg2rep = ' unknown-attribute-';
                var reg1 = /<\s*script.*>/g;
                //空格开始且不等于style的字段
                var reg2 = /\s+(?!style)(?!src)(?!href)/g;
                str = str.replace(reg1, reg1rep);

                //每次<>截取的起始点终结点
                var start = -1;
                var end = -1;
                var arr = [];

                //排除单引号双引号中间的<>
                var inquot1 = false;
                var inquot2 = false;

                //刚刚截取了一个<>
                var haspushtag = false;

                //htmlinnner内容截取点
                var sstart = 0;

                for (var i = 0; i < str.length; i++) {
                    var s = str.charAt(i);
                    if (s == "'") {
                        //单引号开关，排除单引号中间内容
                        inquot1 = !inquot1;
                    } else if (s == '"') {
                        //双引号开关，排除双引号中间内容
                        inquot2 = !inquot2;
                    } else if (s == '<' && !inquot1 && !inquot2) {
                        //每次遇到<就定义tag截取开始点
                        //定义开始点并不一定从这里截取
                        start = i;
                    } else if (s == '>' && !inquot1 && !inquot2) {
                        //每次遇到>一定会往前最近的开始点截取<...>
                        //同时尝试把这个<...>开始点之前到前一个>之后的内容截取为innnerhtml
                        //这是为了避免<<<<p>...</p>一类情况，所以按照后>为标准
                        //如果本来就是纯文本，那么数组长度会为0，最后return时候处理
                        //如果是少于4个（开始也会有一个空‘’），那么代表低于2个<>，不匹配，最后return处理
                        end = i;
                        if (start != -1) {
                            arr.push(str.substr(sstart, start - sstart));

                            var sh = str.substr(start, end - start + 1);
                            sh = sh.replace(/\s+/g, ' ');
                            sh = sh.replace(reg2, reg2rep);
                            arr.push(sh);

                            start = -1;
                            sstart = i + 1;

                            haspushtag = true;
                        };
                    };
                };
                var res = str;
                //只有截取出来的<>达到2个（arr长度达到4个）才有意义
                if (arr.length >= 2) {
                    res = arr.join('');
                };
                return res;
            };
            $scope.bindData = $sce.trustAsHtml(filterBD($scope.bindData));
            //$scope.bindData = $sce.trustAsHtml(safehtml($scope.bindData));
        }
    }]);

angular.module('ui.sun.tabs',[])
    .factory('Headtabs',function(){
        var Headtabs = {};
        Headtabs.tab = [
            {
                tabname:"聊天室",
                triangle_hide:false,
                isActive:true,
                tabup:"",
                tabnew:"",
                url: 'one.tpl.html'
            },
            {
                tabname:"",
                triangle_hide:true,
                isActive:false,
                //tabup:"置顶",
                //tabnew:"最新",
                tabUpSelected:true,
                url: 'two.tpl.html'
            },
            {
                tabname:"",
                triangle_hide:true,
                isActive:false,
                tabup:"",
                tabnew:"",
                url: ''
            },
            {
                tabname:"论坛",
                triangle_hide:true,
                isActive:false,
                tabup:"",
                tabnew:"",
                url: 'luntan.html'
            }
        ];
      /*  if(window.location.pathname.indexOf('schedule.html') != '-1'){
            //Headtabs.tab[0].isActive = false;
            //Headtabs.tab[1].isActive = true;
            //Headtabs.tab[1].tabname = "问题库";
        }*/
        return Headtabs;
    })
    .controller('tabsCtrl',function($scope,$rootScope,Headtabs){
        $scope.Headtabs = Headtabs;
        $rootScope.currentTab = "one.tpl.html";

        if(window.location.pathname.indexOf('schedule.html') != '-1'){
            //$rootScope.currentTab = "two.tpl.html";
        }

        $scope.onClickTab = function (tab) {
            if(tab.tabname == ""){
                return;
            }
            $rootScope.currentTab = tab.url;
            //$scope.
            for(var i in Headtabs.tab){
                $scope.Headtabs.tab[i].isActive = false;
                if(tab.tabname != "" && tab.tabname == Headtabs.tab[i].tabname){
                    $scope.Headtabs.tab[i].isActive = true;
                }
            }
        }

        //$scope.isActiveTab = function(tabUrl) {
        //    return tabUrl == $rootScope.currentTab;
        //}
        //
        //$scope.chooseTab = function(index){
        //    for(var i in Headtabs.tab){
        //        Headtabs.tab[i].isActive = false;
        //        if(i == index) Headtabs.tab[i].isActive = true;
        //    }
        //};
        //$scope.tabup = function(flag){
        //    flag=!flag;
        //    $scope.Headtabs.tab[1].tabUpSelected = flag;
        //};
        //$scope.tabnew = function(flag){
        //    flag=!flag;
        //    $scope.Headtabs.tab[1].tabUpSelected = flag;
        //}
    })
    .directive('headtabs',function($rootScope){
        return{
            restrict:'A',
            transclude:true,
            //templateUrl:"/jieminuo/web/mis/Demo/_ngviews/chatroom/chatroom/view/tabs.html",
            templateUrl:
            //attrs.templateUrl||
            $rootScope.rooturl+"_pages/chatroom/view/tabs.html"
            //"view/tabs1.html"
        }
    });

angular.module('ui.sun.chatroom',[])
    .run(function($rootScope,$http){
        $rootScope.userinfo = {};
        function getUserInfo(){
        //$http.post('http://test.geminno.cn/jieminuo/web/project/index.php/api/user/getinfo', {}).
        $http.post(gem.apiprefix+'user/getinfo', {}).
            success(function(data, status, headers, config) {
                $rootScope.userinfo = data.data;
                $rootScope.userinfo.userid = $rootScope.userinfo.id;
                //$rootScope.userinfo.thum = {
                //    thum:"http://www.geminno.cn/files/user/2015/03-20/185231f8021f174279.jpg"
                //};
                console.log(data.data,'userinfo getinfoself');
            }).
            error(function(data, status, headers, config) {
            });
        }
        //getUserInfo();
        $rootScope.onSocket = [];
        $rootScope.socketStatus = {};
        $rootScope.sheduleTimes = 1;
    })
    .service('Chats',['$rootScope','Moment',function($rootScope,Moment){
        var service = {
            chat:[
                /* {
                 name:"bisdfgege1",
                 word:"this is word",
                 type:1,
                 projectid:0,
                 courseid:0,
                 lessonid:0,
                 time:'2014-0404',
                 lasttime:'2013-01-01'
                 },
                 */
            ],

            addChat:function(chat){
                service.chat.push(chat);
                $rootScope.$broadcast('chats.update');
            }
        }
        return service;
    }])
    .directive('chatroom',['$rootScope','$http','$window','$interval','$timeout','global','socket','Moment','Chats','Headtabs',function($rootScope,$http,$window,$interval,$timeout,global,socket,Moment,Chats,Headtabs){
        return{
            restrict:'EA',
//        replace:true,
            transclude:true,
            templateUrl:$rootScope.rooturl+"_pages/chatroom/view/chat.html",
            link:function(scope,element,attrs){
                var room = 0;
                if(gem.urlVals.scheduleid != undefined){
                    room = gem.urlVals.scheduleid;
                }
                console.log(room,'this is the room id!');

                $rootScope.unland = "正在登录";
                //$rootScope.socketStatus = {};

                $http.post(gem.apiprefix+'user/getinfo', {}).
                    success(function(data, status, headers, config) {
                        if(data.code == -1){
                            $rootScope.unland = "未登录";
                            $rootScope.showToast('请先注册或登录...');
                            return;
                        }else{
                            console.log('登录成功',status,headers,config);
                            $rootScope.unland = false;

                            $rootScope.userinfo1 = data.data;
                            $rootScope.userinfo = {};
                            $rootScope.userinfo.userid = $rootScope.userinfo1.id;
                            $rootScope.userinfo.nickname = $rootScope.userinfo1.name;
                            $rootScope.userinfo.thum = $rootScope.userinfo1.thum;
                            //if($rootScope.userinfo1.thum == ""){
                            //    $rootScope.userinfo1.thum ="http://www.geminno.cn/files/user/2015/03-20/185231f8021f174279.jpg";
                            //}

                            delayChat();

                            console.log(data.data,'userinfo getinfoself');
                        }
                    }).
                    error(function(data, status, headers, config) {
                    });



                function delayChat(){
                    $rootScope.Headtabs = Headtabs;
                    if($rootScope.projectId){
                        var tab2 =  {
                            tabname:"问题库",
                            triangle_hide:true,
                            isActive:false,
                            //tabup:"置顶",
                            //tabnew:"最新",
                            tabUpSelected:true,
                            url: 'two.tpl.html'
                        };
                        $rootScope.Headtabs.tab[1] =tab2;
                        //if(window.location.pathname.indexOf('schedule.html') != '-1'){
                        //}

                        if($rootScope.sheduleTimes == 1){
                            Headtabs.tab[0].isActive = false;
                            Headtabs.tab[1].isActive = true;
                            $rootScope.currentTab = "two.tpl.html";
                            $rootScope.sheduleTimes++;
                            //$rootScope.chatToast('请大家认真提问哟！，每次提问会奖励5金币！灌水提问将有可能取消奖励，甚至清空金币哟！','warn',15);
                        }
                    }


                    //当前域内唯一待发送信息
                    scope.message = {
                        //userid:gem.urlVals.id,
                        userid:$rootScope.userinfo.userid,
                        nickname:$rootScope.userinfo.nickname==undefined?"匿名":$rootScope.userinfo.nickname,
                        content:"",
                        title:'灌水',
                        type:1,
                        time:Moment.timestamp(),
                        lasttime:'haha',
                        thum:$rootScope.userinfo.thum,
                        to:{},
                        room:room
                    };
                    //console.log(scope.message,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhtimestamp');

                    //打印当前客户端socket信息
                    console.log(socket,'socket...............');

                    scope.Chats = Chats;

                    scope.searches = {
                        search: [
                            {
                                searchType:"全部"
                            },
                            {
                                searchType:"私聊"
                            },
                            {
                                searchType:"问题"
                            }
                        ]
                    };
                    scope.filterType = scope.searches.search[0].searchType;

                    //scope.filterType = function(data){
                    //    if(data.userid){
                    //
                    //    }else{
                    //        console.log('filtertype not exsits!');
                    //    }
                    //}

                    scope.chose = function(search){
                        scope.filterType = search.searchType;
                        if(search.searchType == "全部"){
                            var filter = {
                                type:"1"
                            };
                            scope.searchType = "";
                        }else if(search.searchType == "私聊"){
                            var filter = {
                                type:"2"
                            };
                            scope.searchType = filter;
                        }else if(search.searchType == "问题"){
                            var filter = {
                                type:"3"
                            };
                            scope.searchType = filter;
                        }
                    };


                    //悄悄话
                    scope.whispers = [
                        {
                            nickname:"所有",
                            userid:"000",
                            thum:""
                        }
                    ];

                    scope.toWhisper = scope.whispers[0];

                    scope.message.to = scope.toWhisper;

                    scope.sendto = function(whisper){
                        if(whisper.nickname != "所有"){
                            //type 2 私聊
                            scope.message.type = 2;
                        }else{
                            scope.message.type = 1;
                        }

                        scope.message.to = scope.toWhisper = whisper;

                        //判断客户端点头像是否存在，如果已经存在不增加。
                        function ifContain(whispers){
                            for(var i=0;i<whispers.length;i++){
                                if(whispers[i].userid == whisper.userid){
                                    return true;
                                }
                            }
                            return false;
                        }

                        if(!ifContain(scope.whispers)){
                            scope.whispers.push(whisper);
                            console.log('noexsits add!');
                        }
                    };

                    scope.UserPage = function(id){
                        $window.open(gem._PAGES.userCard+"?userid="+id,'_blank');
                    };

                    scope.faqDetails = function(id,e){
                        //$window.location.href = "http://test.geminno.cn/jieminuo/web/mis/Demo/_pages/faq/faqDetails.html?faqid="+id;
                        var tar = gem.tar(e,'ng-click','UserPage(chat.userid)');
                        if(!tar[0]){
                            console.log(e.target,"event target");
                            $window.open(gem._PAGES.faqList+'?faqid='+id,'_blank');
                        }
                        //$window.open(gem._PAGES.faqList+'?faqid='+id,'_blank');
                    };

                    scope.ranFriend = function(){
                        console.log('emit ranfirend success');
                        socket.emit('ranFriend');
                        //console.log('emit ranfirend success');
                    };

                    //如果5秒内发送超过10条，则让用户休息一下。
                    //记录所有自己发过的内容
                    var sendlog = [];

                    scope.count = "";

                    scope.send = function(){
                        if($rootScope.userinfo.userid == undefined){
                            $rootScope.showToast("请先登录...");
                            return;
                        }

                        if(scope.message.to.userid == $rootScope.userinfo.userid){
                            $rootScope.showToast('不需要对自己说悄悄话噢，亲！');
                            return;
                        }

                        if(!scope.chats){
                            $rootScope.showToast("聊天字段为空...");
                            return;
                        }
                        if(scope.chats.chat == ""){
                            $rootScope.showToast("聊天内容不能为空...");
                            return;
                        }
                        if(scope.chats.chat.length < 2){
                            $rootScope.showToast("聊天内容不能少于2个字符...");
                            return;
                        }else if(scope.chats.chat.length > 512){
                            $rootScope.showToast('聊天内容不能多于512个字符...');
                            return;
                        }

                        scope.message.content = scope.chats.chat;
                        //scope.message.time = Moment.now();
                        scope.message.time = Moment.timestamp();


                        var message = {
                            userid:$rootScope.userinfo.userid,
                            nickname:$rootScope.userinfo.nickname==undefined?"匿名":$rootScope.userinfo.nickname,
                            content:scope.chats.chat,
                            title:'灌水',
                            type:scope.message.type,
                            time:Moment.timestamp(),
                            lasttime:'haha',
                            thum:$rootScope.userinfo.thum,
                            to:{},
                            room:room
                        };

                        sendlog.push(message);

                        console.log(sendlog,'this is sendlog');
                        //scope.message.time is not

                        var chatlen = sendlog.length;
                        var allowSending = true;

                        if(chatlen>1&&sendlog[chatlen-1].time-sendlog[chatlen-2].time<3000){
                            $rootScope.showToast("发得太勤快咯，歇一歇吧！休息一下吧！");
                            allowSending = false;
                            scope.disabled = true;
                            scope.count =3;
                            scope.chatKeyup = undefined;
                            var timer = $interval(function(){
                                scope.count--;
                                if(scope.count == 0){
                                    allowSending = true;
                                    scope.count = "";
                                    scope.disabled = false;
                                    //sendlog = [];
                                    scope.chatKeyup = function(e){
                                        var keycode = window.event?e.keyCode: e.which;
                                        if(keycode==13){
                                            scope.send();
                                        }
                                    }
                                };
                            },1000,3);
                        }

                        if(sendlog.length>=5){
                            sendlog = [];
                        }

                        if(allowSending == true){
                            if(scope.message.type == 1){
                                socket.emit('p2c',scope.message);
                                scope.chats.chat = "";
                            }else if(scope.message.type == 2){
                                socket.emit('p2p',scope.message);
                                scope.chats.chat = "";
                            }
                        }

                    };

                    scope.chatKeyup = function(e){
                        var keycode = window.event?e.keyCode:e.which;
                        if(keycode==13){
                            scope.send();
                        }
                    };


                    //初始化在线用户数为0
                    scope.onlineUserInfo = {};
                    scope.onlineUserInfo.count = 0;

                    //开始连接
                    socket.on('connect',function(){
                        console.log('开始连接，已连接!');
                        //$rootScope.socketStatus.code = 1;
                        //发送验证消息（用户信息与socket配对)
                        //socket.emit('onInit',chat);
                    });

                    //console.log($rootScope.userinfo.id,'this is userinfo1111111111111');

                    //兼容firefox高版本傻逼问题，socket没有监听connect
                    socket.emit('onInit',scope.message);

                    //获取随机在线伙伴
                    var ranFriTimer = $timeout(
                        function() {
                            socket.emit('ranFriend');
                        },
                        2000
                    );

                    function onSocket() {
                        //监听服务器心跳提醒
                        //socket.io.engine.on('heartbeat', function(){
                        //    console.log('heartbea1',socket.id);
                        //});

                        //接收初始用户信息
                        //socket.socket1.on('onInit', function (data) {
                        //    console.log('接受初始信息成功1', data);
                        //    chat = data;
                        //    //$rootScope.nickname = data.nickname;
                        //    $rootScope.userinfo = data;
                        //});
                        socket.on('onInit',function(data){
                            console.log('接受初始信息成功', data);
                            if(data.thum == ""){
                                data.thum = "http://www.geminno.cn/mis/include/imgs/thumtemp.jpg";
                            }
                            scope.message = data;
                            //    //$rootScope.nickname = data.nickname;
                            $rootScope.userinfo = data;
                            $rootScope.socketStatus ={
                                status : "连接服务器成功！",
                                code : 1
                            };
                            //如果没有scheduleid的话，那么进入大厅即roomId为0
                            socket.emit('subscribe',data);
                        });

                        //接收在线信息
                        socket.on('onlineUsers',function(data){
                            //console.log('接收在线消息成功！',data);
                            scope.onlineUserInfo = $rootScope.onlineUserInfo = data;
                        });

                        //接收在线随机伙伴信息
                        socket.on('ranFriend',function(data){
                            console.log('接收随机伙伴信息成功',data);
                            //for(var i=0;i< data.users.length;i++){
                            //    if(data.users[i].nickname == undefined||data.user[i].nickname == ""){
                            //        console.log('undefined nickname');
                            //        data.users[i].nickname = "匿名";
                            //    }
                            //}
                            for(var i=0;i<data.users.length;i++){
                                if(data.users[i].thum == ""){
                                    data.users[i].thum = "http://www.geminno.cn/mis/include/imgs/thumtemp.jpg";
                                }
                            }

                            scope.ranFriendInfo = $rootScope.ranFriendInfo = data;
                        });

                        //监听服务器心跳提醒
                        socket.socket1.io.engine.on('heartbeat', function(){
                            //console.log('heartbea1',socket.socket1.id);
                        });

                        //监听发送给本聊天室的信息
                        socket.on('p2c', function (data) {
                            console.log(data, 'p2c message from', data.userid, data.nickname);
                            scope.Chats.chat.push(data);
                            //scope.$apply();
                        });

                        //监听系统消息type=4
                        socket.on('c2p',function(data){
                            if(data.thum == ""){
                                data.thum = "http://www.geminno.cn/mis/include/imgs/thumtemp.jpg";
                            }
                            if(!data.userid||data.gold &&data.gold >0&&data.userid==$rootScope.baseTopCtrlr.user.id){
                                $rootScope.showToast('恭喜获得'+data.gold+'个金币！');
                                $rootScope.baseTopCtrlr.getInfo();
                            }
                            console.log(data,'c2p message sendto chatroom');
                            scope.Chats.chat.push(data);
                        });

                        //监听admin消息
                        socket.on('a2p',function(data){
                            if(data.type == 'success'){
                                if(data.sec){
                                    $rootScope.chatToast(data.text,'ok',data.sec);
                                }else{
                                    $rootScope.chatToast(data.text,'ok',5);
                                }
                            }else if(data.type == 'warning'){
                                if(data.sec){
                                    $rootScope.chatToast(data.text,'warn',data.sec);
                                }else{
                                    $rootScope.chatToast(data.text,'warn',5);
                                }
                            }else if(data.type == 'error'){

                                if(data.sec){
                                    $rootScope.chatToast(data.text,'err',data.sec);
                                }else{
                                    $rootScope.chatToast(data.text,'err',5);
                                }
                            }
                        });

                        //监听发送的私信
                        socket.on('p2p', function (data) {
                            socket.emit('unsubscribe',scope.message);
                            console.log(data, 'p2p message from', data.userid, data.nickname);
                            //if(data.userid == $rootScope.userinfo.userid){
                            //
                            //}
                            scope.Chats.chat.push(data);
                            //scope.$apply();
                        });

                        //监听提问奖励金币成功
                        //socket.on('gg',function(data){
                        //    $rootScope.baseTopCtrlr.getInfo();
                        //    $rootScope.chatToast('提问成功！恭喜获得5金币！请再接再厉，继续编辑有质量的提问哟！','ok');
                        //});

                        socket.on('connecting', function () {
                            console.log('正在连接');
                            $rootScope.socketStatus ={
                                status : "正在连接，请稍后...",
                                code : 0
                            };
                        });

                        socket.on('connect_failed', function () {
                            console.log('连接失败');
                            $rootScope.socketStatus ={
                                status : "连接失败！",
                                code : 0
                            };
                        });

                        socket.on('error', function (data) {
                            console.log('连接错误', data);
                            $rootScope.socketStatus ={
                                status : "连接错误！",
                                code : 0
                            };
                        });

                        socket.on('disconnect', function () {
                            console.log("与服务其断开");
                            $rootScope.socketStatus ={
                                status : "与服务器断开连接！",
                                code : 0
                            };
                        });

                        socket.on('reconnecting', function (data) {
                            $rootScope.socketStatus = {
                                code:0,
                                status:"攻城狮正在维修，请稍后！正在重连...第"+data+"次"
                            };
                            console.log(" 第", data, "次，", "正在重连...");
                        });

                        socket.on('reconnect', function () {
                            console.log("重新连接到服务器");

                            $rootScope.socketStatus ={
                                status : "已重新连接到服务器！",
                                code : 1
                            };

                            //重新登录获取用户信息，并更新在线信息
                            socket.emit('reInit',scope.message);
                            ranFriTimer;
                        });
                    }
                    //socket.io的接口只监听一次
                    if($rootScope.onSocket.length == 0){
                        onSocket();
                    }
                    //监听过一次后传入onSocket字段。
                    $rootScope.onSocket.push("onSocket");
                }
            }
        }
    }])
;

angular.module('ui.sun.faqs',[])
    .directive('faqsList',function($rootScope,$http,$window,socket,Moment,global){
        return{
            restrict:'EA',
            transclude:true,
            //templateUrl:"/jieminuo/web/mis/Demo/_ngviews/question/faqs/view/faqs.html",
            //templateUrl:"/jieminuo/web/mis/Demo/_ngviews/askAnsDetails/index.html",
            templateUrl:$rootScope.rooturl+"_pages/questionbank/faqs/view/index.html",
            link:function(scope,element,attrs){
                console.log("projectId"+ $rootScope.projectId,$rootScope.getscheduleId);

                var projectIdObj = {
                    id:$rootScope.projectId
                    //id:71
                };

                var refreshQuestions =function(cb){
                    //var deferred = $q.defer();
                    $http.post(global.URL+'project/getfaqs', projectIdObj).success(function(data, status, headers, config) {
//                console.log($rootScope.blockid);
//                        console.log(data);
                        scope.faqs1 = [];
                        data.data.blocks.forEach(function(block,i){
                            block.faqs.forEach(function(faq,i){
                                var faq1 = {};
                                faq1.askblock = {};
                                faq1.blockid = block.id;
                                faq1.replys = [];
                                faq1.askblock.asker={};
                                faq1.askblock.recent_rep={};
                                faq1.id = faq.id;
                                faq1.askblock.mark = "顶";
//                            faq.ask.state;
                                //
                                faq1.askblock.title = faq.ask.title;
                                faq1.askblock.content = faq.ask.content;
                                faq1.askblock.pics = faq.ask.pics;
                                faq1.askblock.follow = faq.replys.length;
                                faq1.askblock.asker.name = faq.ask.author.name;
                                faq1.askblock.asker.img = faq.ask.author.thum;
                                faq1.askblock.asker.id = faq.ask.author.id;
                                faq1.askblock.asker.time = faq.ask.time;
                                //                faq1.askblock.recent_rep.name = faq.replys.name;
                                //                faq1.askblock.recent_rep.img = faq.replys.img;
                                //                faq1.askblock.recent_rep.time = faq.replys.time;

                                faq1.answer = faq.answer;

                                faq.replys.forEach(function(reply,i){
                                    var faq2 = {};
                                    faq2.content = reply.content;
                                    faq2.author = reply.author;
//                            faq2.img = reply.pics;
                                    faq2.time = reply.time;
                                    faq1.replys.push(faq2);
                                    //                    faq1.replys.content = faq.replys[i].content;
                                    //                    faq1.replys.name = faq.replys[i].author;
                                    //                    faq1.replys.img = faq.replys[i].pics;
                                    //                    faq1.replys.time = faq.replys[i].time;

                                });

                                //                faq1.replys.content = faq.replys.content;
                                //                faq1.replys.name = faq.replys.author;
                                //                faq1.replys.img = faq.replys.pics;
                                //                faq1.replys.time = faq.replys.time;
                                scope.faqs1.push(faq1);
                                faqbak(scope.faqs1);
                                if(cb){
                                    cb();
                                }
                            });
                        });
                    }).error(function(data, status, headers, config) {});
                    //return deferred.promise;
                };
                //refreshQuestions();

                var promise = refreshQuestions();

                //分页
                //scope.totalItems = 10;
                scope.currentPage = 1;
                scope.itemsPerPage = 10;
                scope.maxSize = 5;
                scope.filteredFaqs1 = [];

                var faqbak = function(dt){
                    var begin = ((scope.currentPage - 1) * scope.itemsPerPage)
                        , end = begin + scope.itemsPerPage;

                    scope.filteredFaqs1 = dt.slice(begin, end);
                };

                scope.pageChanged = function() {
                    faqbak(scope.faqs1);
                };

                //获取faqs列表
                scope.subqst = function(){
                    if(scope.qus == undefined){
                        $rootScope.showToast("标题内容不能为空");
                        return;
                    }
                    if(scope.qus.title == undefined || scope.qus.title.replace(/(^\s*)|(\s*$)/g, "") ==""){
                        $rootScope.showToast("标题内容不能为空");
                        return;
                    }
                    if(scope.qus.title.replace(/(^\s*)|(\s*$)/g, "").length < 5){
                        $rootScope.showToast('标题内容不能少于5个字符！');
                        return;
                    }
                    if(scope.qus.content == undefined || scope.qus.content == ""){
                        $rootScope.showToast("内容不能为空");
                        return;
                    }
                    if(scope.qus.content.replace(/(^\s*)|(\s*$)/g, "").length < 5){
                        $rootScope.showToast('内容字数不能少于5个字符！')
                        return;
                    }
                    //        var qusdata={
                    //            userid:$rootScope.userinfo.id,
                    //            content:scope.qus.content,
                    //            title: scope.qus.title,
                    //            type:3,
                    //            projectid:0,
                    //            courseid:0,
                    //            lessonid:0,
                    //            time:getDateService.getDate(),
                    ////            time:getdate(),
                    //            lasttime:'2013-03-09'
                    //        };
                    //
                    //        console.dir(qusdata);

                    if($rootScope.uploaded.Aquestion){
                        var picarr = [];

                        for(var i=0;i<$rootScope.uploaded.Aquestion.length;i++){
                            console.log($rootScope.uploaded.Aquestion);
                            if($rootScope.uploaded.Aquestion[i] == undefined){
                                $rootScope.uploaded.Aquestion.slice(i,1);
                            }
                            picarr.push($rootScope.uploaded.Aquestion[i].id);
                        }
                        console.log(picarr+"sssssssssssssssssss");
                    }

                    var pstmsg = {
                        //添加
                        id:0,
                        title:scope.qus.title,
                        content:scope.qus.content,
                        pics:picarr
                    };

                    var faqid;

                    $http.post(global.URL+'project/updatepost', pstmsg).success(function(data, status, headers, config) {
                        if(data.code == -1){
                            $rootScope.showToast(data.text);
                            return;
                        }
                        var pstid = data.data.id;
                        var faqmsg = {
                            id:0,
                            ask:pstid
                        };
                        $http.post(global.URL+'project/updatefaq',faqmsg).success(function(data,status,headers,config){
                            if(data.code == -1){
                                $rootScope.showToast(data.text);
                                return;
                            }
                            faqid = data.data.id;
                            console.log(faqid+"faqid");
                            var blkmsg = {
                                faqid: faqid,
                                //blockid不传出错
                                blockid:$rootScope.blocksId,
//                            blockid:152,
//                            projectid:63
                                projectid:$rootScope.projectId
                            };
                            $http.post(global.URL+'user/addfaqtoblock',blkmsg).success(function(data,status,headers,config){
                                if(data.code == -1){
                                    $rootScope.showToast(data.text);
                                    return;
                                }
                                var pstobj = {
                                    //                        id: pstid,
                                    //                        faqid: faqid,
                                    //                        blkid: parentid,
                                    //                        forumid: parentid
                                };

                                //                    Talks.say.push(qusdata);
                                //生成成功发送到聊天服务器

                                var qusdata={
                                    userid:$rootScope.userinfo.userid,
                                    content:scope.qus.content,
                                    title: scope.qus.title,
                                    type:3,
                                    faqid:faqid,
                                    time:Moment.timestamp(),
                                    //            time:getdate(),
                                    lasttime:'2013-03-09'
                                };

                                socket.emit('p2c', qusdata);

                                refreshQuestions();
                                $('.choseQus').removeClass('active');
                                $('.choseQus:first').addClass('active');

                                //清理
                                scope.qus.title = "";
                                scope.qus.content = "";
                                picarr = [];
                                $rootScope.uploaded.Aquestion = [];

                                //加金币奖励
                                var userid = $rootScope.baseTopCtrlr.user.id;
                                var ggdt = {
                                    userid:userid
                                };
                                //socket.emit('gg',ggdt);

                            }).error(function(data,status,headers,config){});

                        }).error(function(data,status,headers,config){});

                    }).error(function(data, status, headers, config) {});

                };

                //scope.choseQus = function(e){
                //    var tarjo = $(e.target).parents('.choseQus');
                //    if(tarjo == {}){
                //        console.log('空对象1');
                //    }
                //    $('.choseQus').removeClass('tab-no-bot').addClass('tab-bot');
                //    tarjo.removeClass('tab-bot').addClass('tab-no-bot');
                //    console.log(tarjo,$(e.target)==$('a'),$(e.target)==$(''),$(e.target)==$(),typeof(tarjo));
                //}

                function clearFaqs(){
                    scope.faqs1=[];
                    faqbak(scope.faqs1);
                }

                $('.choseQus').click(function(){
                    var _this = $(this);
                    //$('.choseQus').removeClass('tab-no-bot').addClass('tab-bot');
                    //_this.removeClass('tab-bot').addClass('tab-no-bot');
                    $('.choseQus').removeClass('active');
                    _this.addClass('active');

                    var text = _this.find('a').html();
                    if(text == '全部'){
                        clearFaqs();
                        //scope.faqs1.push(faq1);
                        //faqbak(scope.faqs1);
                        refreshQuestions();
                        //console.log(' in all in');
                    }else if(text == '我提出的'){
                        clearFaqs();
                        var cb = function(){
                            var faqb = [];
                            for(var i=0;i<scope.faqs1.length;i++){
                                if(scope.faqs1[i].askblock.asker.id == $rootScope.userinfo1.id){
                                    faqb.push(scope.faqs1[i]);
                                }
                            }
                            //console.log('我提出的',faqb.length,scope.faqs1.length);
                            scope.faqs1 = faqb;
                            faqbak(scope.faqs1);
                        }
                        refreshQuestions(cb);
                    }else if(text == '我回复的'){
                        clearFaqs();
                        var cb = function(){
                            var faqb = [];
                            for(var i=0;i<scope.faqs1.length;i++){
                                if(scope.faqs1[i].answer.author != undefined && scope.faqs1[i].answer.author.id == $rootScope.userinfo1.id){
                                    faqb.push(scope.faqs1[i]);
                                    continue;
                                }
                                for(var j=0;j<scope.faqs1[i].replys.length;j++){
                                    if(scope.faqs1[i].replys[j].author.id == $rootScope.userinfo1.id){
                                        faqb.push(scope.faqs1[i]);
                                    }
                                }
                            }
                            //console.log('我提出的1',faqb.length,scope.faqs1.length);
                            scope.faqs1 = faqb;
                            faqbak(scope.faqs1);
                        }
                        refreshQuestions(cb);
                    }
                });

                //回答问题
                scope.ansfaq = function(faq,ansfaq){
                    console.log(faq+"<<<<<<<<<<this is faqid"+ansfaq);
                    var msg = {
                        faqid:faq.id,
                        content:ansfaq
                    }
                    $http.post(global.URL+'user/addposttofaq_v2',msg).success(function(data,status,headers,config){
                        console.log(data+"successdata<><><><><><><><><><><><>");
                        var reply = {};
                        reply.author = {};
                        reply.content = ansfaq;
                        //当前session用户名
                        reply.author.name = $rootScope.userinfo.name;
                        reply.author.thum = $rootScope.userinfo.thum;
//                reply.time = getDateService.getDate();

                        Date.prototype.format = function(format)
                        {
                            var o = {
                                "M+" : this.getMonth()+1, //month
                                "d+" : this.getDate(),    //day
                                "h+" : this.getHours(),   //hour
                                "m+" : this.getMinutes(), //minute
                                "s+" : this.getSeconds(), //second
                                "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
                                "S" : this.getMilliseconds() //millisecond
                            }

                            if(/(y+)/.test(format))
                            {
                                format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
                            }

                            for(var k in o)
                            {
                                if(new RegExp("("+ k +")").test(format))
                                {
                                    format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                                }
                            }
                            return format;
                        }

                        reply.time = (new Date()).format("yyyy-MM-dd hh:mm:ss");

                        for(var i=0;i<scope.faqs1.length;i++){
                            if(scope.faqs1[i].id == faq.id){
                                scope.faqs1[i].replys.push(reply);
//                        console.log(scope.faqs1[i].id+"dirfaqs1");

                                scope.faqs1[i].askblock.follow += 1;

//                        scope.faqs1[i].replys.length
                            }
                        }
//                scope.faqs1[0].replys.push(reply);

                    }).error(function(data,status,headers,config){
                    });
                }

                //scope.faqDetails = function(id){
                //    console.log(id);
                //    $window.open(gem._PAGES.faqList+'?faqid='+id,'_blank');
                //};

                scope.faqDetails = function(id,e){
                    //$window.location.href = "http://test.geminno.cn/jieminuo/web/mis/Demo/_pages/faq/faqDetails.html?faqid="+id;
                    //var tar = gem.tar(e,'ng-click','UserPage(chat.userid)');
                    //if(!tar[0]){
                    //    console.log(e.target,"event target");
                        //$window.open(gem._PAGES.faqList+'?faqid='+id,'_blank');
                    //}
                    $window.open(gem._PAGES.faqList+'?faqid='+id,'_blank');
                };

                scope.rmFaq = function(faq){
                    if( confirm("确定删除该条回复吗？")){
                        var msg ={
                            blockid:faq.blockid,
                            faqid: faq.id
                        };
                        $http.post(global.URL+"admin/removefaqfromblock",msg)
                            .success(function(data){
                                $rootScope.showToast("删除FAQ成功！");
                                for(var i=0;i<scope.filteredFaqs1.length;i++){
                                    if(scope.filteredFaqs1[i].id == msg.faqid){
                                        scope.faqs1.splice(i,1);
                                        faqbak(scope.faqs1);
                                        return;
                                    }
                                }
                            });
                    }else{
                    }
                };

                scope.UserPage = function(id){
                    $window.open(gem._PAGES.userCard+"?userid="+id,'_blank');
                };

            }
        }
    })
;

angular.module('ui.sun.faqs.form',[])
    .directive('questionForm',function($rootScope){
        return{
            restrict:'EA',
            transclude:true,
            templateUrl:$rootScope.rooturl+"_pages/questionbank/form/view/form.html",
            link:function(scope,element,attrs){
                scope.delpic = function(index){
                    console.log($rootScope.uploaded.Aquestion,index);
                    $rootScope.uploaded.Aquestion.splice(index,1);
                    console.log($rootScope.uploaded.Aquestion);
                }
            }
        }
    });

angular.module('ui.sun.luntan',[])
    .controller("ForumController",function($scope,$http,$rootScope,$window,global){
        $rootScope.currTechnology = $scope.currTechnology = global.Technologies[0];

        $rootScope.technologies = $scope.technologies = global.Technologies;

        $scope.chose = function(tech){
            $rootScope.currTechnology = $scope.currTechnology = tech;
            refreshAll();
        }

    //获取论坛id
    //var ForumId =$rootScope.id = gem.urlVals.forumid;
    var ForumId = $scope.currTechnology.id;

    //论坛类型
    $http.post(gem.apiprefix + "forum/getforum",{id:ForumId})
        .success(function(data){
            var rows = $rootScope.forumData = data.data? data.data: [];
            //获取管理员ids
            $scope.mastersId =[];
            for(var i in rows.masters){
                $scope.mastersId.push(data.data.masters[i].id);
            }
            //console.log($scope.mastersId);
            //验证管理员
            $scope.inArray = function (masterid, masterids) {
                for(var i in masterids) {
                    if(masterids[i] == masterid) {
                        return true;
                    }
                }
                return false;
            }
            //论坛类型
            var type = rows.type;
            switch(type){
                case "0":
                    $scope.forumType = "未知";
                    break;
                case "1":
                    $scope.forumType = "项目论坛";
                    break;
                case "2":
                    $scope.forumType = "班级论坛";
                    break;
                case "3":
                    $scope.forumType = "群组论坛";
                    break;
                case "4":
                    $scope.forumType = "技术方向论坛";
                    break;
                case "5":
                    $scope.forumType = "学校论坛";
                    break;
                case "9":
                    $scope.forumType = "其他论坛";
                    break;
            }
        });
    //post结束


    //新建主题
    $scope.newFaq=function(){
        //console.log($rootScope.baseTopCtrlr.user.id);
        if($rootScope.baseTopCtrlr.user.id == undefined) {
            $rootScope.showToast('您需要先登录或注册才能发主题', 'err', 3);
        }else{
            $rootScope.showPop($rootScope.rooturl+"_pages/luntan/addFaq.html");
        }
    }

    //全部主题
    var listAllForum = function(page,pcount,forumid){
        var msg = {};
        msg.id = forumid;
        msg.page = page;
        msg.pcount = pcount;
        $http.post(gem.apiprefix + "forum/gettopics",msg)
            .success(function(data){
                $scope.allFaqs = data.data.faqs;
                $scope.allCount = data.data.count;
                $scope.allPages = data.data.pages;
                //分页参数
                $scope.allTotalItems = data.data.count;
                $scope.allCurrentPage = page;
                $scope.allItemsperpage = pcount;
                $scope.maxSize = 5;
                //分页方法
                $scope.allPageChanged = function () {
                    //传入当前页 和 每页个数
                    listAllForum($scope.allCurrentPage, 15);
                };
            });
    }
    listAllForum(1,15,$scope.currTechnology.id);
    //精华主题
    var listStikyForum = function(page,pcount,forumid){
        var msg = {};
        msg.id = forumid;
        msg.page = page;
        msg.pcount = pcount;
        $http.post(gem.apiprefix + "forum/getdigesttopics",msg)
            .success(function(data){
                $scope.stikyFaqs = data.data.faqs;
                $scope.stikyCount = data.data.count;
                $scope.stikyPages = data.data.pages;
                //分页参数
                $scope.stikyTotalItems = data.data.count;
                $scope.stikyCurrentPage = page;
                $scope.stikyItemsperpage = pcount;
                $scope.maxSize = 5;
                //分页方法
                $scope.stikyPageChanged = function () {
                    //传入当前页 和 每页个数
                    listStikyForum($scope.stikyCurrentPage, 15);
                };
            });
    }
    listStikyForum(1,15,$scope.currTechnology.id);
    //我的主题
    var listMyForum = function(page,pcount,forumid){
        var msg = {};
        msg.id = forumid;
        msg.page = page;
        msg.pcount = pcount;
        $http.post(gem.apiprefix + "forum/getmytopics",msg)
            .success(function(data){
                $scope.myFaqs = data.data.faqs;
                $scope.myCount = data.data.count;
                $scope.myPages = data.data.pages;
                //分页参数
                $scope.myTotalItems = data.data.count;
                $scope.myCurrentPage = page;
                $scope.myItemsperpage = pcount;
                $scope.maxSize = 5;
                //分页方法
                $scope.myPageChanged = function () {
                    //传入当前页 和 每页个数
                    listMyForum($scope.myCurrentPage, 15);
                };
            });
    }
    listMyForum(1,15,$scope.currTechnology.id);
    //刷新所有
    var refreshAll = $rootScope.refreshAll = function(){
        listAllForum($scope.allCurrentPage, 15,$scope.currTechnology.id);
        listStikyForum($scope.stikyCurrentPage, 15,$scope.currTechnology.id);
        listMyForum($scope.myCurrentPage, 15,$scope.currTechnology.id);
    }
    //操作置顶
    $scope.setStiky = function (faqid,stiky){
        var msg = {};
        msg.forumid = $scope.currTechnology.id;
        msg.faqid = faqid;
        if (stiky == 0) {
            msg.stiky = 1;
        }
        else if (stiky == 1) {
            msg.stiky = 0;
        }
        $http.post(gem.apiprefix + "admin/setstiky",msg)
            .success(function(res){
                if(res.code == 1){
                    //$scope.faqs[index].stiky = msg.stiky;
                    $rootScope.showToast('修改成功', 'ok', 3);
                    refreshAll();
                }
            }).error(function() {
                $rootScope.showToast('连接服务器失败，请稍后重新尝试', 'err', 3);
            });

    }

    //操作加精
    $scope.setDigest = function (faqid,digest){
        var msg = {};
        msg.forumid = $scope.currTechnology.id;
        msg.faqid = faqid;
        if (digest == 0) {
            msg.digest = 1;
        }
        else if (digest == 1) {
            msg.digest = 0;
        }
        $http.post(gem.apiprefix + "admin/setdigest",msg)
            .success(function(res){
                if(res.code == 1){
                    digest = msg.digest;
                    $rootScope.showToast('修改成功', 'ok', 3);
                    refreshAll();
                }
            }).error(function() {
                $rootScope.showToast('连接服务器失败，请稍后重新尝试', 'err', 3);
            });
    }

    //操作推荐
    $scope.setRecommend = function (faqid,recommend){
        var msg = {};
        msg.forumid = $scope.currTechnology.id;
        msg.faqid = faqid;
        if (recommend == 0) {
            msg.recommend = 1;
        }
        else if (recommend == 1) {
            msg.recommend = 0;
        }
        $http.post(gem.apiprefix + "admin/setrecommend",msg)
            .success(function(res){
                if(res.code == 1){
                    $rootScope.showToast('修改成功', 'ok', 3);
                    refreshAll($rootScope);
                }
            }).error(function() {
                $rootScope.showToast('连接服务器失败，请稍后重新尝试', 'err', 3);
            });
    }

    //操作锁定
    $scope.lockfaq = function (faqid,phase){
        var msg = {};
        msg.forumid = $scope.currTechnology.id;
        msg.faqid = faqid;
        if (phase == 0) {
            msg.phase = 1;
        }
        else if (phase == 1) {
            msg.phase = 0;
        }
        $http.post(gem.apiprefix + "admin/lockfaq",msg)
            .success(function(res){
                if(res.code == 1){
                    $rootScope.showToast('修改成功', 'ok', 3);
                    refreshAll($rootScope);
                }
            }).error(function(res) {
                $rootScope.showToast('连接服务器失败，请稍后重新尝试', 'err', 3);
            });
    }

    //操作删除
    $scope.removeFaqFromForum = function (faqid){
        var msg = {
            forumid:$scope.currTechnology.id,
            faqid:faqid
        }
        if(confirm('是否删除？')){
            $http.post(gem.apiprefix + "admin/removefaqfromforum",msg)
                .success(function(res){
                    if(res.code == 1){
                        $rootScope.showToast('删除成功', 'ok', 3);
                        refreshAll();
                    }
                }).error(function(res) {
                    $rootScope.showToast('连接服务器失败，请稍后重新尝试', 'err', 3);
                });
        }
    }

    //操作编辑
    $scope.updatePost = function (faqid,askid){
        $scope.flag = true;
        $('body').css('visibility','visible');
        $http.post(gem.apiprefix + "forum/gettopicdetails",{id:faqid})
            .success(function(data){
                if(data.code == 1){
                    var msg = {}
                    msg.id = askid;
                    $scope.faq =data.data.ask;
                    $scope.cancle = function(){
                        $scope.flag = false;
                    }

                    $scope.postSubmit = function(){
                        msg.title = $scope.faq.title;
                        msg.content = $scope.faq.content;
                        msg.title = gem.fmtTitle(msg.title);
                        if (msg.title.length < 4 || msg.title.length > 500) {
                            $rootScope.showToast('标题不能少于4个字符或多于500个字符', 'err', 3);
                            return;
                        };

                        msg.content = gem.fmtTitle(msg.content);
                        if (msg.content.length < 4 || msg.content.length > 2000) {
                            $rootScope.showToast('内容不能少于4个字符或多于2000个字符', 'err', 3);
                            return;
                        };
                        $http.post(gem.apiprefix + "project/updatepost",msg)
                            .success(function(res){
                                if(res.code == 1){
                                    $rootScope.showToast('修改成功', 'ok', 3);
                                    $scope.flag = false;
                                    refreshAll();
                                }
                            }).error(function(){
                                $rootScope.showToast('连接服务器失败，请稍后重新尝试', 'err', 3);
                            });
                    }
                }

            }).error(function(){
                $rootScope.showToast('连接服务器失败，请稍后重新尝试', 'err', 3);
            });
    }
    //跳转到用户界面
    $scope.userHome = function(userid){
        //if(userid == undefined){return;}
        $window.open(gem._PAGES.userCard+"?userid="+userid,'_blank');
    }

    //跳转问题页面
    $scope.faqList = function(faqid){
        //if(faqid == undefined){return;}
        $window.open(gem._PAGES.faqList+"?faqid="+faqid,"_blank");
    }
    //end
})
    .directive('luntan',function($rootScope){
        return{
            restrict:"EA",
            transclude:true,
            templateUrl:$rootScope.rooturl+"_pages/luntan/index.html",
            controller:'ForumController',
            link:function(scope,element,attrs){
            }
        }
    })
;

angular.module('ui.sun.upload',[])
    .controller('upCtrl',function($rootScope,$scope,$http,global,Moment){

        var touchp = function(domain,res,up){
            //var pathStr = domain
            //var username = 'userid' + $rootScope.baseTopCtrlr.user.id;

            function upfile(){
                var msg = {
                    key:res.key,
                    //下载链接
                    url:domain + res.key
                    //,
                    //up:up
                };
                $http.post(global.NODE_FILE+'/filesite/touchonce',msg).success(function(data,status,headers,config){
                    $rootScope.filelist = data.data.children;
                }).error(function(data,status,headers,config){
                    console.log(data);
                });
            }

            upfile();
        };

        var mytouch = function(domain,res,up){
            //var NODE_FILE;
            //if(host == "test.geminno.cn"){
            //    NODE_FILE='http://test.geminno.cn:8000'
            //}else if(host == "www.geminno.cn"){
            //    NODE_FILE='http://121.41.123.2:8000'
            //}

            function myupfile(){
                var msg = {
                    key:res.key,
                    url:domain+res.key,
                    uploader:$rootScope.baseTopCtrlr.user.id,
                    addtime:Moment.now(),
                    scheduleid:gem.urlVals.scheduleid
                };

                $http.post(global.NODE_FILE+'/filesite/mytouch',msg).success(function(data,status,headers,config){
                    if(data.data){
                        $rootScope.filelist = data.data.children;
                    }else{
                        $rootScope.showToast(data.msg);
                    }
                }).error(function(data,status,headers,config){
                    console.log(data);
                });
            };
            myupfile();
        };


        var uploader = Qiniu.uploader({
            runtimes: 'html5,flash,html4',
            browse_button: 'pickfiles',
            container: 'upContainer',
            drop_element: 'upContainer',
            max_file_size: '100mb',
            flash_swf_url: 'js/plupload/Moxie.swf',
            dragdrop: true,
            chunk_size: '4mb',
            //uptoken_url: $('#uptoken_url').val(),
            //domain: $('#domain').val(),
            domain: 'http://7xnmfe.com1.z0.glb.clouddn.com/',
            uptoken_url: global.UPTOKEN_URL + "uptoken",
            get_new_uptoken: false,
            // downtoken_url: '/downtoken',
            // unique_names: true,
            // save_key: true,
            // x_vars: {
            //     'id': '1234',
            //     'time': function(up, file) {
            //         var time = (new Date()).getTime();
            //         // do something with 'time'
            //         return time;
            //     },
            // },
            auto_start: true,
            init: {
                'FilesAdded': function(up, files) {
                    console.log('i am adding files!');
                    $('table').show();
                    $('#success').hide();
                    plupload.each(files, function(file) {
                        var progress = new FileProgress(file, 'fsUploadProgress');
                        progress.setStatus("等待...");
                        //progress.bindUploadCancel(up);
                    });
                },
                'BeforeUpload': function(up, file) {
                    var progress = new FileProgress(file, 'fsUploadProgress');
                    var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                    if (up.runtime === 'html5' && chunk_size) {
                        progress.setChunkProgess(chunk_size);
                    }
                },
                'UploadProgress': function(up, file) {
                    var progress = new FileProgress(file, 'fsUploadProgress');
                    var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                    progress.setProgress(file.percent + "%", file.speed, chunk_size);
                },
                'UploadComplete': function() {
                    $('#success').show();
                },
                'FileUploaded': function(up, file, info) {
                    //var progress = new FileProgress(file, 'fsUploadProgress');
                    //progress.setComplete(up, info);
                    //console.log('in file uploaded...');

                    var domain = up.getOption('domain');
                    var res = eval('('+info+')');
                    var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                    console.log(domain,res.key,up);
//                    console.log(domain,res,sourceLink);
                    $('.info').hide();
                    //touchp(domain,res,up);
                    mytouch(domain,res,up);
                },
                'Error': function(up, err, errTip) {
                    $('table').show();
                    var progress = new FileProgress(err.file, 'fsUploadProgress');
                    progress.setError();
                    progress.setStatus(errTip);
                }
                ,
                //'Key': function(up, file) {
                //    var username = 'userid' + $rootScope.baseTopCtrlr.user.id;
                //    var scheduleid = 'scheduleid'+ gem.urlVals.scheduleid;
                //    console.log(username,scheduleid);
                //    var prefix = username + '_' + scheduleid + 'M_M';
                //    //'zm_blockid1M_M/a/a.zip'
                //    //var prefix = 'userzm_blockid10000_schoolid10000:/';
                //    var key = prefix + '/'+file.name;
                //    // do something with key
                //    console.log(key,'this is key');
                //    $scope.filekey = key;
                //    return key;
                //}
                'Key': function(up, file) {
                    var username = $rootScope.baseTopCtrlr.user.id;
                    var scheduleid = gem.urlVals.scheduleid;
                    var prefix = $rootScope.baseTopCtrlr.user.name + Moment.uptime();
                    //'zm_blockid1M_M/a/a.zip'
                    //var prefix = 'userzm_blockid10000_schoolid10000:/';
                    var key = prefix+file.name;
                    // do something with key
                    console.log(key,'this is key');
                    $scope.filekey = key;
                    return key;
                }
            }
        });

        uploader.bind('FileUploaded', function(e) {
            console.log('out file uploaded...');
//            var msg = {
//                currentDirS:currentDirStr($scope.currentDir),
//                currentDir:$scope.currentDir,
//                filename: e.files[e.files.length-1].name,
//                filetype: e.files[e.files.length-1].type,
//                emsg:e
//            };
//            console.log(e);
//            $http.post(qUrl.dev_url+'filesite/upload', msg)
//                .success(function (data, status, headers, config) {
//                    console.log(data);
//                }).error(function (data, status, headers, config) {
//                    console.log('后台错误');
//                });
        });
        $('#upContainer').on(
            'dragenter',
            function(e) {
                e.preventDefault();
                $('#container').addClass('draging');
                e.stopPropagation();
            }
        ).on('drop', function(e) {
                e.preventDefault();
                $('#container').removeClass('draging');
                e.stopPropagation();
            }).on('dragleave', function(e) {
                e.preventDefault();
                $('#container').removeClass('draging');
                e.stopPropagation();
            }).on('dragover', function(e) {
                e.preventDefault();
                $('#container').addClass('draging');
                e.stopPropagation();
            });



        $('#show_code').on('click', function() {
            $('#myModal-code').modal();
            $('pre code').each(function(i, e) {
                hljs.highlightBlock(e);
            });
        });


        $('body').on('click', 'table button.btn', function() {
            $(this).parents('tr').next().toggle();
        });


        var getRotate = function(url) {
            if (!url) {
                return 0;
            }
            var arr = url.split('/');
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i] === 'rotate') {
                    return parseInt(arr[i + 1], 10);
                }
            }
            return 0;
        };

        $('#myModal-img .modal-body-footer').find('a').on('click', function() {
            var img = $('#myModal-img').find('.modal-body img');
            var key = img.data('key');
            var oldUrl = img.attr('src');
            var originHeight = parseInt(img.data('h'), 10);
            var fopArr = [];
            var rotate = getRotate(oldUrl);
            if (!$(this).hasClass('no-disable-click')) {
                $(this).addClass('disabled').siblings().removeClass('disabled');
                if ($(this).data('imagemogr') !== 'no-rotate') {
                    fopArr.push({
                        'fop': 'imageMogr2',
                        'auto-orient': true,
                        'strip': true,
                        'rotate': rotate,
                        'format': 'png'
                    });
                }
            } else {
                $(this).siblings().removeClass('disabled');
                var imageMogr = $(this).data('imagemogr');
                if (imageMogr === 'left') {
                    rotate = rotate - 90 < 0 ? rotate + 270 : rotate - 90;
                } else if (imageMogr === 'right') {
                    rotate = rotate + 90 > 360 ? rotate - 270 : rotate + 90;
                }
                fopArr.push({
                    'fop': 'imageMogr2',
                    'auto-orient': true,
                    'strip': true,
                    'rotate': rotate,
                    'format': 'png'
                });
            }

            $('#myModal-img .modal-body-footer').find('a.disabled').each(function() {

                var watermark = $(this).data('watermark');
                var imageView = $(this).data('imageview');
                var imageMogr = $(this).data('imagemogr');

                if (watermark) {
                    fopArr.push({
                        fop: 'watermark',
                        mode: 1,
                        image: 'http://www.b1.qiniudn.com/images/logo-2.png',
                        dissolve: 100,
                        gravity: watermark,
                        dx: 100,
                        dy: 100
                    });
                }

                if (imageView) {
                    var height;
                    switch (imageView) {
                        case 'large':
                            height = originHeight;
                            break;
                        case 'middle':
                            height = originHeight * 0.5;
                            break;
                        case 'small':
                            height = originHeight * 0.1;
                            break;
                        default:
                            height = originHeight;
                            break;
                    }
                    fopArr.push({
                        fop: 'imageView2',
                        mode: 3,
                        h: parseInt(height, 10),
                        q: 100,
                        format: 'png'
                    });
                }

                if (imageMogr === 'no-rotate') {
                    fopArr.push({
                        'fop': 'imageMogr2',
                        'auto-orient': true,
                        'strip': true,
                        'rotate': 0,
                        'format': 'png'
                    });
                }
            });

            var newUrl = Qiniu.pipeline(fopArr, key);

            var newImg = new Image();
            img.attr('src', 'loading.gif');
            newImg.onload = function() {
                img.attr('src', newUrl);
                img.parent('a').attr('href', newUrl);
            };
            newImg.src = newUrl;
            return false;
        });
    })
    //.directive('upload',function($rootScope){
    //   return{
    //      restrict:"EA",
    //       transclude:true,
    //       template:'<div id="upContainer" onmousemove="" class="choose banner1_btn"> <span id="pickfiles"><button class="btn btn-primary">上传文件</button> </span> </div>',
    //       controller:'upCtrl',
    //       link:function(scope,element,attrs){
    //
    //       }
    //   };
    //})

//<div upload></div>
//<div class="row">
//    <p class="filelist" ng-repeat="file in $root.filelist" ng-click="$root.fileup()">
//    {{file.name}}
//      <i class="fa fa-remove" style="border: 2px solid white;margin-left: 5px;border-radius: 3px"></i>
//    </p>
//</div>
//    .directive('filelist',function($rootScope,$http,global){
//        return{
//            restrict:'EA',
//            transclude:true,
//            template:'<div class="row"><p class="filelist" ng-repeat="file in $root.filelist" ng-click="$root.filedown()">{{file.name}}<i class="fa fa-remove" style="border: 2px solid white;margin-left: 5px;border-radius: 3px"></i> </p> </div>',
//            link:function(scope,element,attrs){
//                $rootScope.filedown = function(){
//                    alert();
//                };
//
//                $http.post(gem.apiprefix+'user/getinfo', {}).
//                    success(function(data, status, headers, config) {
//                        var msg={
//                            username:'userid'+data.data.id
//                        };
//                        $http.post(global.NODE_FILE+'/filesite/getfilelist',msg)
//                            .success(function (data, status, headers, config) {
//                                $rootScope.filelist = data.data.children ;
//                                console.log(data.data);
//                            }).error(function (data, status, headers, config) {
//                                console.log('getfile后台错误');
//                            });
//                    }).
//                    error(function(data, status, headers, config) {
//                    });
//
//            }
//        }
//    })
    .controller('filelistCtrl',function($rootScope,$scope,$http,$window,global){
        //$http.post(gem.apiprefix+'user/getinfo', {}).
        //    success(function(data, status, headers, config) {
        //        var userid = 'userid'+data.data.id;
        //        var msg={
        //            username:userid,
        //            scheduleid:'scheduleid'+gem.urlVals.scheduleid
        //        };
        //        $http.post(global.NODE_FILE+'/filesite/getonefilelist',msg)
        //            .success(function (data, status, headers, config) {
        //                $rootScope.filelist = data.data.children;
        //            }).error(function (data, status, headers, config) {
        //                console.log('getfile后台错误');
        //            });
        //
        //    }).
        //    error(function(data, status, headers, config) {
        //    });

        function initmyfile(){
            if(gem.urlVals.scheduleid == undefined){
                return;
            }
            var msg={
                //username:userid,
                scheduleid:gem.urlVals.scheduleid
            };
            $http.post(global.NODE_FILE+'/filesite/getmyfilelist',msg)
                .success(function (data, status, headers, config) {
                    if(data.data.children){
                        $rootScope.filelist = data.data.children;
                    }
                }).error(function (data, status, headers, config) {
                    console.log('getfile后台错误');
                });
        }
        initmyfile();





        $rootScope.filedown = function(file){
            $window.open(file.url,'_blank');
        };
        $rootScope.rm = function(file){
            console.log(file,'this is file');
            var msg = {
                //username:'userid'+$rootScope.baseTopCtrlr.user.id,
                //filename:file.name,
                userid:$rootScope.baseTopCtrlr.user.id,
                scheduleid:gem.urlVals.scheduleid
                //filekey:file.key
            };
            $http.post(global.NODE_FILE+'/filesite/rmmyfile',msg)
                .success(function(data,status,headers,config){
                    if(data.data){
                        $rootScope.filelist = undefined;
                    }else{
                        $rootScope.showToast(data.msg);
                    }
                }).error(function(data,status,headers,config){

                });
        };
    });
;