import paidUrlParamsConfig from './click_identifiers.json';
import searchEngineConfig from './search_engines.json';

console.log(paidUrlParamsConfig);

export function rawData() {

  // this bit strips the protocol away from referrer, since psl doesn't want that
  const referrer = document.referrer;
  // get only the top level domain of referrer
  const referringDomain = getDomain_(referrer);
  // get url parameters
  const urlParams = new URLSearchParams(window.location.search);
  // then turn them into an object with key: value pairs
  const urlParamsObject = Object.fromEntries(urlParams);
  // gets only utm tags from url parameters
  const utmTags = getUtmTags(urlParamsObject);
  // checks for click identifiers in url parameters, and if present, results in cpc/cpm
  const paidUrlData = getPaidUrlData(urlParamsObject, paidUrlParamsConfig);
  // checks referring domain for common search engines, and when found, results in organic
  const searchEngineData = getSearchEngineData(referringDomain, urlParamsObject, searchEngineConfig);
  // set referring domain if present
  const referralData = referringDomain == null ? null : { medium: "referral", source: referringDomain };
  

  return {
    'this_hostname': document.location.origin || "localhost",
    'this_domain': getDomain_(document.location.origin) || "localhost",
    'referring_hostname': referrer || null,
    'referring_domain': referringDomain,
    'query_string': window.location.search,
    'utm_tags': utmTags,
    "url_params": Object.keys(urlParamsObject).length > 0 ? urlParamsObject : null,
    "paid_url_data": paidUrlData,
    "organic_search_data": searchEngineData,
    "referral_data": referralData
  }

}

interface urlParamsObjectInterface {
  [key: string]: string
}

/*
checks the url parameters for utm tags.
returns set tags.
if no utm tags are set, returns null.
*/

function getUtmTags(urlParamsObject: urlParamsObjectInterface) : any {
  const utmTagMap: {[key: string] : string} = {
    utm_source: "source",
    utm_medium: "medium",
    utm_campaign: "campaign",
    utm_content: "content",
    utm_term: "term"
  }

  // an empty object to store found utm tags
  let utmTagResults: {[key: string] : string}  = {};

  // iterate all url parameters, check if they are utm tags, and save in results if they are
  for (const key in urlParamsObject) {
    if (utmTagMap.hasOwnProperty(key)) {
      utmTagResults[utmTagMap[key]] = urlParamsObject[key];
    }
  }

  // return found UTM tags, or null if empty
  if (Object.keys(utmTagResults).length > 0)
    return utmTagResults;
  else
    return null;
}

interface searchEngineConfigInterface {
  [key: string]: {
    p?: string,
    n: string,
    regex?: boolean
  }
}

/*
Checks referring domain for common search engines.
If a search query parameter is also passed, the value is used in 'term'
*/

function getSearchEngineData(referringDomain: string, urlParamsObject: urlParamsObjectInterface, searchEngineConfig: searchEngineConfigInterface): any {

  if (referringDomain == null) return null;

  if (searchEngineConfig.hasOwnProperty(referringDomain)) {
    let returnData : {[k: string]: string} = {
      'source': searchEngineConfig[referringDomain]['n'],
      'medium': "organic"
    }
    const search_p = searchEngineConfig[referringDomain]['p'];

    if ( urlParamsObject.hasOwnProperty( search_p ) )
      returnData['term'] = urlParamsObject[search_p];

    return returnData;
  } 

  // This bit takes only those searchEngineConfigs where regex == true
  // if referring domain isn't otherwise found, we will match against regex, but only then
  const filteredSearchEngineConfig = Object.keys(searchEngineConfig).reduce(function(r:searchEngineConfigInterface ,e: string) {
    if (searchEngineConfig[e]['regex'])
      r[e] = searchEngineConfig[e];
    return r;
  }, {});

  for (const key in filteredSearchEngineConfig) {
    if (referringDomain.match(key) != null) {
      console.log("you are here");
      return {
        'source': searchEngineConfig[key]["n"],
        'medium': "organic"
      }
    }
  }

  return null;
}

interface paidUrlParamsInterface {
  [key: string]: {
    source: string,
    medium: string
  }
}


/*
 * Check the URL parameters for known click ID's. 
 * If found, return the source and cpc/cpm
 */

function getPaidUrlData(urlParamsObject: urlParamsObjectInterface, paidUrlParamsConfig: paidUrlParamsInterface): Object {

  // Return first Click Id config found. There should never be more than one anyway.
  for (const key in urlParamsObject) {
    if (paidUrlParamsConfig.hasOwnProperty(key)) {
      return paidUrlParamsConfig[key];
    }
  }
  // If no Click Id is found, return an empty array
  return null;
}

export function get() {

  const trafficData = rawData();

  // Are UTM tags present?
  return  trafficData.utm_tags ||
    // or is the traffic paid?
    trafficData.paid_url_data ||
    // is it an organic search engine traffic?
    trafficData.organic_search_data ||
    // or is it a referral?
    trafficData.referral_data ||
    // if not, it's direct
    {
      'source': '(direct)',
      'medium': '(none)',
      'campaign': '(not set)'
    };  
}


function getDomain_(url: string) {

  if (!url) return;

  var a = document.createElement('a');
  a.href = url;

  //

  try {

    return a.hostname.match(/[^.]*(\.[^.]{2,4}(?:\.[^.]{2,3})?$|\.[^.]{2,8}$)/)[0];

  } catch(squelch) {}

}