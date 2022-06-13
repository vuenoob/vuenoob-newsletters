/** rawJsonResponse takes data and returns a json Response
 * into the worker script
 * @param {Object} data the incoming data to return in JSON
 */
export function rawJsonResponse(data) {
  const init = {
    headers: {
      'content-type': 'application/json',
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
