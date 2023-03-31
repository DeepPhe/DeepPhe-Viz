const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);


// #! /usr/bin/env node
// const handler = require("serve-handler");
// const http = require("http");
//
// const port = parseInt(process.env.PORT || "3000", 10);
//
// const server = http.createServer((request, response) => {
//     return handler(request, response, {
//         public: "build",
//         "symlinks": true,
//
//
//         rewrites: [
//             { "source": "/proctor/:file", "destination": "/:file" },
//         ],
//     });
// });
//
//
// server.listen(port, () => {
//     console.log(`Running at http://localhost:${port}`);
// });