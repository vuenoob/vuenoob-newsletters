import { Router } from 'itty-router'
import Database from './db'
import { rawJsonResponse, readRequestBody, checkIfSubscriptionExists, getSubscriberOfSite, handlePreflightRequests } from './utils'

// Create a new router
const router = Router()

// Create a new Database instance
const db = new Database(FAUNA_SECRET);

/*
Our index route, a simple hello world.
*/
router.get("/", () => {
  return new Response("Vuenoob Newsletters.");
})

/*
  Subscribe email to newsletter
*/
router.post("/subscribe", async request => {
  let { email } = await readRequestBody(request);

  if(!email) return rawJsonResponse({status: 'error', message: 'Email is required'});

  // taking into account that an email may already be subscribed to the site
  // collect all subscribers with provided email 
  let { status: subscribersStatus, data: subscribers } = await db.findAll(SUBSCRIBERS_BY_MAIL, email);

  if(subscribersStatus !== "success") throw `Issue occured while executing db.findAll() Stack: ${JSON.stringify(subscribers)}`;

  // check if provided email is subscribed to the site
  if(subscribers.length && checkIfSubscriptionExists(subscribers, email, SITE)) return rawJsonResponse({status: "success", message: "Subscribed"});

  let {status, data} = await db.add(SUBSCRIPTIONS_COLLECTION, {
    email,
    site: SITE,
    createdAt: Date.now()
  });

  if(status !== "success") return rawJsonResponse({status, message: data.description});

  return rawJsonResponse({status, message: "Subscribed"});
})

/*
  Unsubscribe email from newsletter
*/
router.post("/unsubscribe", async request => {
  let { email } = await readRequestBody(request);

  if(!email) return rawJsonResponse({status: 'error', message: 'Email is required'});

  // taking into account that one email may be subscribed to more than one site
  // get all subscribers with such email
  let { status: subscribersStatus, data: subscribers } = await db.findAll(SUBSCRIBERS_BY_MAIL, email);

  if(subscribersStatus !== "success") throw `Issue occured while executing db.findAll() Stack: ${JSON.stringify(subscribers)}`;

  if(!subscribers.length) return rawJsonResponse({status: 'success', message: 'Unsubscribed'});

  // get subscriber that is subscribed to the site
  let {refId} = getSubscriberOfSite(subscribers, SITE);

  if(!refId) return rawJsonResponse({status: 'success', message: 'Unsubscribed'});

  let {status, data} = await db.delete(SUBSCRIPTIONS_COLLECTION, refId);

  if(status !== "success") return rawJsonResponse({status: 'error', message: 'Failed to unsubscribe'});

  return rawJsonResponse({status: "success", message: "Unsubscribed"});
})

/*
  sends newsletters to subscribers
*/
router.post("/send-newsletters", async () => {
})

/*
  catches all other routes
*/
router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
    const request = e.request;
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    // Handle CORS preflight requests
    e.respondWith(handlePreflightRequests(request));
  } else if (request.method === 'POST') {
    // Handle API requests
    e.respondWith(router.handle(e.request))
  } else {
    e.respondWith(
      new Response(null, {
        status: 405,
        statusText: 'Method Not Allowed',
      })
    );
  }
})
