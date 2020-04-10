const express = require('express');
const bodyParser = require('body-parser')
const redis = require('redis');

main();

function main() {
    // environment variable configuration
    const httpPort = process.env.HTTP_PORT || 3000;
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    // initiating app and redis client
    const app = express();
    const redisClient = redis.createClient({ host: redisHost, port: redisPort });
    // body-parser middleware
    app.use(bodyParser.urlencoded({ extended: false }));

    // route: new note
    app.get('/', (req, res) => {
        showNote(res, redisClient);
    });

    // route: show exiting note
    app.get('/:code', (req, res) => {
        showNote(res, redisClient, req.params.code);
    });

    // route: save
    app.post('/:code', (req, res) => {
        saveAndShowNote(res, redisClient, req.params.code, req.body.note);
    });

    // listen
    app.listen(httpPort, () => console.log(`Notepad run at http://localhost:${httpPort}`));
}

function saveAndShowNote(res, redisClient, code, note) {
    redisClient.set(`note_${code}`, note, (err) => {
        if (err) {
            console.error(err);
        }
        showNote(res, redisClient, code);
    })
}

function showNote(res, redisClient, code = null) {
    if (code === null) {
        code = Math.random().toString(36).substr(2, 5);
    }
    redisClient.get(`note_${code}`, (err, note) => {
        if (err) {
            console.error(err);
        }
        note = note || "";
        const html = `<form method="POST" action="/${code}" width="100%">
            <h1>${code}</h1>
            <textarea name="note" style="width:100%; height:500px;">${note}</textarea>
            <br />
            <button>Save</button>
        </form>`;
        res.send(html);
    });
}
