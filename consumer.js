const fetch = require('node-fetch');
const amqp = require('amqplib/callback_api');
require('dotenv').config();

const AMQP_CONN_URL = process.env.AMQP_URL;

let amqpChannel = null;
amqp.connect(AMQP_CONN_URL, function (connectionErr, connection) {
  if(connectionErr){
    throw connectionErr;
  }
  connection.createChannel(function (channelErr, channel) {
    if(channelErr){
      throw channelErr;
    }
     amqpChannel = channel;
     amqpChannel.consume('test',(msg)=>{
        console.log('Message received: '+msg.content.toString());
        const body = {
            desc: msg.content.toString()
        };
        fetch('http://localhost:3000/api/todos', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json'
            }
        }).then(resp => resp.json())
          .then(json => {
            console.log(json);
          });
    },{
        noAck: true
    });
  });
});
