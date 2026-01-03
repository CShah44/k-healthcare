const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const otpStore = {}; // { email: { otp, expires } }

// Configure transporter (use your Gmail and App Password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

// Signup endpoint: send OTP
app.post('/signup', async (req, res) => {
  console.log('Received /signup request', req.body); // <--- Add this line
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

  try {
    await transporter.sendMail({
      from: '"Svastheya" <Svastheya@gmail.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`,
    });
    res.json({ success: true, message: 'OTP sent to email.' });
  } catch (err) {
    console.error(err); // Add this line
    res.status(500).json({ success: false, message: 'Failed to send email.' });
  }
});

// Verify OTP endpoint
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record)
    return res.status(400).json({ success: false, message: 'No OTP sent.' });
  if (Date.now() > record.expires)
    return res.status(400).json({ success: false, message: 'OTP expired.' });
  if (otp !== record.otp)
    return res.status(400).json({ success: false, message: 'Invalid OTP.' });

  // OTP is valid
  delete otpStore[email]; // Remove OTP after verification
  res.json({ success: true, message: 'Email verified.' });
});

// Doctor verification endpoint
// Doctor verification endpoint using Puppeteer & NMC Website
app.post('/verify-doctor', async (req, res) => {
  const { registrationNo, yearOfRegistration, councilName, taskId, groupId } =
    req.body;

  console.log('Received doctor verification request:', {
    registrationNo,
    yearOfRegistration,
    councilName,
    taskId,
    groupId,
  });

  if (!registrationNo || !yearOfRegistration || !councilName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required verification fields.',
    });
  }

  // Map Council Names to IDs based on proper NMC HTML values
  const COUNCIL_MAP = {
    'Andhra Pradesh Medical Council': '1',
    'Arunachal Pradesh Medical Council': '2',
    'Assam Medical Council': '3',
    'Bihar Medical Council': '4',
    'Chattisgarh Medical Council': '5',
    'Delhi Medical Council': '6',
    'Goa Medical Council': '7',
    'Gujarat Medical Council': '8',
    'Haryana Medical Council': '9',
    'Himachal Pradesh Medical Council': '10',
    'Jammu & Kashmir Medical Council': '11',
    'Jharkhand Medical Council': '12',
    'Karnataka Medical Council': '13',
    'Madhya Pradesh Medical Council': '15',
    'Maharashtra Medical Council': '16',
    'Orissa Council of Medical Registration': '17',
    'Punjab Medical Council': '18',
    'Rajasthan Medical Council': '19',
    'Sikkim Medical Council': '20',
    'Tamil Nadu Medical Council': '21',
    'Tripura State Medical Council': '22',
    'Uttar Pradesh Medical Council': '23',
    'Uttarakhand Medical Council': '24',
    'West Bengal Medical Council': '25',
    'Manipur Medical Council': '26',
    'Bhopal Medical Council': '28',
    'Bombay Medical Council': '29',
    'Chandigarh Medical Council': '30',
    'Mahakoshal Medical Council': '35',
    'Madras Medical Council': '36',
    'Mysore Medical Council': '37',
    'Pondicherry Medical Council': '38',
    'Vidharba Medical Council': '40', // Note spelling in HTML was Vidharba
    'Nagaland Medical Council': '41',
    'Mizoram Medical Council': '42',
    'Telangana State Medical Council': '43',
    'Hyderabad Medical Council': '45',
    'Medical Council of India': '46',
    'Travancore Cochin Medical Council, Trivandrum': '50',
  };

  // Helper to find ID fuzzily if exact match fails
  const findCouncilId = (name) => {
    if (COUNCIL_MAP[name]) return COUNCIL_MAP[name];
    // Try fuzzy match
    const lowerName = name.toLowerCase();
    for (const [key, val] of Object.entries(COUNCIL_MAP)) {
      if (
        key.toLowerCase().includes(lowerName) ||
        lowerName.includes(key.toLowerCase())
      ) {
        return val;
      }
    }
    return null;
  };

  const councilId = findCouncilId(councilName);
  if (!councilId) {
    console.error(`Council ID not found for: ${councilName}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid or unsupported Medical Council selected.',
    });
  }

  let browser = null;
  try {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    console.log('Navigating to NMC website...');
    // Increase timeout just in case
    await page.goto(
      'https://www.nmc.org.in/information-desk/indian-medical-register/',
      { waitUntil: 'networkidle2', timeout: 60000 }
    );

    console.log('Page loaded. Selecting Advance Search tab...');

    // 1. Click "Advance Search" tab
    await page.waitForSelector('a[href="#advanceSearch"]', { timeout: 15000 });
    await page.click('a[href="#advanceSearch"]');

    // 2. Wait for the specific form inputs to be visible/present
    // Note: They might be hidden initially by tabs, but Puppeteer can find them.
    // We wait a moment for tab animation
    await new Promise((r) => setTimeout(r, 1000));

    console.log('Filling form details...');

    // 3. Automation using jQuery (since site uses it) to interact with Bootstrap Multiselects
    // which are hard to click standardly.
    const evalResult = await page.evaluate(
      (regNo, regYear, cId) => {
        try {
          // Fill Registration Number (Standard Input)
          $('#doctorRegdNo').val(regNo);

          // Fill Year (Bootstrap Multiselect)
          // Use the plugin API if available, or force value on hidden select + trigger events

          // Try 1: Plugin API
          if (typeof $().multiselect === 'function') {
            $('#doctorYear').multiselect('select', regYear);
            $('#advsmcId').multiselect('select', cId);
          } else {
            // Fallback: Native value set + trigger change
            console.log(
              'Multiselect plugin not found, trying manual value set'
            );
            $('#doctorYear').val(regYear).change();
            $('#advsmcId').val(cId).change();
          }

          // Verify if values stuck (important debugging)
          const yearVal = $('#doctorYear').val();
          const councilVal = $('#advsmcId').val();

          if (yearVal !== regYear || councilVal !== cId) {
            return {
              success: false,
              error: `Failed to set values. Year: ${yearVal} (expected ${regYear}), Council: ${councilVal} (expected ${cId})`,
            };
          }

          // Submit
          $('#doctor_advance_Details').click();
          return { success: true };
        } catch (e) {
          return { success: false, error: e.toString() };
        }
      },
      registrationNo,
      yearOfRegistration,
      councilId
    );

    if (!evalResult.success) {
      throw new Error(`Browser automation failed: ${evalResult.error}`);
    }

    // 4. Wait for results
    try {
      await page.waitForFunction(
        () => {
          // specific processing indicator from the site (DataTables)
          const processing = document.getElementById('doct_info5_processing');
          const isProcessing =
            processing && processing.style.display !== 'none';

          const table = document.getElementById('doct_info5');
          const isTableVisible = table && table.style.display !== 'none';
          // Check if table actually has rows
          const rows = table ? table.querySelectorAll('tbody tr') : [];
          const hasRows = rows.length > 0;

          // Check for "Loading" text in the table itself
          const firstRowText = hasRows ? rows[0].innerText : '';
          const isRowLoading =
            firstRowText.includes('Loading') ||
            firstRowText.includes('Processing');

          const docBody = document.body.innerText;
          const hasNoRecords =
            docBody.includes('No record found') ||
            docBody.includes('No Record Found');

          return (
            !isProcessing &&
            !isRowLoading &&
            ((isTableVisible && hasRows) || hasNoRecords)
          );
        },
        { timeout: 30000 }
      );
    } catch (e) {
      console.log(
        'Wait for results timed out. Proceeding to scrape state anyway...'
      );
    }

    // Scrape results
    const isVerified = await page.evaluate(() => {
      const table = document.getElementById('doct_info5');
      if (table && table.style.display !== 'none') {
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length > 0) {
          const firstRow = rows[0];
          // Check for empty message
          if (
            firstRow.classList.contains('dataTables_empty') ||
            firstRow.innerText.includes('No matching records') ||
            firstRow.innerText.includes('No data available')
          ) {
            return false;
          }
          return true;
        }
      }
      return false;
    });

    console.log(`Verification Result: ${isVerified}`);

    if (isVerified) {
      res.json({
        success: true,
        verified: true,
        message: 'Doctor verified successfully via NMC Register.',
      });
    } else {
      res.json({
        success: false,
        verified: false,
        message: 'Could not find doctor in NMC Register with provided details.',
      });
    }
  } catch (error) {
    console.error('NMC Verification Error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message:
        'Verification failed or timed out. Please check details and try again.',
      error: error.message,
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
