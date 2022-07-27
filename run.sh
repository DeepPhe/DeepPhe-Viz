#!/usr/bin/env bash

echo "Starting DeepPhe Webservice API..."
(export PORT=3001 && cd DeepPhe-Viz/api && npm start > ../../logs/webservice-api-run.log 2>&1 &)
rc=$?
if [ $rc -ne 0 ] ; then
  echo "Error: [$rc] when starting DeepPhe Webservice API, see /logs/webservice-api-run.log for details."
  exit $rc
else
  echo "...Success!"
fi

#unset the HOST environment variable for local installations
unset HOST

echo "Starting DeepPhe Visualizer...(Press CTRL-C to terminate)"
(cd DeepPhe-Viz/client && npm start > ../../logs/visualizer-run.log 2>&1 )