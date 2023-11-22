/*KeywordsAPI*/


const express = require('express')

//setting router
const router = express.Router()

//importing from controller
const {getAllKeywords, createKeywords, updateKeyword, getKeywords, deleteKeyword, startBot, stopBot} = require('../controller/keywords')

//configuring router
router.route('/').get(getKeywords).put(createKeywords)
router.route('/all').get(getAllKeywords)
router.route('/:id').post(updateKeyword).delete(deleteKeyword)
router.route('/startbot').get(startBot)
router.route('/stopBot').post(stopBot)
//exporting router
module.exports = router;


/*KeywordsAPI*/