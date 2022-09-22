const bcrypt = require('bcryptjs')
//const User = require('../models/user')
const db = require('../models')
const { User } = db
const userController = {
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')

    res.redirect('/')
  },
  signUpPage: (req, res) => {
    res.render('register')
  },
  signUp: (req, res) => {
    const { account, name, email, password, checkPassword } = req.body
    if (checkPassword !== password) throw new Error('請確認密碼!')
    if (!account || !name || !email || !password || !checkPassword) throw new Error('所有欄位都是必填!')

    Promise.all([User.findOne({ where: { email: email } }), User.findOne({ where: { account: account } })])
      .then(([checkEmail, checkAccount]) => {
        if (checkEmail) throw new Error('信箱已註冊!')
        if (checkAccount) throw new Error('帳號已註冊!')
        return bcrypt.hash(password, 10)
      })
      .then(hash => User.create({
        account,
        name,
        email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號!')
        res.redirect('/signin')
      })
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getProfile: (req, res, next) => {
    const id = req.user.id
    return User.findByPk(id)
      .then(user => {
        user = user.toJSON()
        res.render('profile', { user })
      }).catch(err => next(err))
    
  },
  editProfile: async (req, res, next) => {
    try {
      const userId = req.user.id
      const { account, name, email, password, passwordCheck } = req.body
      const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
      if (!account) throw new Error('請輸入帳號!')
      if (!email) throw new Error('請輸入Email!')
      if (email.search(emailRule) == -1) throw new Error('請確認Email格式!')
      if (!password) throw new Error('請輸入密碼!')
      if (password !== passwordCheck) throw new Error('請確認密碼!')
      const [user, accountOverlap, emailOverlap] = await Promise.all([
        User.findByPk(userId),
        User.findOne({ raw: true, where: { account } }),
        User.findOne({ raw: true, where: { email } })
      ])

      if (accountOverlap !== null) {
        if (accountOverlap.id !== userId) {
          throw new Error('帳號已重複註冊！')
        }
      }
      if (emailOverlap !== null) {
        if (emailOverlap.id !== userId) {
          throw new Error('email已重複註冊！')
        }
      }
      
      const hash = await bcrypt.hash(req.body.password, 10)
      await user.update({
        account,
        name,
        email,
        password: hash
      })
      return res.redirect(`/profile/{{userId}}`)
    } catch (err) {
      next(err)
    }
  }

}

module.exports = userController