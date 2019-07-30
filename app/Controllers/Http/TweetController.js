"use strict";

const Tweet = use("App/Models/Tweet");

class TweetController {
  /**
   *  post a user
   *
   * @method tweet
   *
   * @param {Object} request
   * @param {Object} auth
   * @param {Object} response
   *
   * @return {JSON}
   */
  async tweet({ request, auth, response }) {
    // get current authenticated user
    const user = auth.current.user;

    // save tweet o database
    const tweet = await Tweet.create({
      user_id: user.id,
      tweet: request.input("tweet")
    });

    // fetch tweet's relations
    await tweet.loadMany(["user", "favorites", "replies"]);

    return response.json({
      status: "success",
      message: "Tweet posted",
      data: tweet
    });
  }
}

module.exports = TweetController;
