var express = require('express');
var router = express.Router();
let note = require('../constrollers/noteController')

router.post('/addnotes',note.addNote)
router.post('/deletenotes',note.deleteNote)
router.post('/updatenotes',note.updateNote)
router.post('/searchnotesbycontent',note.searchByContent)
router.post('/searchnotesbyid',note.searchById)

module.exports = router