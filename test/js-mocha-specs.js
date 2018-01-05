const chai = require('chai');
const mock = require('mock-require');
const path = require('path');

const should = chai.should();
const PLUGIN_ID = path.resolve(__dirname, '..', 'www', 'secure-http');

describe('Secure HTTP www interface', function() {
  let http = {};
  const noop = () => { /* intentionally doing nothing */ };
  const loadHttp = () => {
    http = mock.reRequire('../www/secure-http');
  };

  this.timeout(900000);

  beforeEach(() => {
    // mocked btoa function (base 64 encoding strings)
    global.btoa = decoded => new Buffer(decoded).toString('base64');

    mock('cordova/exec', noop);
    loadHttp();
  });

  it('sets global headers correctly with two args (old interface)', () => {
    http.setHeader('myKey', 'myValue');
    http.headers['*'].myKey.should.equal('myValue');
  });

  it('sets global headers correctly with three args (new interface) #24', () => {
    http.setHeader('*', 'myKey', 'myValue');
    http.headers['*'].myKey.should.equal('myValue');
  });

  it('sets host headers correctly #24', () => {
    http.setHeader('www.google.de', 'myKey', 'myValue');
    http.headers['www.google.de'].myKey.should.equal('myValue');
  });

  it('resolves global headers correctly #24', () => {
    mock('cordova/exec', (onSuccess, onFail, namespace, method, params) => {
      const headers = params[2];
      headers.should.eql({
        myKey: 'myValue'
      });
    });

    loadHttp();

    http.setHeader('*', 'myKey', 'myValue');
    http.get('url', {}, {}, noop, noop);
  });

  it('resolves host headers correctly (set without port number) #37', () => {
    mock('cordova/exec', (onSuccess, onFail, namespace, method, params) => {
      const headers = params[2];
      headers.should.eql({
        myKey: 'myValue'
      });
    });

    loadHttp();

    http.setHeader('www.google.de', 'myKey', 'myValue');
    http.get('https://www.google.de/?gws_rd=ssl', {}, {}, noop, noop);
  });

  it('resolves host headers correctly (set with port number) #37', () => {
    mock('cordova/exec', (onSuccess, onFail, namespace, method, params) => {
      const headers = params[2];
      headers.should.eql({
        myKey: 'myValue'
      });
    });

    loadHttp();

    http.setHeader('www.google.de:8080', 'myKey', 'myValue');
    http.get('https://www.google.de:8080/?gws_rd=ssl', {}, {}, noop, noop);
  });

  it('resolves request headers correctly', () => {
    mock('cordova/exec', (onSuccess, onFail, namespace, method, params) => {
      const headers = params[2];
      headers.should.eql({
        myKey: 'myValue'
      });
    });

    loadHttp();

    http.get('https://www.google.de/?gws_rd=ssl', {}, { myKey: 'myValue' }, noop, noop);
  });

  it('sets basic authentication header correctly #36', () => {
    http.useBasicAuth('name', 'pass');
    http.headers['*'].Authorization.should.equal('Basic bmFtZTpwYXNz');
  });
});
