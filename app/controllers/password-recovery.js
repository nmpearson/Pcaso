'use strict';

var formidable = require('formidable');
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
var fs = require('fs');
var util = require('util');
var multipart = require('multipart');
var config = require('../../config/config');
var async = require('async');
var mailer = require('../../config/mailer');

var AccountRecovery = mongoose.model('UnlockAccount');
var Users = mongoose.model('User');

exports.requestRecoveryEmailForm = function (req, res) {
    if (req.isAuthenticated()) return res.redirect('/profile');
    res.render('account-recovery-form', { user: req.user });
};

exports.requestRecoveryEmail = function (req, res) {
    if (req.isAuthenticated()) return res.redirect('/profile');

    // Send confirmation to the user
    res.render('account-recovery-confirmation-sent', { user: req.user, email: req.body.email });

    var query = { email: req.body.email };

    Users.findOne(query, function (queryErr, user) {
        if (queryErr) {
            console.error('Error finding user:', queryErr);
            return;
        }
        if (!user) {
            console.error('User not found');
            return;
        }

        var recoveryDoc = AccountRecovery.register(user);

        recoveryDoc.save(function (saveErr) {
            if (saveErr) {
                console.error('Error saving recovery doc:', saveErr);
                return;
            }

            mailer.useTemplate('password-recovery', user, { recovery: recoveryDoc }, function (mailErr) {
                if (mailErr) {
                    console.error('Error sending recovery email:', mailErr);
                }
            });
        });
    });
};

exports.resetAccountPasswordForm = function (req, res) {
    if (req.isAuthenticated()) return res.redirect('/profile');
    res.render('password-reset-form', { user: req.user, recoveryID: req.params.recoveryID });
};

exports.resetAccountPassword = function (req, res) {
    if (req.isAuthenticated()) return res.redirect('/403');

    var recoveryQuery = { _id: req.params.recoveryID };

    AccountRecovery.findOne(recoveryQuery, function (recErr, recoveryDoc) {
        if (recErr) {
            console.error('Error finding recovery document:', recErr);
            return res.redirect('/500');
        }

        if (!recoveryDoc) return res.redirect('/404');

        var userQuery = {
            _id: recoveryDoc.parent.id,
            email: req.body.email.toLowerCase()
        };

        Users.findOne(userQuery, function (userErr, user) {
            if (userErr) {
                console.error('Error finding user:', userErr);
                return res.redirect('/500');
            }
            if (!user) return res.redirect('/404');

            user.password = Users.generateHash(req.body.password);

            user.save(function (userSaveErr) {
                if (userSaveErr) {
                    console.error('Error saving user:', userSaveErr);
                    return res.redirect('/500');
                }

                res.redirect('/sign-in');

                recoveryDoc.remove(function (removeErr) {
                    if (removeErr) {
                        console.error('Error removing recovery document:', removeErr);
                    }
                });
            });
        });
    });
};
