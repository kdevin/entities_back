if lsof -Pi :2222 -sTCP:LISTEN -t > /dev/null ; then
	echo "Server is running!"
else
	gnome-terminal --window-with-profile=Hold -x java -Xms10G -jar ~/Documents/DBpedia/dbpedia-spotlight-1.0.0.jar ~/Documents/DBpedia/en_2+2/ http://localhost:2222/rest
	echo "Server loading..."
	sleep 40
	echo "Server launched!"
fi

node index.js