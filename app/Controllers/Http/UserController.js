"use strict";

const User = use("App/Models/User");

class UserController {
  async signup({ request, auth, response }) {
    // get user data from signup form
    const userData = request.only(["name", "username", "email", "password"]);

    try {
      // save user to database
      const user = await User.create(userData);
      // generate aJWT token for user
      const token = await auth.generate(user);

      return response.json({
        status: "success",
        data: token
      });
    } catch (error) {
      return response.status(400).json({
        status: "error",
        message: "There was a problem creatig the user, please try this again."
      });
    }
  }
  async login({ request, auth, response }) {
    try {
      // validate the usr credentials and generate a JWT token
      const token = await auth.attempt(
        request.input("email"),
        request.input("password")
      );

      return response.json({
        status: "success",
        data: token
      });
    } catch (error) {
      return response.status(400).json({
        status: "error",
        message: "Invalida email/ passowrd"
      });
    }
  }

  async me({ auth, response }) {
    const user = await User.query()
      .where("id", auth.current.user.id)
      .with("tweets", builder => {
        builder.with("user");
        builder.with("favorites");
        builder.with("replies");
      })
      .with("following")
      .with("followers")
      .with("favorites")
      .with("favorites.tweet", builder => {
        builder.with("user");
        builder.with("favorites");
        builder.with("replies");
      })
      .firstOrFail();

    return response.json({
      status: "success",
      data: user
    });
  }
  async updateProfile({ request, auth, response }) {
    try {
      // get currently authentucated user
      const user = auth.current.user;

      // update with new data centered
      user.name = request.input("name");
      user.username = request.input("username");
      user.email = request.input("email");
      user.location = request.input("location");
      user.bio = request.input("bio");
      user.website = request.input("website");

      await user.save();

      return response.json({
        status: "success",
        message: "Profile updadted",
        data: user
      });
    } catch (error) {
      return response.status(400).json({
        status: "error",
        message: "There a problem to update the user data"
      });
    }
  }
}

module.exports = UserController;
