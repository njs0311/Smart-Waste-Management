const express = require('express')

const mqtt = require('mqtt')
const request = require('request')
const jwt = require('jsonwebtoken')
const fs = require('fs')

client = mqtt.connect('mqtt://192.168.0.106',1883,{
    "username":"roger",
    "password":"password"
})

const app = express();

app.use(express.static('./'))
app.use(express.json())
try{
    
    client.subscribe('ultrasonic',function(err){
    var date = new Date();
    if(err)
    throw err
    var maxDistanceWet = 32
    var maxDistanceDry = 34
    
    var ultrasonicThresholdDry = 70
    var ultrasonicThresholdWet = 50
    var WeightThreshold = 2
  
    
    client.on('message',function(topic,message){

        if(topic=='ultrasonic')
        {         
        const jsonDataUltrsonic = require('./input.json');
        
        ultrasonicSplit = message.toString().split('=')
        var checkForPressure = false
        if(ultrasonicSplit.length == 2)
        checkForPressure = false
        else
        checkForPressure = true
        
        if(checkForPressure == true){
            console.log('Wet Waste',parseInt(ultrasonicSplit[1].toString().trim().split('\n')[0].trim()))
            ultrasonicValue = ((maxDistanceWet - parseInt(ultrasonicSplit[1].toString().trim().split('\n')[0].trim()))/maxDistanceWet)*100
            trendData={}
            
            jsonDataUltrsonic['WetUltrasonic'] = ultrasonicValue
            trendData['DateAndTime'] = new Date().toISOString()
            trendData['WetBinLevel'] = jsonDataUltrsonic['WetUltrasonic']
            trendData['DryBinLevel'] = jsonDataUltrsonic['DryUltrasonic']

            jsonDataUltrsonic['BinTrend'].push(trendData)
            fs.writeFile('./input.json',JSON.stringify(jsonDataUltrsonic,null,2),function(){
                 
                if(ultrasonicValue>ultrasonicThresholdWet){
                    
                    if(parseInt(jsonDataUltrsonic['WetWeight'])>WeightThreshold){
                        request.get('https://api.telegram.org/bot1168212797:AAHryXRddSqbGilRO_iqIU8z7XqKAGk6iX8/sendMessage?chat_id=@WasteDetails&text=Wet+Waste+Exceeded+Limit+.+Empty+Bin')
                        client.subscribe('bin/threshold/input',function(err){
                            if(err)
                            res.sendStatus(403)
                            else{  
                            client.publish('bin/threshold/input','bin1Full',function(){
                                console.log('Message sent to PDDL for Bin 1')
                             })
                             
                        }
                        })
                    }
                }
             })
             
             
    }
    if(checkForPressure==false){
        console.log('Dry Waste',parseInt(ultrasonicSplit[1].toString().trim()))
        ultrasonicValue = ((maxDistanceDry - parseInt(ultrasonicSplit[1].toString().trim()))/maxDistanceDry)*100
        
        jsonDataUltrsonic['DryUltrasonic'] = ultrasonicValue

        trendData={}
        
            trendData['DateAndTime'] = new Date().toISOString()
            trendData['WetBinLevel'] = jsonDataUltrsonic['WetUltrasonic']
            trendData['DryBinLevel'] = jsonDataUltrsonic['DryUltrasonic']
        
        jsonDataUltrsonic['BinTrend'].push(trendData)
        
        fs.writeFile('./input.json',JSON.stringify(jsonDataUltrsonic,null,2),function(){
             if(ultrasonicValue>ultrasonicThresholdDry){
                request.get('https://api.telegram.org/bot1168212797:AAHryXRddSqbGilRO_iqIU8z7XqKAGk6iX8/sendMessage?chat_id=@WasteDetails&text=Dry+Waste+Exceeded+Limit+.+Empty+Bin')
                
                    client.subscribe('bin/threshold/input',function(err){
                        if(err)
                        res.sendStatus(403)
                        else{  
                        client.publish('bin/threshold/input','bin2Full',function(){
                            console.log('Message sent to PDDL for Bin 2')
                         })
                         
                    }
                    })
                    
             }
             
        })
    }
    
    if(checkForPressure==true){
        console.log('Weight',parseFloat(ultrasonicSplit[2].toString().trim()).toFixed(2) )
        ultrasonicValue = parseFloat(ultrasonicSplit[2].toString().trim()).toFixed(2)
        
        jsonDataUltrsonic['WetWeight'] = ultrasonicValue
        
        
        fs.writeFile('./input.json',JSON.stringify(jsonDataUltrsonic,null,2),function(){
             if(ultrasonicValue>WeightThreshold){
                
                if(parseInt(jsonDataUltrsonic['WetUltrasonic'])>ultrasonicThresholdWet){
                    request.get('https://api.telegram.org/bot1168212797:AAHryXRddSqbGilRO_iqIU8z7XqKAGk6iX8/sendMessage?chat_id=@WasteDetails&text=Wet+Waste+Limit+Exceeded+.+Empty+Bin')
                    client.subscribe('bin/threshold/input',function(err){
                        if(err)
                        res.sendStatus(403)
                        else{  
                        client.publish('bin/threshold/input','bin1Full',function(){
                            console.log('Message sent to PDDL for Bin 1')
                         })
                         
                    }
                    })
                }
                
            }
             
        })
    }
    
    }
    
    })
    
})


}
catch(e){

}

app.post('/UpdateLidStatus',(req,res)=>{
    if(req.body.BinNo=="Open-Bin1"){
        
        client.subscribe('BinOpen1',function(err){
            if(err)
            res.sendStatus(403)
            else{  
            client.publish('BinOpen1','Bin1',function(){
                
             })
            res.send('Success').status(200)
        }
        })
    }
    if(req.body.BinNo=="Open-Bin2"){
        
        client.subscribe('BinOpen2',function(err){
            if(err)
            res.sendStatus(403)
            else{
                
            client.publish('BinOpen2','Bin2',function(){
                
            })
            res.send('Success').status(200)
        }
        })
    }
    
    
    
})

app.post('/api/login',(req,res)=>{
    const user = require('./input.json')
        if(user.username!=req.body.username){
            res.status(404).json({
                error:'User not found'
            })
            
        }
        else{
            
            if(req.body.password!=user.password)
                {
                    
                res.status(403).json({
                    error:'Password Incorrect'
                })
            }  
            else{
                
            res.status(200).json({
                key:user.userkey
            })
            
            
                }
                
        
        }
        
})

function validateFunction(req,res,next){

    jwt.verify(req.query.userkey,'secretkey',function(err,authData){
        if(err){
            res.sendStatus(403)
        }
        else{
            next();
        }
    } )
    
}

app.get('/GraphPage',validateFunction,function(req,res,next){
    res.sendFile(__dirname+'/View/index.html')
})

app.get('/GetData',(req,res)=>{
    graphData = require('./input.json')
    
    res.json(graphData)
})

app.get('/',function(req,res){
    res.sendFile(__dirname+'/View/Login.html')
})



app.listen(process.env.PORT || 5000,function(){
    
    console.log('Listening')
})

