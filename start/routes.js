"use strict";

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
const Route = use("Route");

Route.get("/", () => {
  return { greeting: "Hello world in JSON" };
});

// Authentication routes

Route.post("/signup", "UserController.signup");

Route.post("/login", "UserController.login");

// User profile routes

Route.group(() => {
  Route.get("/me", "UserController.me");
  Route.put("/update_profile", "UserController.updateProfile");
  Route.put("/change_password", "UserController.changePassword");
})
  .prefix("account")
  .middleware(["auth:jwt"]);

Route.get(":username", "UserController.showProfile");

// Users routes

Route.group(() => {
  Route.get("/user_to_follow", "UserController.usersToFollow");
  Route.post("/follow/:id", "UserController.follow");
  Route.delete("/unfollow/:id", "UserController.unfollow");
  Route.get("/timeline", "UserController.timeline");
}).prefix("users").middleware["auth:jwt"];

// Tweets routes

Route.post("/tweet", "TweetController.tweet").middleware(["auth:jwt"]);

Route.get("/tweets/:id", "TweetController.show");

Route.delete("/tweets/destroy/:id", "TweetController.destroy").middleware([
  "auth:jwt"
]);

Route.post("/tweets/reply/:id", "TweetController.reply").middleware([
  "auth:jwt"
]);

// Favorite routes

Route.group(() => {
  Route.post("/create", "FavoriteController.favorite");
  Route.delete("/destroy/:id", "FavoriteController.unFavorite");
})
  .prefix("favorites")
  .middleware(["auth:jwt"]);
