import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import {fileURLToPath} from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server)
const client = new MongoClient("mongodb+srv://lorddesert:btB6cpBVDRqQPWK@sesion-del-locro.pns3b.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
let collection = null

async function main(){
  try {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  
  
    // Connect to the MongoDB cluster
      const messages = []
      await client.connect();

      collection = client.db("sdl").collection("messages")
      const options = {
        // sort returned documents in ascending order by title (A->Z)
        sort: { date: 1 },
    
      };

      const cursor = collection.find({}, options)

      await cursor.forEach(item => messages.push(item))



      // const res = await collection.insertOne({content: "HAADIOGNAIOD"})

      // Make the appropriate DB calls
      await  listDatabases(client);
      
      app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
      });
      
      io.on('connection', (socket) => {
        console.log(messages.length)
        
        socket.on('chat message', msg => {
          console.log(`message: ${msg.content}`)
          msg.date = new Date()
          collection.insertOne(msg)
          .then(res => {
            console.log("Ga sudi enviado, ", res)
          })
          
          
          io.emit('chat message', msg)
        })
      
        socket.on('user connection', username => {
          io.emit('fetch messages', messages)
          console.log('user ' + username + ' connected')
        })
        
        socket.on('disconnect', () => {
          console.log('user dissapeared!')
        })
      
      })
  } catch (e) {
      console.error(e);
  }
}

async function listDatabases(client){
  const databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};


main().catch(console.error);




server.listen(3000, () => {
  console.log('listening on *:3000')
})
