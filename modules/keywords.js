/*KeywordsAPI*/

const mongoose = require('mongoose')

const KeywordSchema = new mongoose.Schema({
    keyword: String,
    link: String,
    amount: Number,
    clicked_amount: {
        type: Number,
        default: 0
    },
    updated_date: String
})


module.exports = mongoose.model('KeywordTbl', KeywordSchema)




/*KeywordsAPI*/