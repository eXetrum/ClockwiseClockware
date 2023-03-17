const { Watches } = require('../database/models');

const get = async (req, res) => {
    try {
        const watches = await Watches.findAll();
        res.status(200).json({ watches }).end();
    } catch (error) {
        res.status(400).json(error).end();
    }
};

module.exports = { get };
