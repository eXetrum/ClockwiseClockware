const { Watches } = require('../database/models');

const get = async (req, res) => {
    try {
        const watches = await Watches.findAll();
        res.status(200).json({ watches }).end();
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
};

module.exports = { get };
