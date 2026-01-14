require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// New Route to GET the latest complaint from MySQL
app.get('/get-latest-complaint', (req, res) => {
    const sql = "SELECT * FROM complaints ORDER BY id DESC LIMIT 1";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]); 
    });
});

// Route to Save Complaint
app.post('/save-complaint', (req, res) => {
    const ticketId = "COMP-" + Math.floor(100000 + Math.random() * 900000);
    const { compl_dt, etl_asset, ratings, location, dept, zone, boq, max_phone, mobile, category, description } = req.body;

    const sql = "INSERT INTO complaints (ticket_id, compl_dt, etl_asset, ratings, location, dept, zone, boq_detail, max_phone, mobile_no, category, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [ticketId, compl_dt, etl_asset, ratings, location, dept, zone, boq, max_phone, mobile, category, description], (err, result) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", ticket: ticketId });
    });
});


// Route to Save PM Report
app.post('/save-pm', (req, res) => {
    const data = req.body;
    const sql = `INSERT INTO pm_reports (etl_ups_sn, location, pm_date, pm_done_by, boq_item, ratings, checklist_results, ac_input_volts, ac_input_curr, input_freq, dc_rectifier, dc_smps, ac_smps, ac_output_volt, ac_output_curr, battery_data, spares_replaced, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const checklist = JSON.stringify(data.checklist);

    db.query(sql, [
        data.etl_ups_sn, data.location, data.pm_date, data.pm_done_by, data.boq_item, data.ratings, 
        checklist, data.ac_input_volts, data.ac_input_curr, data.input_freq, data.dc_rectifier, 
        data.dc_smps, data.ac_smps, data.ac_output_volt, data.ac_output_curr, data.battery_data, 
        data.spares_replaced, data.remarks
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "success" });
    });
});

// Route to Get Latest PM Report
app.get('/get-latest-pm', (req, res) => {
    const sql = "SELECT * FROM pm_reports ORDER BY id DESC LIMIT 1";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// 1. Get all reports that are 'Pending' approval
app.get('/get-pending-pm', (req, res) => {
    const sql = "SELECT id, etl_ups_sn, location, pm_date, pm_done_by FROM pm_reports WHERE approval_status = 'Pending' ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Get a single report for detailed review
app.get('/get-pm-details/:id', (req, res) => {
    const sql = "SELECT * FROM pm_reports WHERE id = ?";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// 3. Update Status (Approve/Reject)
app.post('/update-pm-approval', (req, res) => {
    const { id, status, remarks, approver_name } = req.body;
    const sql = "UPDATE pm_reports SET approval_status = ?, approver_remarks = ?, approved_by = ?, approved_at = NOW() WHERE id = ?";
    
    db.query(sql, [status, remarks, approver_name, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "success", message: `Report ${status} successfully` });
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});