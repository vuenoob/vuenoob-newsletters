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

/** ranks items per the queries provided
 * @param {Array} items
 * @param {Array} queries
 * @returns {Array}
 */
export function rankItemsByQueries(items, queries) {
  let rank = [];
  items.map(item => item.data).forEach(item => {
    let score = 0;
    queries.forEach(query => {
      score += item.title.toLowerCase().includes(query) ? (query.includes('javascript') ? 0.5 : 1) : 0;
    })
    rank.push({score, item})
  })
  let ranked = rank.sort((a, b) => b.score - a.score)
  return ranked.map(item => item.item)
}