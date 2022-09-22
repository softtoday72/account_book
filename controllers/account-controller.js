const db = require('../models')
const { Account, User, Category } = db
const dayjs = require('dayjs') 
const { Op } = require('sequelize')

const accountController = {
  
  getAccount: (req, res, next) => {
    const userId = req.user.id
    const { year, month } = req.body
    if (year && month) {
      Account.findAll({
        raw: true,
        nest: true,
        where: {
          date: {
            [Op.between]: [`${year}/${month}/1`, `${year}/${month}/31`]
          }
        },
        include: [{ model: User, where: { id: userId } }]
      })
        .then(data => {
          let food = 0
          let traffic = 0
          let superMarket = 0
          let bill = 0
          let other = 0
          let total
          for (let i = 0; i < data.length; i++) {
            if (data[i].categoryId == 1) {
              food = food + Number(data[i].price)
            } else if (data[i].categoryId == 2) {
              traffic += Number(data[i].price)
            } else if (data[i].categoryId == 3) {
              superMarket += Number(data[i].price)
            } else if (data[i].categoryId == 4) {
              bill += Number(data[i].price)
            } else if (data[i].categoryId == 5) {
              other += Number(data[i].price)
            }
          }
          total = food + traffic + superMarket + bill + other
          res.render('account', { food, traffic, superMarket, bill, other, total, year, month })
        })
    } else {
    Account.findAll({
      raw: true,
      nest: true,
      include: [{ model:User, where:{ id: userId }}]
    })
      .then( data => {
        let food = 0
        let traffic = 0
        let superMarket = 0
        let bill = 0
        let other = 0
        let total 
        for(let i = 0 ; i < data.length ; i++) {
          if(data[i].categoryId == 1) {
            food = food + Number(data[i].price)
          } else if(data[i].categoryId == 2) {
            traffic += Number(data[i].price)
          } else if (data[i].categoryId == 3) {
            superMarket += Number(data[i].price)
          } else if (data[i].categoryId == 4) {
            bill += Number(data[i].price)
          } else if (data[i].categoryId == 5) {
            other += Number(data[i].price)
          }       
        }
        total = food + traffic + superMarket + bill + other
        
        res.render('account', { food, traffic, superMarket,bill, other, total })
      })}
  },
  createExpensePage : (req, res, next) => {
    Category.findAll({
      raw: true
    })
      .then(categories => res.render('create', {categories}))
      .catch(err => next(err))
    
  },
  createExpense: (req, res, next) => {
    const userId = req.user.id
    const { name, price, date, categoryId } = req.body
    Account.create({
      name,
      price,
      userId,
      date,
      categoryId
    })
      .then(res.redirect('/'))
      .catch(error => {
        console.log(error)
        res.render('errorPage', { error: error.message })
        next(error)
      })
  },
  detailPage : (req, res, next) => {
    const { year, month } = req.body
    const year_month = dayjs().format(`YYYY/MM`)
    const userId = req.user.id
    const categoryId = Number(req.query.categoryId) || ''
    //dayjs(data.date).format(`MM`)
    // => 09
    if(year && month) {
      Promise.all([Account.findAll({
        raw: true,
        nest: true,
        where: {
          date: {
            [Op.between]: [`${year}/${month}/1`, `${year}/${month}/31`]
          },
          ...categoryId ? { categoryId } : {} 
        },
        order:[
          ['date','ASC']
        ],
        include: [
          { model: User, where: { id: userId } }
        ]
      }), Category.findAll({
        raw: true
      })])
        .then(([accounts, categories]) => {
          for (let i = 0; i < accounts.length; i++) {
            accounts[i].date = dayjs(accounts[i].date).format(`YYYY-MM-DD`)
          }
          let total = 0
          const categoryChange = {
            1: '飲食',
            2: '交通',
            3: '超市',
            4: '帳單',
            5: '其他'
          }
          for (let i = 0; i < accounts.length; i++) {
            total += Number(accounts[i].price)
            accounts[i].categoryIdToString = categoryChange[accounts[i].categoryId]
          }
          res.render('detail', { accounts, total, year, month, categories, categoryId })
        })
        .catch(error => {
          console.log(error)
          res.render('errorPage', { error: error.message })
          next(error)
        })
    } else {
      Promise.all([Account.findAll({
        raw: true,
        nest: true,
        where: {
          date: {
            [Op.between]: [`${year_month}/1`, `${year_month}/31`]
          },
           ...categoryId ? { categoryId } : {} 
        },
        order: [
          ['date', 'ASC']
        ],
        include: [
          { model: User, where: { id: userId } }
        ]
      }), Category.findAll({
        raw: true
      })])
        .then(([accounts, categories]) => {
          for (let i = 0; i < accounts.length; i++) {
            accounts[i].date = dayjs(accounts[i].date).format(`YYYY-MM-DD`)
          }
          let total = 0
          const categoryChange = {
            1: '飲食',
            2: '交通',
            3: '超市',
            4: '帳單',
            5: '其他'
          }
          for (let i = 0; i < accounts.length; i++) {
            total += Number(accounts[i].price)
            accounts[i].categoryIdToString = categoryChange[accounts[i].categoryId]
          }
          res.render('detail', { accounts, total, categories, categoryId })
        })
        .catch(error => {
          console.log(error)
          res.render('errorPage', { error: error.message })
          next(error)
        })
    }
    
  },
  editExpensePage: (req, res, next) => {
    Promise.all([
      Account.findByPk(req.params.id, {
        raw: true
      }), Category.findAll({
        raw: true
      })
    ])
      .then(([account, categories]) => {
        if (!account) throw new Error("紀錄不存在!")
        const categoryChange = {
          1: '飲食',
          2: '交通',
          3: '超市',
          4: '帳單',
          5: '其他'
        }
        const categoryIdToString = categoryChange[account.categoryId]
        account.date = dayjs(account.date).format(`YYYY-MM-DD`)
        res.render('edit', { account, categories, categoryIdToString })
      })
      .catch(err => next(err))
  },
  editExpense: (req, res, next) => {
    const { name, price, date, categoryId } = req.body
    //categoryId = Number(categoryId)
    Account.findByPk(req.params.id)
      .then(account => {
        if (!account) throw new Error("紀錄不存在!")
        return account.update({
          name,
          price,
          categoryId,
          date
        })
      })
      .then(() =>{
        req.flash('success_messages', '資料修改成功!')
        res.redirect('/detail')
      })
      .catch(err => next(err))
  },
  deleteAccount: (req, res, next) => {
    const id = req.params.id
    Account.findByPk(id)
      .then(account => {
        return account.destroy()
      })
      .then(() => {
        res.redirect('/detail')
      })
      .catch(err => next(err))
  }
}

module.exports = accountController