const express = require('express');
const router = express.Router();
const Marquee = require('../model/marquee');

//.............................................
//add marquee tag api:/marqueeinsert/marquee
//.............................................
router.post('/marquee', async (req, res) => {
  try {
    const newmarquee = req.body;
    // Check if the 'content' field exists and is not an empty string
    if (!newmarquee.content || newmarquee.content.trim() === '') {
      return res.status(400).json({ error: 'Content field is required and cannot be empty.' });
    }

    const createdmarquee = await Marquee.create(newmarquee);
    res.status(201).json({ status: 'success', message: 'Marquee created successfully', Marquee: createdmarquee });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});


// Get The  marquee tag: GET:"/marqueeget/gettag"
router.get('/gettag', async (req, res) => {
  try {
    const tag = await Marquee.find({}, {_id:0 ,__v: 0});
    res.status(200).json({ status: 'sucess', mssg: ' The  marquee tag fetch', The_marquee_tag: tag });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});





//route for updating an existing marquee api:/marqueeupdate/marquee/:id
router.post('/marquee/:id', async (req, res) => {
  try {
    const marqueeId = req.params.id;
    const updatedMarqueeData = req.body;
    // Check if the 'content' field exists and is not an empty string
    if (!updatedMarqueeData.content || updatedMarqueeData.content.trim() === '') {
      return res.status(400).json({ error: 'Content field is required and cannot be empty.' });
    }

    const updatedMarquee = await Marquee.findByIdAndUpdate(marqueeId, updatedMarqueeData, {
      new: true, // Return the updated document
    });

    if (!updatedMarquee) {
      return res.status(404).json({ error: 'Marquee not found.' });
    }

    res.status(200).json({ status: 'success', message: 'Marquee updated successfully', Marquee: updatedMarquee });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

module.exports = router;
