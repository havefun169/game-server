import express, { Express, Request, Response } from 'express';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import { Midi } from '@tonejs/midi';
import { ExpressPeerServer } from 'peer';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());

app.get("/midi/:name", (req: Request, res: Response) => {
    const buffer = readFileSync(`./${req.params.name}.mid`);
    const midi = new Midi(buffer);

    res.json(midi);

});

const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

const customGenerationFunction = () =>
	(Math.random().toString(36) + "0000000000000000000").substring(2, 6);

const peerServer = ExpressPeerServer(server, {
    path: '/',
    generateClientId: customGenerationFunction
});

peerServer.on('connection', (client) => {
    console.log("Server connection: ", client.getId())
    client.getSocket()!.on("join-room", (username) => {
        console.log("Join room: ", username);
    })
});

peerServer.on('disconnect', (client) => { console.log("Server disconnection: ", client.getId()) });

app.use('/p2p', peerServer);