'use strict';
require("dotenv").config();
const express=require("express");
const app=express();
const PORT=process.env.PORT;
const superagent=require("superagent");
const pg=require("pg");
app.set("view engine","ejs");
const client=new pg.Client(process.env.DATABASE_URL);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.get("/home",(req,res)=>{
    res.redirect("/");
})
app.post('/search',(req,res)=>{
    console.log("hello");
    let {search}=req.body;
    var url=`https://api.deezer.com/search/track?q=${search}`;
    superagent.get(url)
    .then(musicsearch=>{
        let musicsearcharr=musicsearch.body.data;
        let musicrsearchresult=musicsearcharr.map(value=>{
            let songobject=new Music(value);
            return songobject;
        })
        res.render("search",{songs:musicrsearchresult});
    })
})
app.get("/",(req,res)=>{
    let top=[];
    let genra=[];
    let events=[];
    var url='https://api.deezer.com/chart&position';
    var url2='https://api.deezer.com/genre';
    let key="wBCydd6j60LXZ473CnTJWLW9ofDVm4Xw";
    var url3=`https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&dmaId=324&apikey=${key}`
    superagent.get(url)
    .then(music=>{
        let musicarr=music.body.tracks.data;
        let musicresult=musicarr.map(musicdata=>{
            console.log(musicdata);
            let song=new Music(musicdata);
            top.push(song);
        });
        return top;

    })
    superagent.get(url2).then((dataOfcatagory) => {
       let result= dataOfcatagory.body.data.map((val) => {
            var musicData = new Catagory(val);
            genra.push(musicData);
            return genra;
        });
    });
    superagent.get(url3)
    .then(event=>{
        let concertarr=event.body._embedded.events;
        let eventresult=concertarr.map(eventdata=>{
            console.log(eventdata);
            let event=new Event(eventdata);
            events.push(event);
            return events;
        });
        res.render('home', {music: top,Catagory:genra,concert:events });

    });
    
})


client.connect()
.then(app.listen(PORT,()=>{
    console.log(`port is running at port${PORT} `);
}))
app.use("*",(req,res)=>{
    res.status(404).send("page not found");
})
app.use(Error,(req,res)=>{
    res.status(500).send(Error);
})

function Music(song)
{
this.title=song.title;
this.music=song.preview;
this.image=song.album.cover_medium;
this.artist=song.artist.name
}
function Catagory(type)
{
this.genra=type.name;
this.image=type.picture;
}
function Event(event)
{
this.event=event.name;
this.start=event.sales.public.startDateTime;
 this.country=event._embedded.venues[0].state.name
// this.state=event.venues.state.name
}