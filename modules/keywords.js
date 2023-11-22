/*KeywordsAPI*/

const mongoose = require('mongoose')

const KeywordSchema = new mongoose.Schema({
    keyword: String,
    link: String,
    amount: Number,
    updated_date: String
})


module.exports = mongoose.model('KeywordTbl', KeywordSchema)




/*KeywordsAPI*/