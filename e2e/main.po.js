/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';


var LoginPage = function() {
  this.loginContainer = element(by.css('.container'));
  this.loginH1El = this.loginContainer.element(by.css('h1'));
  this.loginUsernameEl = this.loginContainer.element(by.id('username'));
  this.loginPasswordEl = this.loginContainer.element(by.id('password'));
};

module.exports = new LoginPage;
