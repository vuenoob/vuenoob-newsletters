import { Router } from 'itty-router'
import Database from './db'
import { rawJsonResponse, readRequestBody, rankItemsByQueries } from './utils'

// Create a new router
const router = Router()

// Create a new Database instance
const db = new Database(FAUNA_SECRET);

/*
Our index route, a simple hello world.
*/
router.get("/", () => {
  return new Response("Hello, there! Welcome to affman.")
})

/*
  Adds a new affiliate program
*/
router.post("/add-program", async request => {
  let {name, trackingId} = await readRequestBody(request);

  if(!name || !trackingId) return rawJsonResponse({status: 'error', message: 'Missing inputs'})

  let {status, data} = await db.add('programs', {name, trackingId});

  if(status !== "success") return rawJsonResponse({status, message: data})

  return rawJsonResponse({status: "success", message: "Affiliate Program Added"});
})

/*
  Adds a new affiliate program item
*/
router.post("/add-item", async request => {
  let {title, linkId, uniqueItemId, itemUrl, programRefId} = await readRequestBody(request);
  let analytics = {
    clicks: 0,
    impressions: 0
  }

  if(!title || !linkId || !uniqueItemId || !itemUrl || !programRefId) return rawJsonResponse({status: 'error', message: 'Missing inputs'})

  let {status, data} = await db.add('items', {title, linkId, uniqueItemId, itemUrl, programRefId, ...analytics});

  if(status !== "success") return rawJsonResponse({status, message: data.description})

  return rawJsonResponse({status: "success", message: "Affiliate Program Added"});
})

/*
  Fetches all affiliate programs
*/
router.get("/get-all-programs", async () => {
  // get all program items
  let {status, data} = await db.getAll('all_programs')

  if(status !== "success") return rawJsonResponse({status, message: data.description})

  return rawJsonResponse({
    status: "success",
    message: "All programs fetched",
    items: data
  });
})

/*
  Fetches specified program links
*/
router.get("/get-affiliate-links", async ({ query }) => {
  let { program, queries, count, output } = query

  if(!program || !queries) return rawJsonResponse({status: 'error', message: 'Missing inputs'})

  let queryArray = queries.split(',');

  // get all program items
  let {status, data} = await db.allProgramItems(program, !!output)

  if(status !== "success") return rawJsonResponse({status, message: data.description})

  if(!data.length) return rawJsonResponse({status: "error", message: "Program has no items"})

  // determine items to return
  let rankedItems = rankItemsByQueries(data, queryArray)

  return rawJsonResponse({
    status: "success",
    message: "Links fetched",
    items: !count ? [ rankedItems[0] ] : (count === '*' ? data : rankedItems.splice(0, count))
  });
})

/*
  catches all other routes
*/
router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
