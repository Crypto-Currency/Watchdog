// Import the discord.js module
const Discord = require('discord.js');
const mysql = require('mysql');
const config=require("./config.json");
const pool = require('./database');
const fs = require('fs');
// Create an instance of Discord that we will use to control the bot
const bot = new Discord.Client();

// Token for your bot, located in the Discord application console - https://discordapp.com/developers/applications/me/
const token =config.token;
const prefix =config.prefix;
const logpath="/home/spider/Discord-bot/Watchdog/";

const sqluser=config.sqluser;
const sqlpass=config.sqlpass;
const sqldatabase=config.sqldatabase;



var logname="message.log";
try
{ //  rotate the log - it rewites to the same file each time you restart
  if (fs.existsSync(logpath+logname))
  {  //file exists
    let dt=sysdate();
    fs.renameSync(logpath+logname, logpath+dt+logname);
  }
} catch(err) {
  console.log(logpath+logname+" file missing");
  console.log("error is ",err);
}

const logfile = fs.createWriteStream(logpath+logname);


///////////////////////////////////////////////////////////////////////
var done=0;

bot.on('error', console.error);

//***************************************************************************************  on ready
// Gets called when our bot is successfully logged in and connected
bot.on('ready', () =>
{
    console.log('Watchdog on duty.');
});


//***************************************************************************************  on guild member add
// Gets called when a new user joins our guild
bot.on("guildMemberAdd", async (member) =>
{
  var mess="New member\n";

  var gserver=member.guild.name;
mess=mess+"server = "+gserver;


  const guild = member.guild;
mess=mess+"\nguild = "+guild;

const born =member.user.createdAt;
mess=mess+"\ncreated "+born;

//const age= Date.now() - member.user.createdAt < 1000*60*60*24*10;
const age= Date.now() - born;

  var tDuration = getDuration(age);
console.log("duration "+tDuration.value + ': ' + tDuration.unit);

  mess=mess+"\nage = "+tDuration.value+" "+tDuration.unit;



  console.log(mess);
  logfile.write(mess);



  const channel = member.guild.channels.cache.find(channel => channel.name === "landing-pad")
  if (!channel) return;

  mess=`Welcome ${member} we hope you enjoy your stay here!`;
  mess=mess+"\n discord account created "+born+" about "+tDuration.value+" - "+tDuration.unit+" ago";

  const joinembed = new Discord.MessageEmbed()
    .setTitle(`A new member just arrived!`)
//  .setDescription(`Welcome ${member} we hope you enjoy your stay here!`)
    .setDescription(mess)
    .setColor("#FF0000")
  channel.send(joinembed);

//    channel.send(mess);


//  newUsers.set(member.id, member.user);

// just to keep it easier to follow
  var dbname=member.user.username;
  var dbusernumber=member.user.discriminator;
  var dbuserid=member.user.id;
  var dbborn=new Date(born).toISOString().slice(0, 19).replace('T', ' ');
  var dbage=tDuration.value;
  var dbguild=guild.id;
  var dbgserver=guild.name;

  ret=await updateUserBase(dbname,dbusernumber,dbuserid,dbborn,dbage,dbguild,dbgserver);

//console.log("ret from updateUserBase=",ret);

console.log("dbname       ",dbname);
console.log("dbusernumber ",dbusernumber);
console.log("dbuserid     ",dbuserid);
console.log("dbborn       ",dbborn);
console.log("dbage        ",dbage);
console.log("dbguild      ",dbguild);
console.log("dbgserver    ",dbgserver);


});

//*****************************************************************  get duration
function getDuration(milli){
  let minutes = Math.floor(milli / 60000);
  let hours = Math.round(minutes / 60);
  let days = Math.round(hours / 24);

  return (
    (days && {value: days, unit: 'days'}) ||
    (hours && {value: hours, unit: 'hours'}) ||
    {value: minutes, unit: 'minutes'}
  )
};

//*****************************************************************  update userbase
async function updateUserBase(dbname,dbusernumber,dbuserid,dbborn,dbage,dbguild,dbgserver)
{
  try
  {
    let result = await pool.query('insert into users(name,usernumber,userid,born,age,guild,gserver) VALUES (\''+dbname+'\',\''+dbusernumber+'\',\''+dbuserid+'\',\''+dbborn+'\',\''+dbage+'\',\''+dbguild+'\',\''+dbgserver+'\')');
//console.log("insert result=",result);
    return(result);
  }
  catch(err)
  {
    console.log('updateUserBase Error occurred', err);
  }

}


//console.log(tDuration.value + ': ' + tDuration.unit);

//***************************************************************************************  on message
// Event to listen to messages sent to the server where the bot is located
bot.on('message', message =>
{
  // So the bot doesn't reply to iteself
  if (message.author.bot) return;
  var type=message.channel.type;

//console.log("message type=",type);

//  user=message.author.username;
//  authorid=message.author.discriminator;
  if(message.channel.type=="dm")
    server="dm";
  else
    server=message.guild.name.toLowerCase();
  if(message.channel.type=="dm")
    guildid="dm";
  else
    guildid=message.guild.id;
  channelid=message.channel.id;

  done=0;
  report=0;

  const args = message.content.trim().split(/ /);
  const command = args[0].substring(1).toLowerCase();

  if (message.content.startsWith(prefix))
  {
    switch (command)
    {
      case "ping" :
        message.channel.send('Pong!');
        done=1;
        break;
      case "foo" :
        message.channel.send('bar.');
        done=1;
        break;
      case "marco" :
        message.channel.send('polo.');
        done=1;
        break;
    }
//    if(done==1)
//      message.channel.send(text);
  }
  else
  {
console.log("writing file");
  let mess=server+" - "+message.author.username+"  "+getDateTime()+"\n  "+message.content+"\n";
    logfile.write(mess);
console.log("The file was saved!");
    // Get the user's message excluding the `!`
    var text = message.content.substring(1);

// do nothing for now
  }

//*****************************************************************  spam filter
  var spam=0;
  spamtext="spammers will be removed.";
  mess=message.content.trim().toLowerCase();
  

//nice uniswap
//uni-claim.io
  if(mess.includes('myhmec'))
  {  //https://myhmec.com/index.php
    spam=1;
  }

  if((mess.includes('airdrop'))&&(mess.includes('uniswap')))
  {
    spam=1;
  }

  if((mess.includes('uni-airdrop'))&&(mess.includes('uniswap')))
  {
    spam=1;
  }

  if(mess.includes('second uniѕwap'))
  {
    spam=1;
  }

  if(mess.includes('axieinfinity.com'))
  {
    spam=1;
  }

  if(mess.includes('uniswap.org'))
  {
    spam=1;
  }

  if(mess.includes('uni-claim'))
  {
    spam=1;
  }

  if((mess.includes('airdrop'))&&(mess.includes('discord'))&&(mess.includes('nitro')))
  {
    spam=1;
  }

  if((mess.includes('airdrop'))&&(mess.includes(' collaborat')))
  {
    spam=1;
  }

  if(mess.includes('an exclusive air-drop event'))
  {
    spam=1;
  }

  if(mess.includes('who will catch this gift'))
  {
    spam=1;
  }

  if((mess.includes('discord'))&&(mess.includes('g6hxuemx')))
  {
    spam=1;
  }

  if(mess.includes('NakamigosCloaks'))
  {
    spam=1;
  }

  if(mess.includes('vercel.app'))
  {
    spam=1;
  }

  if(mess.includes('tesbz.com'))
  {
    spam=1;
  }

  if(mess.includes('servernux.com'))
  {
    spam=1;
  }

  if(mess.includes('claim-mav.network'))
  {
    spam=1;
  }

  if(mess.includes('emldn.com'))
  {
    spam=1;
  }

  if(mess.includes('linkybits.com'))
  {
    spam=1;
  }

  if(mess.includes('rpcthai.com'))
  {
    spam=1;
  }


   if((mess.includes('discord'))&&(mess.includes('Nd8t5UwGgK')))
  {
    spam=1;
  }


//*****************************************************************  ens spam filter
  var authorname=message.author.username;
  var authorid=message.author.discriminator;
  var uname=message.author.tag;
  var author=authorname+"#"+authorid;
  var guild=message.guild.name;
  var nick="not set";
  var uid=message.author.id;

//console.log("authorname ",authorname);
//console.log("authorid   ",authorid);
//console.log("uid   ",uid);
//console.log("uname      ",uname);
//console.log("guild      ",guild);


  if(message.member)
    if(message.member.nickname)
      nick=message.member.nickname;

//console.log("nickname   ",nick);

  var text=" this was posted in channel "+message.channel+", and made by "+author;
  text=text+"\ntag ="+uname;
  text=text+"\nguild= "+guild;
  text=text+"\nnickname= "+nick;
  //  message.channel.send(text);

  const list=message.guild.members.cache;
  var text2="";
  var user="";
  list.forEach(member =>
  {
    if(authorname == member.user.username)
    {
      if(!user)
        user=member.user.discriminator;
      text2=text2+"\nfound in logs:"+authorname+" : "+member.user.username+"#"+member.user.discriminator;
    }
  }    
)
  if(user != authorid)
  {
    message.channel.send("WOOF WOOF !!");
    message.channel.send(text);
    message.channel.send(text2);
  }
  if(nick && (authorname != nick))
  {
    // nick !=authorname
    user="";
    list.forEach(member =>
    {
      if(nick.toLowerCase() == member.user.username.toLowerCase())
      {
        if(!user)
          user=member.user.discriminator;
        text2="\nfound in logs:"+authorname+" : "+member.user.username+"#"+member.user.discriminator;
        report=1;
        if(member.user.discriminator == authorid)
          report=0;
      }
    })

    if(report)
    {
      message.channel.send("woof - user is using a nickname");
      message.channel.send(text);
      message.channel.send(text2);
    }
  }


//********************************************************************************************************  if spam
  if(spam==1)
  {
// temp disable ban
//    message.member.ban({reason: 'Spamming!',days: 7});


    var roles="";
    message.member.roles.cache.forEach(role =>
    {
      if(role.name != "\@everyone")
        roles=roles+role.name+"\n";
    });

    if(roles.length == 0)
    {
      mess=server+"** banned "+message.author.username+"  "+getDateTime()+"\n";
// temp message
//      mess=server+"** this user should be banned "+message.author.username+"  "+getDateTime()+"\n";
//      mess=mess+"roles "+roles;
//      mess=mess+" length "+roles.length;

// temp disable ban
      message.member.ban({reason: 'Spamming!',days: 7});

      logfile.write(mess);
      console.log(mess);
      message.channel.send(mess);
    }
  }

});

bot.login(token);

function getDateTime()
{
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

function sysdate()
{
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return month+day+year+"-"+hour+min+sec;

}


