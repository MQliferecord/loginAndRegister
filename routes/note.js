var express = require('express');
var router = express.Router();
let note = require('../constrollers/noteController')

router.post('/',note.addNote)
router.delete('/:id',note.deleteNote)
router.put('/:id',note.updateNote)
router.get('/content/:content',note.searchByContent)
router.get('/id/:id',note.searchById)
router.get('/page/:page/:size',note.searchByPageSize)

module.exports = router