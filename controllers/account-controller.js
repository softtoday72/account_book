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
    const { year, month, order } = req.body
    const currentYear = dayjs().format(`YYYY`)
    const currentMonth = dayjs().format(`MM`)
    const userId = req.user.id
    const categoryId = Number(req.query.categoryId) || ''
    let ordering = req.body.order || ['date', 'ASC']
    let star = ''
    let end = ''
    const orderChange = {
      1: '依建立時間',
      2: '依金額 大=>小',
      3: '依金額 小=>大',
    }

    let orderToString = orderChange[Number(order)]
      
    if (year) {
      star += year
      end  += year
    } else {
      star += currentYear
      end  += currentYear
    }
    star +=  '/'
    end  +=  '/'
    if (month) {
      star += month
      end  += month
    } else {
      star += currentMonth
      end  += currentMonth
    }

    star = star +'/1'
    end = end + '/31'

    if (order == '1') {
      ordering = ['date', 'ASC']
    } else if (order == '2') {
      ordering = ['price', 'DESC']
    } else if (order == '3') {
      ordering = ['price', 'ASC']
    }
 
      Promise.all([Account.findAll({
        raw: true,
        nest: true,
        where: {
          date: {
            [Op.between]: [star, end]
          },
          ...categoryId ? { categoryId } : {} 

        },
        order:[
          ordering
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
          res.render('detail', { accounts, total, year, month, categories, categoryId, orderToString, order })
        })
        .catch(error => {
          console.log(error)
          res.render('errorPage', { error: error.message })
          next(error)
        })
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