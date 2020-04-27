const express=require('express');
const ejs=require('ejs');
const bodyParser =require('body-parser');
const socketio=require('socket.io');
const Nexmo=require('nexmo');
const path=require('path');

//init app
const app=express();


//Template engine setup
app.set('view engine','html');
app.engine('html',ejs.renderFile);

//static folder
app.use(express.static(path.join(__dirname,'static')));

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Init nexmo
const nexmo=new Nexmo({
    apiKey:'881fa093',
    apiSecret:'QhzU1uwPbC1XxSSU'
},{debug:true})

//define port
const port=process.env.port || 2000;


//Index route
app.get('/',(req,res)=>{
    res.render('index');
})

//fetch the data after submisson
app.post('/',(req,res)=>{
    res.send(req.body);
    console.log(req.body);
    const number=req.body.number;
    const text=req.body.text;

    nexmo.message.sendSms(
        'Vonage SMS API',number,text,{type:'unicode'},
        (err,responseData)=>{
            if(err) 
            console.log(err);
            else
            {
                console.dir(responseData);
                //get data from response
                const data={
                    number:responseData.messages[0]['to']
                }

                //emit to the client
                io.emit('smsStatus',data);

            }
        }
    )
})

//start server
const server=app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
})

//connect with socket
const io=socketio(server);
io.on('connection',(socket)=>{
    console.log('connected');
    io.on('disconnect',()=>{
        console.log("Disocnnected");
    })
})