/**
 *
 * Created by apple on 16/6/28.
 */

module.exports = function(router){
    router.get('/mypolls', isLoggedIn, function (req, res, next) {

        res.render('my_polls');
    });

    router.post('/new/post', isLoggedIn, function (req, res, next) {
        var title = req.body.title;
        var options = req.body.options;



        res.render('new_polls');
    });
    router.get('/new', isLoggedIn, function (req, res, next) {

        res.render('new_polls');
    });


    router.get('/polls/:id', isLoggedIn, function (req, res, next) {

        res.render('poll_detail', { id: req.params.id });
    });
};
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}