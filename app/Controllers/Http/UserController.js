"use strict";

const User = use("App/Models/User");
const Hash = use("Hash");
const Tweet = use("App/Models/Tweet");

class UserController {
  /**
   * Signup a uset
   *
   * @method signup
   *
   * @param {Object} request
   * @param {Object} auth
   * @param {Object} response
   *
   * @return {Object} json
   *
   */
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

  /**
   * Login user
   *
   * @method login
   *
   * @param {Object} request
   * @param {Object} auth
   * @param {Object} response
   *
   * @return {Object} json
   */

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

  /**
   * Get all about the user
   *
   * @method me
   *
   * @param {Object} auth
   * @param {Object} response
   *
   *
   * @return {Object} json
   */

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

  /**
   * update user profile
   *
   * @methd updateProfile
   *
   * @param { Object} request
   * @param {Obejct} auth
   * @param {Object} response
   *
   * @return {Object} json
   *
   */

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
  /**
   * chenge user password
   *
   * @method changePassword
   *
   * @param {Object} request
   * @param {Obejct} auth
   * @param {Object} response
   */
  async changePassword({ request, auth, response }) {
    // get currently authenticated user
    const user = auth.current.user;

    // verify if current password matches
    const verifyPassword = await Hash.verify(
      request.input("password"),
      user.password
    );

    // display appropriate message
    if (!verifyPassword) {
      return response.status(400).json({
        status: "error",
        message: "Current password could not be verified! Please try again."
      });
    }

    // hash and save new password
    user.password = await Hash.make(request.input("newPassword"));
    await user.save();

    return response.json({
      status: "success",
      message: "Password updated!"
    });
  }

  /**
   *  show user profile
   *
   * @method showProfile
   *
   * @param {Object} request
   * @param {Object} params
   * @param {Object} response
   */
  async showProfile({ request, params, response }) {
    try {
      const user = await User.query()
        .where("username", params.username)
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
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
  }

  /**
   *  List a user to follow
   *
   * @methed usersToFollow
   *
   * @param {Object} param
   * @param {Object} auth
   * @param {Object} response
   *
   * @return {JSON}
   */

  async usersToFollow({ params, auth, response }) {
    // get currently authenticated user
    const user = auth.current.user;

    // get the IDs of users the currently authenticated user is already following
    const usersAlreadyFollowing = await user.following().ids();

    // fetch users the currently authenticated user is not already following
    const usersToFollow = await User.query()
      .whereNot("id", user.id)
      .whereNotIn("id", usersAlreadyFollowing)
      .pick(3);

    return response.json({
      status: "success",
      data: usersToFollow
    });
  }

  /**
   * Follow a user
   *
   * @method follow
   *
   * @param {Object} request
   * @param {Object} auth
   * @param {Object} response
   *
   * @return {JSON}
   */
  async follow({ request, auth, response }) {
    // get currently authenticated user
    const user = auth.current.user;

    // add to user's followers
    await user.following.attach(request.input("user_id"));

    return response.json({
      status: "success",
      data: null
    });
  }
  /**
   * unfollow a user
   *
   * @methed unfollow
   *
   * @param {Object} params
   * @param {Object} auth
   * @param {Object} response
   *
   * @return  {JSON}
   */
  async unfollow({ params, auth, reponse }) {
    // get currently authenticated user
    const user = user.current.user;

    // remote frm user's followers
    await user.follow().detach(params.id);

    return response.json({
      status: "sucsess",
      data: null
    });
  }

  /**
   * user timeline
   *
   * @method timeline
   *
   * @param {Object} auth
   * @param {Object} response
   *
   * @return {JSON}
   */
  async timeline({ auth, response }) {
    const user = await User.find(auth.current.user.id);

    // get an array of IDs of th user's followers
    const followersIds = await user.following().ids();

    // add the user's ID alse to the array
    followersIds.push(user.id);

    const tweets = await Tweet.query()
      .whereIn("user_id", followersIds)
      .with("user")
      .with("favorites")
      .with("replies")
      .fetch();

    return response.json({
      status: "success",
      data: tweets
    });
  }
}
module.exports = UserController;
