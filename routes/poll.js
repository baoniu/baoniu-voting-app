/**
 *
 * Created by apple on 16/6/28.
 */
global.dbHelper = require('../config/dbHelper');
Polls = global.dbHelper.getModel('poll');
Ip = global.dbHelper.getModel('ip');

module.exports = function(router){
    router.get('/poll/me', isLoggedIn, function (req, res, next) {
        Polls.find({user_id: req.user._id}, {_id: 1, question: 1}, function (error, doc) {
            if(error) {
                req.flash('error', error.message);
                res.redirect('/');
            } else {
                res.render('poll/me', {doc: doc});
            }

        });
    });

    router.get('/poll/delete/:id', isLoggedIn, function(req, res, next){
        Polls.remove({_id: req.params.id, user_id: req.user._id}, function(error, doc){
            if(error) {
                req.flash('error','删除失败');
                res.redirect('/poll/detail/' + req.params.id);
            } else {
                req.flash('success','恭喜你，成功删除');
                res.redirect('/');
            }
        });
    });
    router.post('/poll/new/post', isLoggedIn, function (req, res, next) {
        var options =[];
        var title = req.body.title;
        var arr = req.body.options;

        if(arr.length > 0 && title.length > 0){
            arr = arr.split('\r\n');
            arr.map(function(v){
                var isRepeat = false;
                for(var i = 0; i<options.length; ++i){
                    if(options[i].text == v){
                        isRepeat = true;
                        break;
                    }
                }
                if(!isRepeat){
                    if(v && v.length>0) {
                        options.push({
                            text: v,
                            votes: 0
                        });
                    }
                }
            });

            var poll = {
                user_id: req.user._id,
                question: title,
                choices: options
            };

            Polls.create(poll, function (error, doc) {
                if(doc) {
                    req.flash('success','添加成功！');
                    res.redirect('/poll/detail/' + doc._id);
                } else {
                    req.flash('error','添加失败！！');
                    res.redirect('/poll/new');
                }
            });
        } else {
            req.flash('error','参数不能为空！');
            res.redirect('/poll/new');
        }

    });
    router.get('/poll/new', isLoggedIn, function (req, res, next) {

        res.render('poll/new');
    });
    router.post('/poll/vote', isLoggedIn, function(req, res, next){

        var optionID = req.body.id;
        var choiceOption = req.body.option;
        var newOption = req.body.new;
        var ip = req.connection.remoteAddress;

        if(choiceOption == 'new' && newOption.length <=0 || optionID.length<=0 || choiceOption.length<=0) {
            req.flash('error', '选项不能为空！')
            res.redirect('/poll/detail/' + optionID);
            return;
        }

        Ip.findOne({'$and': [
            {'pool_question_id': optionID},
            { '$or':[{'ip': ip}, {'user_id': req.user._id}] }
        ]}, function (error, doc) {
            if(doc){
                req.flash('error', '您已投过票了，不能重复投票！');
                res.redirect('/poll/detail/' + req.body.id);
            } else {
                Polls.findOne({_id: optionID}, function (error, doc) {
                    if(doc) {
                        if(choiceOption == 'new') {
                            var isRepeat = false;
                            for(var i = 0; i < doc.choices.length; i++){
                                if(doc.choices[i].text == newOption) {
                                    isRepeat = true;
                                }
                            }
                            if(isRepeat) {
                                req.flash('error', '不能创建重复的选项！');
                                res.redirect('/poll/detail/' + req.body.id);
                                return;
                            } else {
                                doc.choices.push({
                                    text:  newOption,
                                    votes: 1
                                });
                            }

                        } else {
                            for(var i = 0; i < doc.choices.length; i++){
                                if(doc.choices[i].text == choiceOption) {
                                    doc.choices[i].votes = doc.choices[i].votes + 1;
                                }
                            }
                        }

                        //混合类型因为没有特定约束，
                        //因此可以任意修改，一旦修改了原型，
                        //则必须调用markModified()
                        //传入read，表示该属性类型发生变化
                        doc.markModified('choices');
                        
                        doc.save(function (error) {
                           if(!error) {
                               req.flash('success', '投票成功！');
                               res.redirect('/poll/detail/' + req.body.id);

                               Ip.create({
                                   pool_question_id: req.body.id,
                                   user_id: req.user._id,
                                   ip: ip
                               }, function (error, doc) {
                                   //不写啦 ..
                               });

                           } else {
                               req.flash('error', '投票失败，数据库原因！');
                               res.redirect('/poll/detail/' + req.body.id);
                           }
                            return true;
                        });
                    } else {
                        req.flash('error', '投票不存在！');
                        res.redirect('/');
                    }
                });
            }
        });
    });
    router.get('/poll/detail/:id', function (req, res, next) {
        var id = req.params.id;
        Polls.findOne({_id: id}, function (error, doc) {
            if(!doc) {
                req.flash('error', '你所访问的的页面不存在！');
                res.redirect('/');
            } else {
                res.render('poll/detail', {doc: doc});
            }
        });
    });
};
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    req.flash('error', '访问该页面需要先登陆！');
    res.redirect('/');
}