'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group('items', () => {
  Route.post('generate', 'ItemController.generate')
  Route.get('find', 'ItemController.read')
  Route.post('pack', 'ItemController.pack')
  Route.post('unpack', 'ItemController.unpack')
  Route.post('push', 'ItemController.store')
})
  .prefix('items')