// Example use of simplecrawler, courtesy of @breck7! Thanks mate. :)

/**
 * @param String. Domain to download.
 * @Param Function. Callback when crawl is complete.
 */
var downloadSite = function(initialURL, callback) {
    var fs = require("fs"),
        Crawler = require("simplecrawler");

	var dirpath = './download/';
	var parsedJson = JSON.parse(fs.readFileSync("crawled_urls.json"));

    var crawler = new Crawler(initialURL);
    var path = "/football/news";

    crawler.maxDepth = 3;

    crawler.on("crawlstart", function() {
	    console.log("Crawl starting!");
	});

	// crawler.on("fetchstart", function(queueItem) {
	//     console.log("fetchStart : " + queueItem.url + " de profondeur " + queueItem.depth);
	// });

	crawler.on('fetchcomplete', function(queueItem, responseBuffer, response) {
        var urlSplitted = queueItem.url.split('/');
        var urlEndSplitted = urlSplitted[urlSplitted.length - 1].split('-');

        // if(queueItem.url.indexOf("-vs-") > -1 && queueItem.url.indexOf("/report/") > -1){
        //     // Path to save file
        //     var filepath = dirpath + urlSplitted[4] + "-" + urlSplitted[5] + ".html";

        //     if (!fs.existsSync(dirpath)){
        //         fs.mkdirSync(dirpath);
        //     }
        //     fs.writeFile(filepath, responseBuffer, function(err) { 
        //         if (err) console.log("ERROR when writing the file.");
        //     });

        //     console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
        //     console.log("It was a resource of type %s", response.headers["content-type"]);

        //     parsedJson.urls.push(queueItem.url);
        // }

        if(urlEndSplitted.length > 3){
            // Path to save file
            var filepath = dirpath + queueItem.url.split('/')[queueItem.url.split('/').length - 1] + ".html";

            if (!fs.existsSync(dirpath)){
                fs.mkdirSync(dirpath);
            }
            fs.writeFile(filepath, responseBuffer, function(err) { 
                if (err) console.log("ERROR when writing the file.");
            });

            console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
            console.log("It was a resource of type %s", response.headers["content-type"]);

            parsedJson.urls.push(queueItem.url);
        }
	});

	crawler.addFetchCondition(function(queueItem, referrerQueueItem, callback) {
		callback(null, queueItem.path.startsWith(path) && !parsedJson.urls.includes(queueItem.url));
	    //callback(null, queueItem.path.startsWith(path) || (queueItem.path.indexOf("-vs-") > -1 && queueItem.path.indexOf("/report/") > -1));
	});

	crawler.on("complete", function() {
	    console.log("Finished!");

	    // Deleting duplicates
	    // parsedJson.urls = uniqueArray(parsedJson.urls);

	    fs.writeFileSync("crawled_urls.json",JSON.stringify(parsedJson, null, 2));
	});

	process.on('SIGINT', function() {
	    console.log("Caught interrupt signal. Finished!");

	    // Deleting duplicates
	    // parsedJson.urls = uniqueArray(parsedJson.urls);

	    fs.writeFileSync("crawled_urls.json",JSON.stringify(parsedJson, null, 2));
	    process.exit();
	});

    // Start Crawl
    crawler.start();
};

if (process.argv.length < 3) {
    console.log("Usage: node savetodisk.js mysite.com");
    process.exit(1);
}

function uniqueArray(arrArg) {
    return arrArg.filter(function(elem, pos,arr) {
        return arr.indexOf(elem) == pos;
    });
};

downloadSite(process.argv[2], function() {
    console.log("Done!");
});