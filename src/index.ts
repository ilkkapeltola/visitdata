import paidUrlParamsConfig from './click_identifiers.json';
import searchEngineConfig from './search_engines.json';
// second-level-domains that will be treated as exceptions
import exceptionSLDs from './exception_slds.json';

interface visitDataInterface {
  [key: string]: string;
}

function toBase64(str: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(str).toString('base64')
  } else {
    return window.btoa(str);
  }
}

function fromBase64(str: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(str, 'base64').toString('utf-8')
  } else {
    return window.atob(str);
  }
}

export function rawData() {

  const cachedData = sessionStorage.getItem('_vdjs_raw')
  if (cachedData && options.cache) return JSON.parse(fromBase64(cachedData));

  // this bit strips the protocol away from referrer, since psl doesn't want that
  const referrer: string = document.referrer;
  // get only the top level domain of referrer
  const referringDomain = getDomain_(referrer, exceptionSLDs);
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
  const referralData = referringDomain == null ? null : { medium: "referral", source: referringDomain } as visitDataInterface;
  

  const newData = {
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

  sessionStorage.setItem('_vdjs_raw', toBase64(JSON.stringify(newData)));
  return newData

}

interface urlParamsObjectInterface {
  [key: string]: string
}

interface urlParameterMapInterface {
  [key: string]: string
}

interface optionsInterface {
  utmTagMap: urlParameterMapInterface,
  cache: boolean
}

let options = {
  urlTagMap: {
    utm_source: "source",
    utm_medium: "medium",
    utm_campaign: "campaign",
    utm_content: "content",
    utm_term: "term"
  } as urlParameterMapInterface,
  cache: true
}

export function setOption(key: string, value: any) {
  if (key == "url_parameters") {
    options.urlTagMap = value;
  } else if (key == "cache") {
    options.cache = value;
  }
}

/*
checks the url parameters for utm tags.
returns set tags.
if no utm tags are set, returns null.
*/

function getUtmTags(urlParamsObject: urlParamsObjectInterface) : visitDataInterface {
  const urlTagMap = options.urlTagMap;

  // an empty object to store found utm tags
  let utmTagResults: visitDataInterface  = {};

  // iterate all url parameters, check if they are utm tags, and save in results if they are
  for (const key in urlParamsObject) {
    if (urlTagMap.hasOwnProperty(key)) {
      utmTagResults[urlTagMap[key]] = urlParamsObject[key];
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

function getSearchEngineData(referringDomain: string, urlParamsObject: urlParamsObjectInterface, searchEngineConfig: searchEngineConfigInterface): visitDataInterface {

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

function getPaidUrlData(urlParamsObject: urlParamsObjectInterface, paidUrlParamsConfig: paidUrlParamsInterface): visitDataInterface {

  // Return first Click Id config found. There should never be more than one anyway.
  for (const key in urlParamsObject) {
    if (paidUrlParamsConfig.hasOwnProperty(key)) {
      return paidUrlParamsConfig[key];
    }
  }
  // If no Click Id is found, return an empty array
  return null;
}

export function get(): visitDataInterface {

  const trafficData = rawData();

  // Are UTM tags present?
  return  trafficData.utm_tags as visitDataInterface ||
    // or is the traffic paid?
    trafficData.paid_url_data as visitDataInterface ||
    // is it an organic search engine traffic?
    trafficData.organic_search_data as visitDataInterface ||
    // or is it a referral?
    trafficData.referral_data as visitDataInterface ||
    // if not, it's direct
    {
      'source': '(direct)',
      'medium': '(none)',
      'campaign': '(not set)'
    } as visitDataInterface;
}

/**
 * A function that returns the domain name without subdomain.
 * While the function isn't perfect, it tries to account for common two-part top-level-domains 
 * in such a fashion that if the second-level-domain is part of a pre-defined list and the
 * full hostname has at least two dots, the function returns the join of the last three
 * parts. In all other cases, the function returns the last two parts of the hostname.
 *  
 * @param {string} url - the url in question
 * @param {ex_SDLs} exceptionSLDs - the JSON list of second-level-domain exceptions
 * @returns {string} the domain name without subdomain
*/
function getDomain_(url: string, ex_SDLs: string[] = exceptionSLDs): string | null {
  // if URL is null, return null
  if (url === null) return null;
  // if URL doesn't have http in the beginning, add https
  
  const getProtocol = () => window.location.protocol || 'https:';

  url = (url.substring(0,4) == 'http' ? url : getProtocol() + '//' + url);
  
  try {
    const domain = new URL(url).hostname;
    const sldSet = new Set(ex_SDLs);
    const domainParts = domain.split('.');

    if (
      sldSet.has(domainParts.slice(-2,-1)[0]) && domainParts.length >= 3
    ) {
      return domainParts.slice(-3).join('.');
    }
    return domainParts.slice(-2).join('.');

  } catch (error) {
    return null;
  }
}

export const exportedForTesting = {
  getDomain_
}
