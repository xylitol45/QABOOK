(function(){
    'use strict';

//localStorage.clear();

    ons.bootstrap("myApp",['onsen','ngSanitize'])
    .factory('shared',['$http','$q',function($http,$q){    
        var _o = {
                questionIndex: 0,
                answer: 0,
                correct: false,
                total: 0,
                correctTotal: 0,
                books: [],
                questions: [],
                nowBook: {},                
                choices:['1','2','3','4'],
                init: function(){
                    _o.questionIndex = _o.answer = _o.total = _o.correctTotal = 0,
                    _o.correct = false,
                    _o.nowBook={},
                    _o.questions = [];
                },
                getBooks: function () {
                    return _o.books
                },
                loadBooks:function(){
//                    console.log('loadBooks');
                    _o.books = [];
                    for (var i=0,len=localStorage.length;i<len;i++){
                        var _key = localStorage.key(i);                        
                        if (_key.match(/^q_/)) {
                            try {
                                _o.books.push(JSON.parse(localStorage[_key]));
                            }catch(e){console.log(e);}
                        }
                    }
                    _o.books.sort(function (a, b) {
                        if( a['order'] < b['order'] ) return -1;
                        if( a['order'] > b['order'] ) return 1;
                        return 0;
                    })
//                    console.log(_o.books);
                },
                addBook:function(url){
//                    console.log('addBook:'+url);
                    url = url || 'qa.txt';
                    var _dfd = $q.defer();
                    $http.get(url,{
                         params:{"t":(+new Date())},
                         transformResponse:function(data){return data;}
                    })
                     .then(
                         function(res){                 
                            var _questions=[],
                                _n = (+new Date()).toString(),
                                _a=0,_title=_n, 
                                _buf='',
                                _lines = (res.data || '').split(/\n/),
                                _len = _lines.length,
                                _i = 0;
                            for (var i=0,len=_lines.length;i<len;i++) {
                                var _row=_lines[i];
                                if (_row.match(/^#/)) {
                                    continue;
                                }
                                if (!_row.match(/^\*/)){
                                     _buf += _row+"\n";
                                     continue;
                                }        
                                if (_a > 0){
                                    _questions.push({a: _a, q: _buf});
                                }                                    
                                _a = 0,_buf = '';
                                if (_row.match(/title\s*=\s*([^\s]+)/i)) {
                                    _title = RegExp.$1 || '';
                                }
                                if (_row.match(/a\s*=\s*(\d+)/i)) {
                                    _a = RegExp.$1 || 1;
                                }
                            }
                            if (_a>0) {
                                 _questions.push({a: _a, q: _buf});
                            }
//                            console.log(_questions.length);
                            if (_questions.length == 0){
                                _dfd.reject();
                                return;
                            }
                            // URLが重複する場合、削除
                            (function(){
                                _o.loadBooks();
                                for (var i=0,len=_o.books.length;i<len;i++){
                                    if (url == _o.books[i]['url']) {
                                        localStorage.removeItem(_o.books[i]['id']);
                                        break;
                                    }
                                }
                            })();
                            // 追加                            
                            localStorage['q_'+_n] = JSON.stringify({
                                'id':'q_'+_n,
                                'url':url,
                                'order':_n,
                                'title':_title,
                                'questions':_questions,
                                'result':{
                                    'total':_questions.length,
                                    'correctTotal':0
                                }
                            });
                            _dfd.resolve();
                         },
                         function(){
                             _dfd.reject();
                         }
                     );
                     return _dfd.promise;
                },
                removeBook:function(index){
//                    console.log('removeBook ' + _o.books[index]['id']);
                    localStorage.removeItem(_o.books[index]['id']);
                },
                startQuestion:function(index){
                    _o.init();
                    _o.nowBook = angular.copy(_o.books[index]);
                    _o.questions = angular.copy(_o.nowBook['questions']);
                },
                getQuestion:function(){
                    if (_o.questions.length == 0 || _o.questionIndex >= _o.questions.length) {
                        return {};
                    }
                    var _que = _o.questions[_o.questionIndex];
                    _que.index = _o.questionIndex;
                    return _que;
                },
                setAnswer:function(answer){
                    _o.answer = answer;
                    _o.correct = false;
                    if (_o.answer > 0 && _o.questions[_o.questionIndex].a == _o.answer) {
                        _o.correct = true;
                        _o.correctTotal++;
                    }
                    return;
                },
                isCorrect:function(){
                    return _o.correct;
                },
                nextQuestion:function(){
                    _o.questionIndex++;                    
//                    _o.updateBookResult({
//                       total: _o.questionIndex,
//                       correctTotal: _o.correctTotal
//                    });
                    
                    if (_o.questionIndex >= _o.questions.length) {
                        return false;
                    }
                    return true;  
                },
                getCorrectTotal:function(){
//console.log(_o);                    
                    return _o.correctTotal;
                },
                getQuestionIndex:function(){
                    return _o.questionIndex;
                },
                updateBookResult:function(result){
                    
//                    console.log('updateBookResult:' + JSON.stringify(result));
                    
                    var _id = _o.nowBook['id'];
                    if (_id && localStorage[_id]) {
//console.log("_id:"+_id)                        ;
                        try {
                            var _data = JSON.parse(localStorage[_id]);
                            _data['result'] = result;
                            localStorage[_id] = JSON.stringify(_data);
                        } catch(e) {
                            console.log("error:"+e);
                        }
                    }
                },
                shuffle:function(arr){
                    var i, j, temp;
                    arr = arr.slice();
                    i = arr.length;
                    if (i === 0) {
                        return arr;
                    }
                    while (--i) {
                        j = Math.floor(Math.random() * (i + 1));
                        temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                    return arr;
                }
            };
        return _o;            
    }])
    .controller('topCtrl',['shared','$http', '$scope',function(shared,$http,$scope){
        
//        console.log('topCtrl');
        
        var _this=this;
        shared.loadBooks();

        _this.getBooks = function() {
//            console.log('getBooks');
            return shared.getBooks();    
        },
        _this.onBook = function(i) {
            shared.startQuestion(i);
            app.navi.pushPage('question.html');  
        },
        _this.onDeleteBook = function(i,e){
            e.stopPropagation();
            ons.notification.confirm({
                message: 'このコースを削除しますか？',
                // もしくは messageHTML: '<div>HTML形式のメッセージ</div>',
                title: '',
                buttonLabels: ['はい', 'いいえ'],
                animation: 'default', // もしくは'none'
                primaryButtonIndex: 1,
                cancelable: true,
                callback: function(index) {
                // -1: キャンセルされた
                // 0-: 左から0ではじまるボタン番号
                    if (index == 0) {
                        shared.removeBook(index);
                        shared.loadBooks();
                        $scope.$apply();
                    }
                }
            });            
        },
        _this.onMenu = function(){
            var _dlg = 'top_menu_dialog.html';
            ons.createDialog(_dlg).then(function(dialog) {
                dialog.show();
            });
        },
        _this.goQuestion = function(){
            app.navi.pushPage('question.html');  
        },
        _this.start = function(){
            shared.startQuestion();
            app.navi.pushPage('question.html');            
        };
    }])
    .controller('topMenuDialogCtrl',['shared',function(shared){
        var _this=this;
        _this.goHowto=function(){
            app.topMenuDialog.hide();
            app.navi.pushPage('howto.html');
        };
        _this.goLoadBook=function(){
            app.topMenuDialog.hide();
            app.navi.pushPage('load_book.html');
        };
    }])    
    .controller('howtoCtrl',['shared','$http',function(shared,$http){
        var _this=this;
        $http.get('qa.txt',{
            params:{"t":(+new Date())},
            transformResponse:function(data){return data;}
        })
        .then(
            function(res){      
                _this.data = res.data;
            });                    
        
    }])    
    .controller('loadBookCtrl',['shared','$scope',function(shared,$scope){
        var _this=this;
        _this.url='',
        _this.onLoad=function(){
            shared.addBook(_this.url).then(
                function(){
                    shared.loadBooks();
                    app.navi.popPage();
                },
                function(){
                    console.log('failed');
                    ons.notification.alert({
                        title:'', message: '読み込みに失敗しました',
                    });
                }
            );    
        };
    }])    
    .controller('questionCtrl',['shared','$http', function(shared,$http){
        var _this=this;
        _this.q = "",
        _this.que = {},        
        _this.choices = shared.choices,
        _this.displayQuestion=function(){
            var _que = shared.getQuestion();
            if (_que) {
                _this.index = _que.index;
                _this.q = (_que.q || '').replace(/\n/g,'<br>');
            }
        },
        _this.goQuestion = function(){
            app.navi.pushPage('question.html');  
        },
        _this.goAnswer = function(no){
            shared.setAnswer(no);
            ons.createDialog("answer_dialog.html").then(function(dlg) {                
                dlg.on('prehide',function(e){
                    _this.next();
                });
                dlg.show();
            });            
        },
        _this.goPass = function(){
            shared.setAnswer(0);
            _this.next();    
        },
        _this.next = function(){
            if (shared.nextQuestion()){
                _this.displayQuestion();
            } else {
                app.navi.replacePage('result.html');                
            };
        },
        _this.onExit = function(){
            ons.notification.confirm({
                message: 'このコースを終了してもいいですか？',
                // もしくは messageHTML: '<div>HTML形式のメッセージ</div>',
                title: '',
                buttonLabels: ['はい', 'いいえ'],
                animation: 'default', // もしくは'none'
                primaryButtonIndex: 1,
                cancelable: true,
                callback: function(index) {
                // -1: キャンセルされた
                // 0-: 左から0ではじまるボタン番号
                    console.log(index);
                    if (index == 0) {
                        app.navi.replacePage('result.html');
                    }
                }
            });            
        },
        _this.show = function(dlg) {
            ons.createDialog(dlg).then(function(dialog) {
                dialog.show();
            });
        };
        
        _this.displayQuestion();        
    }])
    .controller('answerDialogCtrl',['shared',function(shared){
        var _this=this;
        _this.isCorrect = shared.isCorrect();
    }])
    .controller('questionMenuDialogCtrl',['shared',function(shared){
        var _this=this;
        _this.goFinish=function(){
            app.questionMenuDialog.hide();
            app.navi.replacePage('result.html');
        };
    }])
    .controller('resultCtrl', ['shared',function(shared){
        var _this=this;
        _this.correctTotal = shared.getCorrectTotal(),
        _this.total = shared.questions.length,
        _this.goTop = function(){
            app.navi.replacePage('top.html');    
        };

        shared.updateBookResult({
            'total': _this.total,
            'correctTotal':_this.correctTotal
        });            
    }]);

})();
