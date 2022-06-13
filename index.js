import { Router } from 'itty-router'
import Database from './db'
import { rawJsonResponse, readRequestBody, checkIfSubscriptionExists } from './utils'

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
})

/*
  catches all other routes
*/
router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
