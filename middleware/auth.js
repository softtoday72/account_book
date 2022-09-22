module.exports = {
  authenticator: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('warning_msg', '請先登入才能使用!')
    res.redirect('/signin')
  },
  adminAuthenticator: (req, res, next) => {
    if (req.user.isAdmin) {
      return next()
    }
    req.flash('warning_msg', '請先登入管理員!')
    res.redirect('/admin/signin')
  }
}