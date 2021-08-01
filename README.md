# DeepPhe-Viz-v2

This project contains two services:
1. in the api directory, the DeepPhe Webserver
2. in the client directory, the DeepPhe GUI Client.

# Running the Visualizer
## Configure Neo4j:
1. Run DeepPhe CLI and write the output database to {NEO4J_HOME_DIRECTORY}/data/databases/{DEEPPHE_CLI_DB_OUTPUT_DIRECTORY} 
e.g. /opt/neo4j-community-3.5.12/data/database/ontology.db
1. Copy in the dphe-neo4j-plugin-0.4.0.jar into the {NEO4J_HOME_DIRECTORY}/plugins
1. In {NEO4J_HOME_DIRECTORY}/conf/neo4j.conf file, set the entry dbms.active_database to {DEEPPHE_CLI_DB_OUTPUT_DIRECTORY}

e.g. "ontology.db"
1. From: {Neo4J Home Directory}/bin, run ./neo4j console
## Run the DeepPhe Webserver
1. Clone this repository {DEEPPHE_REPOS_FOLDER}
1. Change to the {DEEPPHE_REPOS_FOLDER}/api folder
1. run the command PORT=3001 /usr/local/bin/node bin/www /Users/johnlevander/dev/viz/api/app.js
## Run the DeepPhe GUI client
1. Change to the {DEEPPHE_REPOS_FOLDER}/client folder
1. run the command npm start
1. this should automatically take you to the interface
