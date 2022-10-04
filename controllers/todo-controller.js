const { User, Todo } = require('../models')
const dayjs = require('dayjs')
const { Op } = require('sequelize')

const todoController = {
  getTodo: (req, res, next) => {
    const userId = req.user.id
    return Todo.findAll({
      where: { userId },
      raw: true,
      nest: true,
      include: [{ model: User, where: { id: userId } }]
    })
      .then(todos => {
        return res.render('todo',{todos})
      })
      .catch(err => {
        next(err)
      })
  },

  getEditPage: (req, res, next) => {
    const id = req.params.id
    const userId = req.user.id

    return Todo.findOne({
      where: {id , userId},
      include: [{ model: User, where: {id: userId} }],
      raw: true,
      nest: true
    })
      .then(todo => {
        res.render('todo_edit', { todo })
      })
      .catch(err => {
        console.log('getTodoDetail: ', err)
        next(err)
      })

  },

  todoEdit: (req, res, next) => {
    const userId = req.user.id
    const id = req.params.id
    const { name, is_done } = req.body

    return Todo.findOne({
      where:{ id , userId },
    })
      .then(todo => {
        return todo.update({
          name,
          is_done: is_done === 'on',
          userId
        })
      })
      .then(() => {
        res.redirect(`/todos`)
      })
      .catch(err => {
        console.log('todoEdit: ', err)
        next(err)
      })
  },

  todoCreatePage: (req, res, next) => {
    return res.render('todo_new')
  },

  todoCreate: (req, res, next) => {
    const userId = req.user.id
    const name = req.body.name

    return Todo.create({
      name,
      userId
    })
      .then(() => {
        res.redirect('/todos')
      })
      .catch(err => {
        next(err)
        console.log('todoCreate: ' , err)
      })
  },

  todoDelete: (req, res, next) => {
    const userId = req.user.id
    const id = req.params.id
    
    return Todo.findOne({ where: { id, userId } })
      .then(todo => todo.destroy())
      .then(() => res.redirect('/todos'))
      .catch(error => {
        console.log(error)
        next(error)
      })
  }

}

module.exports = todoController