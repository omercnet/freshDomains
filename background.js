var whoisCache = {}
var config = {}

chrome.storage.sync.get({
  whoisCache: {},
  config: {minCreatedDays: 365, maxCacheDays: 30},
}, function(storage) { 
  whoisCache = storage.whoisCache
  config = storage.config
})

function install_notice() {
    if (localStorage.getItem('install_time'))
        return;

    var now = new Date().getTime();
    localStorage.setItem('install_time', now);
    chrome.tabs.create({url: "options.html"});
}
install_notice();


function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function daysDiff(date1, date2) {
  return Math.floor((date1 - date2) / (1000*60*60*24))
}

function getWhois(domain) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "http://whois.apitruck.com/"+extractDomain(domain), false);
  xhr.send();

  var result = JSON.parse(xhr.responseText);
  whoisCache[domain] = {
    whoisData: result,
    lastCheck: new Date(),
  }
  chrome.storage.sync.set({whoisCache: whoisCache}, function() { console.log("Updated storage.") })
  chrome.storage.sync.get({whoisCache: {}}, function(storage) { whoisCache = storage.whoisCache; })
}

chrome.webNavigation.onCompleted.addListener(function (data) {
 today= new Date()
  domain = extractDomain(data.url)
  if (!(domain in whoisCache)) {
    getWhois(domain)
  } else {
    lastCheck = new Date(whoisCache[domain]['lastCheck'])
    if (daysDiff(today, lastCheck) > config.maxCacheDays) {
      console.log('Old data, refreshing')
      getWhois(domain)
    }
  }
  domainCreated = new Date(whoisCache[domain].whoisData.response.created)
  console.log(domain + ' created: ' + domainCreated + ' (' + daysDiff(today, domainCreated) + ' days ago)')
  if (daysDiff(today, domainCreated) < config.minCreatedDays) {
    console.log('SH!T THIS DOMAIN IS NEW!!\nCreated: ' + domainCreated)
    alert('SH!T THIS DOMAIN IS NEW!!\nCreated: ' + domainCreated)
  }
});