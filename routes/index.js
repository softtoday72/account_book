const express = require('express')
const router = express.Router()
const user = require('./modules/user')
const todo = require('./modules/todo')
const account = require('./modules/account')
const userController = require('../controllers/user-controller')
const accountController = require('../controllers/account-controller')
const todoController = require('../controllers/todo-controller')
const { authenticator, adminAuthenticator } = require('../middleware/auth')
const passport = require('../config/passport')
const { generalErrorHandler } = require('../middleware/error-handler')
const adminController = require('../controllers/admin-controller')

router.use('/user', user)

router.get('/signin', userController.signInPage)

router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/register', userController.signUpPage)

router.post('/register', userController.signUp)

router.get('/logout', userController.logout)

router.get('/create', authenticator, accountController.createExpensePage)

router.post('/create', authenticator, accountController.createExpense)

router.get('/detail', authenticator, accountController.detailPage)

router.post('/detail', authenticator, accountController.detailPage)

router.get('/edit/:id', authenticator, accountController.editExpensePage)

router.put('/edit/:id', authenticator, accountController.editExpense)

router.post('/search', authenticator, accountController.getAccount)

router.get('/delete/:id', authenticator, accountController.deleteAccount)

router.get('/profile/:userId', authenticator, userController.getProfile)

router.put('/profile/:userId', authenticator, userController.editProfile)

router.get('/chart', authenticator, accountController.getChart)

router.post('/chart', authenticator, accountController.getChart)

router.get('/admin/signin',adminController.signInPage)

router.post('/admin/signin', passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }), adminController.signIn)

router.get('/admin', authenticator, adminAuthenticator, adminController.userTable)

router.put('/admin/:userId', authenticator, adminAuthenticator, adminController.userEdit)

router.get('/todos', authenticator, todoController.getTodo)

router.get('/todos/create', authenticator, todoController.todoCreatePage)

router.post('/todos/create', authenticator, todoController.todoCreate)

router.get('/todos/:id', authenticator, todoController.getEditPage)

router.put('/todos/:id', authenticator, todoController.todoEdit)

router.delete('/todos/:id', authenticator, todoController.todoDelete)

router.get('/', authenticator,accountController.getAccount)

router.use('/', generalErrorHandler)

module.exports = router