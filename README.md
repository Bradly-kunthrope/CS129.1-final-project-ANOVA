# CS129.1-final-project-ANOVA
A. HOW TO LOAD THE DATASET
	1. Create a folder named “mongo”
	2. Go to this working folder, and place the dataset “LoanStats3d” inside.
	3. Open the command line or Windows Powershell
	4. Enter the command: “cd <insert directory here>” (e.g. cd .\Desktop\mongodb_replication\ )
	5. Enter the command: “ mongoimport --host localhost --db book --collection anova --type csv --headerline --file .\LoanStats3d.csv ”. This will load the  dataset into your book database.

B. HOW TO SETUP THE REPLICATE SETS
	1. In your working folder, create 3 folders. Name them  “mongo1”, “mongo2”, and “mongo3.”
	2. Open a new command line or Windows Powershell.
	3. For each desired node, one command line must be dedicated. In this case, 3 nodes with 3 different ports are needed. Meaning, 3 command lines 			must be opened. These 3 commands will be used per node/command line:
		a. Node 1: & “ C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe" --replSet book --dbpath mongo1 --port 27017 ”
		b. Node 2: & “ C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe" --replSet book --dbpath mongo2 --port 27018 ”
		c. Node 3: & “ C:\Program Files\MongoDB\Server\3.6\bin\mongod.exe" --replSet book --dbpath mongo3 --port 27019 ”
	4. Open another (4th) command line/console, and then log-in to the book database using the 1st node. Run this command: “ mongo localhost:27017/book ”
	5. Once logged-in, copy and paste this code into your running command line:

		var cfg = {
			"_id": "book",
			"version": 1,
			"members": [
				{
					"_id": 0,
					"host": "localhost:27017",
					"priority": 1
				},
				{
					"_id": 1,
					"host": "localhost:27018",
					"priority": 0
				},
				{
					"_id": 2,
					"host": "localhost:27019",
					"priority": 0
				}
			]
		}


	6. You have now performed replication with your mongodb.

C. HOW TO EXECUTE THE MAPREDUCE FUNCTIONS
	1. Run the following commands:
		db.anova.find({"loan_status": ""});
		
		db.anova.remove({"loan_status": null});  //This removes the extra classification for loan_status

		db.anova.distinct('loan_status') //This checks if there are no more empty classifications

		db.anova.update(
		   {},
		   { $unset: {'id':1}},
		   false, true
		 )
		 	// This removes the empty columns

		db.anova.update(
		   {},
		   { $unset: {'member_id':1}},
		   false, true
		 ) 
		 	// This removes another set of empty columns


D. HOW TO SHARD THE MAPREDUCE FUNCTION
	1. To shard, first kill start all servers with the --shardsvr parameter with the following commands:
        a. “ mongod --shardsvr --port 27017 --dbpath C:\data\db_proj1 ”
        b. “ mongod --shardsvr --port 27018 --dbpath C:\data\db_proj2 ”

    2. Start a config server. The config server must be a replicate set. Run the following commands:
    	a. “ mongod --configsvr --replSet contempo_config --port 27019 --dbpath C:\data\db_proj_config ”
    	b. “ mongo --host localhost:27019 ”
    	c. “ 
				    rs.initiate({
				    	"_id": "contempo_config",
				    		"version": 1,
				    		"configsvr": true,
				    		"members": [
				        {
				            "_id": 0,
				            "host": "localhost:27019",
				            "priority": 1
				       	 	}
				    	]
					});
    		”
    3. Start a router server, and point it to the config server.
    	a. “ mongos --configdb contempo_config/localhost:27019 --port 27020 ”

    4. Log-in to the router server.
    	a. “ mongo --host localhost:2720 ”

   	5. Add the two shard servers as shards of the collection.
		a. “ sh.addShard("localhost:27017"); ”
		b. “ sh.addShard("localhost:27018"); ”