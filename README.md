# Users microservice

This is the basic schema to create and code this microservice, feel
free to modify any part, but please keep the standards.

The Code Style is the [StandardJS](https://standardjs.com/)
and there is a package in the
dependencies called `standard` that is useful to to check the style
of your code and correct errors. I use
[WebStorm IDE from JetBrains](https://www.jetbrains.com/webstorm/)
and you can set the settings to use the standard package
automatically and it highlights the errors.

**PLEASE MODIFY THIS README AND ADD THE API DOCS**.  
A recommendation is to use [swagger](https://editor.swagger.io/)
as documentation of the API.

## Middleware

If you take attention in the routes folder there are the routes
of the API and it has the *controllers* or *middleware* that handles
the call to that route.  
Is very clear, note this:
```javascript
/* routes/index.js: */
router.use('/users', usersRouter)

/* ... */

/* routes/users/index.js */
router.post('/',
  input.validate.creation,
  users.create,
  result.send
)

router.get('/:id',
  users.get,
  result.send
)
```
Is very clear that in the endpoint `/users` us the usersRouter
that has a router that when POST to the *home* (`/`, ie, `/users/`
or `/users/`) it *validates the input for creation*, *creates a user*
and *send the result*. Those are the **middleware** or *controllers* and
help to reuse code and keep it clear. The code of that controllers are
in the `controllers` directory.