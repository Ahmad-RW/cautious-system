/**
 * Jest Mock
 * ./__mocks__/nodemailer.js
 **/
// load the real nodemailer

const nodemailer = require('nodemailer'); // eslint-disable-line
// pass it in when creating the mock using getMockFor()
const nodemailerMock = require('nodemailer-mock').getMockFor(nodemailer); // eslint-disable-line
// export the mocked module
module.exports = nodemailerMock;
