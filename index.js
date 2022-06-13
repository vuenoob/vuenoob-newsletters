import { Router } from 'itty-router'
import Database from './db'
import { rawJsonResponse, readRequestBody } from './utils'

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
})

/*
  catches all other routes
*/
router.all("*", () => new Response("404, not found!", { status: 404 }))

addEventListener('fetch', (e) => {
  e.respondWith(router.handle(e.request))
})
