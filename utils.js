/** rawJsonResponse takes data and returns a json Response
 * into the worker script
 * @param {Object} data the incoming data to return in JSON
 */
export function rawJsonResponse(data) {
  const init = {
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_DOMAINS
    },
  };
  return new Response(JSON.stringify(data, null, 2), init);
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
export async function readRequestBody(request) {
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await request.json();
  } else if (contentType.includes('form')) {
    const formData = await request.formData();
    let body = {};
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    return body;
  } else {
    return null;
  }
}

export function checkIfSubscriptionExists(subscribers, email, site){
  const subscriptionExists = ({data: subscriber}) => subscriber.site === site && subscriber.email === email;

  return subscribers.findIndex(subscriptionExists) !== -1;
}

export function getSubscriberOfSite(subscribers, site){
  const siteSubscriber = ({data: subscriber}) => subscriber.site === site;

  let index = subscribers.findIndex(siteSubscriber);

  if(index === -1) return false;

  return subscribers[index];
}

// Response headers to to OPTIONS requests.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export function handlePreflightRequests(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  } else {
    // Handle standard OPTIONS request. 
    // And allow other HTTP Methods
    return new Response(null, {
      headers: {
        Allow: 'HEAD, POST, OPTIONS',
      },
    });
  }
}
