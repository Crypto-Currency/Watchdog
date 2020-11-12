// Import the discord.js module
const Discord = require('discord.js');
const config=require("./config.json");
const fs = require('fs');
// Create an instance of Discord that we will use to control the bot
const bot = new Discord.Client();

// Token for your bot, located in the Discord application console - https://discordapp.com/developers/applications/me/
const token =config.token;
const prefix =config.prefix;
const logpath="/home/spider/Discord-bot/Watchdog/";
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

// Gets called when our bot is successfully logged in and connected
bot.on('ready', () =>
{
    console.log('Watchdog on duty.');
});

// Event to listen to messages sent to the server where the bot is located
bot.on('message', message =>
{
  // So the bot doesn't reply to iteself
  if (message.author.bot) return;
  var type=message.channel.type;

console.log("message type=",type);
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
  
  if((mess.includes('uni-airdrop'))&&(mess.includes('uniswap')))
  {
    spam=1;
  }
  if(mess.includes('uniswap airdrop'))
  {
    spam=1;
  }

  var authorname=message.author.username;
  var authorid=message.author.discriminator;
  var uname=message.author.tag;
  var author=authorname+"#"+authorid;
  var guild=message.guild.name;
  var nick="not set";
  var uid=message.author.id;

console.log("authorname ",authorname);
console.log("authorid   ",authorid);
console.log("uid   ",uid);
console.log("uname      ",uname);
console.log("guild      ",guild);


  if(message.member)
    if(message.member.nickname)
      nick=message.member.nickname;

console.log("nickname   ",nick);

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

  if(spam==1)
  {
    message.channel.send(spamtext+"\n user id "+uid);
//      message.channel.send(text);
//      message.channel.send(text2);
    message.member.ban({reason: 'Spamming!',days: 7});
//    message.delete();
    mess=server+"** banned "+message.author.username+"  "+getDateTime()+"\n";
    logfile.write(mess);
    console.log(mess);
    message.channel.send(mess);
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


