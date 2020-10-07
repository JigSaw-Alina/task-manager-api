const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})




// const me = new User({
//     name: '  Jigs ',
//     email: ' alina.jigs@gmail.com',
//     password: 'Password123'
// })

// me.save().then((me) => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error', error)
// })



