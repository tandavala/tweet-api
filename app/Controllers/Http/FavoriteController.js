"use strict";

const Favorite = user("App/Models/Favorite");

class FavoriteController {
  /**
   *  favorite a tweet
   *
   * @method favorite
   *
   * @param {Object} request
   * @param {Object} auth
   * @param {Object} response
   *
   * @return {Object} json
   */
  async favorite({ request, auth, response }) {
    // get the current user
    const user = auth.current.user;

    const tweetId = request.input("tweet_id");

    const favorite = await Favorite.findOrCreate(
      { user_id: user.id, tweet_id: tweetId },
      { user_id: user.id, tweet_id: tweetId }
    );

    return response.json({
      status: "success",
      data: favorite
    });
  }
}

module.exports = FavoriteController;
