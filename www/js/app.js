(function(){
  'use strict';
  
  // StatusBar plugin
  //  StatusBar.hide();
  
  var currentItem = {};

  $(document).on('pageinit', '#detail-page', function() {
    $('.item-title', this).text(currentItem.title);
    $('.item-desc', this).text(currentItem.desc);
    $('.item-label', this).text(currentItem.label);
    $('.add-note-action-item', this).click(function () {
        alert('dummy message');
    });
  });

  $(document).on('pageinit', '#list-page', function() {
    $('.item', this).on('click', function() {
      currentItem = {
        title : $('.item-title', this).text(),
        desc : $('.item-desc', this).text(),
        label : $('.item-label', this).text()
      };

      app.navi.pushPage('detail.html');
    });
  });

var _n = 0, _n2=0;

_n=1, _n2=1;



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
        var _this=this;
        _this.goQuestion = function(){
            app.navi.pushPage('question.html');  
        };
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
  }])
  .controller('question2Ctrl',['shared','$http', function(shared,$http){
      _n++;
    console.log('a'+_n);
      
      
      var _this=this, _url='http://f-spring.prv11.srp-tech.net/uAhd43rt/20150726/sample.txt';
      _this.shared = shared;
      _this.msg = _this.shared.question;
      _this.loadMsg = "abc";
        _this.question = "";      
      _this.onAnswer = function(no){
          _this.msg = no;
      };
      _this.goSecond = function(){
        // ページスタックにない場合、コンストラクトは再度呼ばれる
        //app.navi.replacePage('second.html');  
        
        app.navi.pushPage('second.html');  
      };
      _this.load = function(){
          console.log('load');
          // jsonに変換しようとするので、transformResponseを上書きする
        $http.get(_url,{
            params:{"t":(new Date()).getTime()},
            transformResponse:function(data){return data;}
        })
        .then(function(res){
           console.log(res.data); 
           
           _this.question = res.data;
        });
    //     $http({method:'GET',url:_url,
    //         params:{"t":(new Date()).getTime()},
    //         transformResponse:function(data){return data;}
    //     })
    //     .success(function(data,status,headers,config){
    // console.log('success'+data);    
    //     })
    //     .error(function(data,status,headers,config){
    // console.log('error'+status); 
    //     });

      };
      _this.onSample = function(){
// camera
//function onSuccess(imageData) {
//}
//function onFail(message) {
//    alert('Failed because: ' + message);
//}
//navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
//    destinationType: Camera.DestinationType.DATA_URL
//});

//navigator.notification.vibrate();

            // $http({
            //     method : 'GET',
            //     url : 'sample.txt'
            // }).success(function(data, status, headers, config) {
            //     _this.msg = data.data;
            //     console.log(status);
            //     console.log(data);
            // }).error(function(data, status, headers, config) {
            //     console.log(status);
            // });

// jsonに変換しようとするので、transformResponseを上書きする
$http.get('sample.txt',{
    transformResponse:function(data){return data;}
}).then(function(response){
     // return csvParser(response.data);
console.log(response.data);
_this.msg = response.data;
});
  
// $http({method:'GET',url:'sample.txt'})
// .success(function(data,status,headers,config){
//    console.log('success'+data);    
// })
// .error(function(data,status,headers,config){
//    console.log('error'+status); 
// });

//_this.msg = $http.get('sample.txt');
        // ページスタックにない場合、コンストラクトは再度呼ばれる
        //app.navi.replacePage('second.html');  
        
        //app.navi.pushPage('second.html');  
      };
  }])
  .controller('secondCtrl',['shared',function(shared){
      _n2++;
      console.log('second:'+_n2);
      var _this=this;
      _this.shared = shared;
      _this.goTop=function(){
        _this.shared.question = 'next';
        //app.navi.replacePage('top.html'); 
        app.navi.popPage();
      };
  }]);

})();


