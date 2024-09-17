const { getPerformanceReport, storePerformanceRecord, updateSocialCriteria, deletePeformanceReport, getPerformanceRecord} = require("../services/performance-report-service");
const { SocialPerformance } = require('../models/SocialPerformance'); //TODO remove this
const { PerformanceRecord } = require('../models/PerformanceRecord');
const {createDB, deleteDB} = require('../../unit-tests/support/mockdb-new') //TODO remove after testing this and insert the real db into function
const express = require('express');
const app = express();
// var db = req.app.get('db');//TODO needs to be removed onece there is an actual db
// createDB().then(res => db = res).then(() => console.log("db is has started running") );


convert = (input) => {
    if(input.date){
        return {
            "salesManId": input.salesManId,
            "date": input.date
        }
    } else {
        return {
            "salesManId": input.salesManId,
        }
    }

}
//TODO implement the api for by using the bonus compution service
exports.saveSocialPerformance = async function (req, res) {
    const db = req.app.get('db');
    const performance = req.body;
    try {
        if (!performance instanceof PerformanceRecord || performance === null)
            throw new TypeError("Invalid performance object");
        // Await the result of the storePerformanceRecord function
        const result = await storePerformanceRecord(db, performance);
        // Send the result if successful
        res.status(200).json(result);
    } catch (error) {
        // Handle unexpected errors
        console.error('Error saving performance record:', error);
        if (error instanceof TypeError)
            res.status(422).json({ error: 'Failed to save performance record: ' + error.message });
        else
            res.status(500).json({ error: 'Something went wrong' });
    }
    
};


exports.getPerformanceReport = async (req, res) => {
    const db = req.app.get('db');
    // console.log(db)
    const {salesManId , date} = req.params
    try {
        const result = await getPerformanceReport(db, salesManId, date);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching performance report:', error);
        // Return a specific status code based on the type of error if needed
        if (error.message === 'Performance report not found.') {
            res.status(404).json({ error: 'Performance report not found' });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
};


exports.updatePerformanceReport = async (req, res) => {
    const db = req.app.get('db');
    const { salesManId, date } = convert(req.params);
    console.log("salesManId", salesManId);
    const updatedData = req.body;

    try {
        const result = await updateSocialCriteria(db, salesManId, date, updatedData);
        if (!result) {
            res.status(404).json({ error: 'Performance report not found or not updated' });
        }
        res.status(200).json({ message: 'Performance report updated successfully', result });
    } catch (error) {
        console.error('Error updating performance report:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
};


exports.deletePerformanceReport = async (req, res) => {
    const db = req.app.get('db');
    const { salesManId, date } = convert(req.params);

    try {
        await deletePeformanceReport(db, salesManId, date);
        res.status(200).json({ message: 'Performance report deleted successfully' });
    } catch (error) {
        console.error('Error deleting performance report:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
};

exports.getPerformanceRecord = async (req, res) => {
    const salesManId = req.params.salesManId;
    try{
        const db = req.app.get('db');
        const result = await getPerformanceRecord(db, salesManId);
        res.status(200).send(result)
    } catch (error) {
        console.error('Error deleting performance report:', error);
    }
}

//TODO remove this
const socialPerformance = new SocialPerformance({
    leadershipCompetence: { actual: 5, target: 4 }, // Exceeds target
    opennessToEmployee: { actual: 3, target: 4 },  // Below target
    socialBehaviourToEmployee: { actual: 4, target: 4 }, // Meets target
    attitudeTowardsClients: { actual: 6, target: 4 }, // Exceeds target
    communicationSkills: { actual: 4, target: 4 }, // Meets target
    integrityToCompany: { actual: 7, target: 4 } // Exceeds target
});

//const calculatedBonuses = bonusComputation(socialPerformance); //TODO fix
//console.log('Calculated Bonuses:', calculatedBonuses);
