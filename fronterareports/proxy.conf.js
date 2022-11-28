//proxy.conf.js
var defaultTarget = 'http://frontera001.dyndns.org:9001/';
module.exports = [
{
   context: ['/api/**'],
   target: defaultTarget,
   changeOrigin: true,
}
];