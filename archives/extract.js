const cheerio = require('cheerio'),
	fs = require('fs'),
	path = require('path');

extractHtml();

function extractHtml(htmlpath, jsonpath){
	var htmlpath = './download/',
		jsonpath = './json/';

	fs.readdir(htmlpath, (err, files) => {
	  files.forEach(file => {
	  	var htmlFile = htmlpath+file;
		var jsonFile = jsonpath+path.basename(file, '.html')+".json";

		if(!fs.existsSync(jsonFile)){
			console.log("Creating the JSON file for "+file+"...");
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
		        if (err) console.log("ERROR when writing the file.");
		        else console.log("JSON file created.");
		    });
		}
	  });
	});

	console.log("Extraction done.");
}



