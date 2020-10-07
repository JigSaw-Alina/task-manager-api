const express = require('express')
const ObjectId = require('mongoose').Types.ObjectId
const auth = require('../middleware/auth')
const Task = require('../models/task')
const router = new express.Router()


// Task

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// limit and skip -> paginating 
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:asc or desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }


    try { 
        // const tasks = await Task.find({ owner: req.user._id }) // 1st approach
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                 limit: parseInt(req.query.limit),
                 skip: parseInt(req.query.skip),
                 sort
            }
        }).execPopulate() // 2nd app  approach
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    if (!ObjectId.isValid(_id)) {
        return res.status(404).send()
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    const _id = req.params.id

    if (!ObjectId.isValid(_id)) {
        return res.status(404).send()
    }

    try {
        const task = await Task.findOne({ _id: _id, owner: req.user._id})        
        
         if (!task) {
           return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }


})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    if (!ObjectId.isValid(_id)) {
        res.status(400).send()
    }

    try {
        const task = await Task.findByIdAndDelete({ _id: _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router