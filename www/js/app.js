(function(){
    'use strict';

    ons.bootstrap("myApp",['onsen','ngSanitize'])
    .factory('shared',['$http','$q',function($http,$q){    
        var _dfd, 
            _questionIndex, 
            _answer=0, 
            _correct=false,
            _total=0,
            _correctTotal=0, 
            _questions=[],
            _dlgs=[],
            _init = function(){
                _dfd = $q.defer(),
                _questionIndex=_answer=_total=_correctTotal=0,
                _correct=false,
                _questions=[];
            },
            _shuffle = function(arr){
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
            };
        return {
            init:_init,
            dlgs:_dlgs,
            loadQuestion:function(){
                _init();
                var _url ='sample.txt';
                 $http.get(_url,{
                     params:{"t":(new Date()).getTime()},
                     transformResponse:function(data){return data;}
                 })
                 .then(
                     function(res){                         
                         var _a=0, _buf='',_lines = (res.data || '').split(/\n/);
                         for (var i=0,len=_lines.length;i<len;i++) {
                             var _row=_lines[i];
                             if (_row.match(/^\*/)){
                                if (_a > 0){
                                    _questions.push({a: _a, q: _buf});
                                }                                    
                                _a = 0;
                                _buf = '';
                                if (_row.match(/a\s*=\s*(\d+)/i)) {
                                    _a = RegExp.$1 || 1;
                                }
                             } else {
                                 _buf += _row+"\n";
                             }
                        }
                        if (_a>0) {
                             _questions.push({a: _a, q: _buf});
                        }
                        if (_questions.length == 0){
                            _dfd.resolve();
                            return;
                        }
                        _shuffle(_questions);
                        _dfd.resolve();
                     },
                     function(){
                         _dfd.reject();
                     }
                 );
                 return _dfd.promise;
            },
            getQuestion:function(){
                if (_questions.length == 0 || _questionIndex >= _questions.length) {
                    return {};
                }
                var _que = _questions[_questionIndex];
                _que.index = _questionIndex;
                return _que;
            },
            setAnswer:function(answer){
                _answer = answer;
                _correct = false;
                if (_answer > 0 && _questions[_questionIndex].a == _answer) {
                    _correct = true;
                    _correctTotal++;
                }
                return;
            },
            isCorrect:function(){
                return _correct;
            },
            nextQuestion:function(){
                _questionIndex++;
                if (_questionIndex >= _questions.length) {
                    return false;
                }
                return true;  
            },
            getCorrectTotal:function(){
                return _correctTotal;
            },
            getQuestionIndex:function(){
                return _questionIndex;
            }
        };
    }])
    .controller('topCtrl',['shared','$http', function(shared,$http){
        var _this=this, 
            _books=[
            ];
        for(var i=0;i<20;i++) {
            _books.push("book"+i);
        }
        _this.getBooks = function() {
            return _books;    
        },
        _this.onBook = function(i) {
            console.log(_books[i]);    
        },
        _this.goQuestion = function(){
            app.navi.pushPage('question.html');  
        },
        _this.start = function(){
            shared.loadQuestion()
            .then(function(){
                app.navi.pushPage('question.html');
            });
        };
    }])
    .controller('questionCtrl',['shared','$http', function(shared,$http){
        var _this=this;
        _this.q = "",
        _this.que = {};
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
            console.log('next:' + shared.getQuestionIndex());
            if (shared.nextQuestion()){
                _this.displayQuestion();
            } else {
                app.navi.replacePage('result.html');                
            };
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
        _this.total = shared.getQuestionIndex(),
        _this.goTop = function(){
            app.navi.replacePage('top.html');    
        };
    }])
    .controller('dialogCtrl', ['shared', function(shared){
        var _this=this;
        _this.username = (new Date()).getTime();
    }]);

})();


