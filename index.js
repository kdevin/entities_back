const cheerio = require('cheerio'),
	fs = require('fs'),
	path = require('path'),
	Crawler = require('simplecrawler'),
	Promise = require('bluebird');


var pool = [
	"http://www.skysports.com/football/news/more/1",
	"http://www.skysports.com/football/news/more/2",
	"http://www.skysports.com/football/news/more/3",
	"http://www.skysports.com/football/news/more/4",
	"http://www.skysports.com/football/news/more/5",
	"http://www.skysports.com/football/news/more/6",
	"http://www.skysports.com/football/news/more/7",
	"http://www.skysports.com/football/news/more/8",
	"http://www.skysports.com/football/news/more/9",
	"http://www.skysports.com/football/news/more/10",
	"http://www.skysports.com/football/news/more/11",
	"http://www.skysports.com/football/news/more/12",
	"http://www.skysports.com/football/news/more/13",
	"http://www.skysports.com/football/news/more/14",
	"http://www.skysports.com/football/news/more/15",
];

const poolpath = "/football/news";

const htmlpath = './download/',
	jsonpath = './json/';

function crawlFromUrl(initialURL) {
	return new Promise(function (resolve, reject){
		// Crawled URL
		var parsedJson = JSON.parse(fs.readFileSync("crawled_urls.json"));

		// Crawler with configuration
	    var crawler = new Crawler(initialURL);
	    crawler.maxDepth = 3;

	    // Crawler started
	    crawler.on("crawlstart", function() {
		    console.log("Crawl started with "+initialURL+"");
		});

	    // Fetch started
		// crawler.on("fetchstart", function(queueItem) {
		//     console.log("fetchStart : " + queueItem.url + " de profondeur " + queueItem.depth);
		// });

		// URL fetched from the queue
		crawler.on('fetchcomplete', function(queueItem, responseBuffer, response) {
			// We keep the article name in the URL
	        var urlSplitted = queueItem.url.split('/');
	        var urlEndSplitted = urlSplitted[urlSplitted.length - 1].split('-');

	        // We skip all irregular article names
	        if(urlEndSplitted.length > 3){
	            // Path to save file
	            var filepath = htmlpath + queueItem.url.split('/')[queueItem.url.split('/').length - 1] + ".html";

	            // We create the folder if it doesn't already exist
	            if (!fs.existsSync(htmlpath)){
	                fs.mkdirSync(htmlpath);
	            }
	            // We create the HTML file which will contain the buffer
	            fs.writeFile(filepath, responseBuffer, function(err) { 
	                if (err){
	                	console.error("ERROR when writing the file.");
	                	reject(err);
	                }
	            });

	            console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
	            console.log("It was a resource of type %s", response.headers["content-type"]);

	            // We add the current URL in our pool of crawled URLs
	            parsedJson.urls.push(queueItem.url);
	        }
		});

		// We add a fetch condition : the URL must respect the poolpath, or hasn't been crawled yet
		crawler.addFetchCondition(function(queueItem, referrerQueueItem, callback) {
			callback(null, queueItem.path.startsWith(poolpath) && !parsedJson.urls.includes(queueItem.url));
		    //callback(null, queueItem.path.startsWith(poolpath) || (queueItem.path.indexOf("-vs-") > -1 && queueItem.path.indexOf("/report/") > -1));
		});

		// Crawl is completed
		crawler.on("complete", function() {
		    console.log("Crawl for "+initialURL+" finished!");

		    // We add all the crawled URLs to our file
		    fs.writeFileSync("crawled_urls.json",JSON.stringify(parsedJson, null, 2));

		    resolve();
		});

	    // Crawl started
	    crawler.start();
	});
	
};

function readDownloadedFiles(){
	var promises = [];

	fs.readdir(htmlpath, (err, files) => {
		if(err){
			console.error("ERROR when reading the folder.");
			reject(err);
		}
		files.forEach(file => {
			var jsonFile = jsonpath+path.basename(file, '.html')+".json";
			if(!fs.existsSync(jsonFile)){
				promises.push(loadHtmlFile(file));
			}
		});

		Promise.all(promises).then(function(){
			console.log("All JSON files created!");
		}, function(err){
			console.log("Oops, an error occured during the JSON files creation process...");
			console.error(err);
		});
	});
}

function loadHtmlFile(file){
	return new Promise((resolve, reject) => {
		var htmlFile = htmlpath+file;
		var jsonFile = jsonpath+path.basename(file, '.html')+".json";

		var html = fs.readFileSync(htmlFile);
	    var $ = cheerio.load(html);

		var dateLastUpdate = $('.article__header-date-time').text();
		var date = dateLastUpdate.split(" ")[2];

		var title = $('.article__title span').text();
		var desc = $('p[itemprop=description]').text();
		var content = $('.article__body > p').not('p[itemprop=description]').text();

		var array = {"date" : date, "title" : title, "description" : desc, "content" : content};

		var json = JSON.stringify(array, null, 2);

		if (!fs.existsSync(jsonpath)){
	        fs.mkdirSync(jsonpath);
	    }
		fs.writeFileSync(jsonFile, json, function(err) { 
	        if (err){
	        	console.error("ERROR when writing the JSON file.");
	        	reject(err);
	        }
	    });

	    if(fs.existsSync(jsonFile)){
	    	console.log("JSON file for "+file+" created.");
	    	resolve();
	    }
	});
}

Promise.reduce(pool, function(accumulator, url){
	return crawlFromUrl(url).then(function(result){});
},0)
.then(function(){
	console.log("Initiating the JSON files creation process...")
	readDownloadedFiles();
})

/* To crawl math report */

// if(queueItem.url.indexOf("-vs-") > -1 && queueItem.url.indexOf("/report/") > -1){
//     // Path to save file
//     var filepath = htmlpath + urlSplitted[4] + "-" + urlSplitted[5] + ".html";

//     if (!fs.existsSync(htmlpath)){
//         fs.mkdirSync(htmlpath);
//     }
//     fs.writeFile(filepath, responseBuffer, function(err) { 
//         if (err) console.log("ERROR when writing the file.");
//     });

//     console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
//     console.log("It was a resource of type %s", response.headers["content-type"]);

//     parsedJson.urls.push(queueItem.url);
// }

/* To remove duplicates */

// function uniqueArray(arrArg) {
//     return arrArg.filter(function(elem, pos,arr) {
//         return arr.indexOf(elem) == pos;
//     });
// };

// Deleting duplicates
// parsedJson.urls = uniqueArray(parsedJson.urls);