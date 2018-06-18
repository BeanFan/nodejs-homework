module.exports = (req,res,next) => {

    var url = req.url;
    if (url != '/login' && !req.session.loginUser && url != '/') {
        console.log('跳转到登录页');
        res.render('login', { message: 'Sorry, You need Login first', time: 3000, url: '/' });
        return;
    }
    next();


}