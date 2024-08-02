module.exports = {
	globDirectory: '../',
	globPatterns: [
	  '**/*.{html,js,css,png,jpg,svg}'
	],
	swDest: 'sw.js',
	runtimeCaching: [{
	  urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
	  handler: 'CacheFirst',
	  options: {
		cacheName: 'images',
		expiration: {
		  maxEntries: 50,
		},
	  },
	}, {
	  urlPattern: new RegExp('https://cdn.jsdelivr.net/.*'),
	  handler: 'StaleWhileRevalidate',
	  options: {
		cacheName: 'cdn-resources',
	  },
	}],
  };