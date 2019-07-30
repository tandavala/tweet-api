"use strict";

const Tweet = use("App/Models/Tweet");
const Reply = use("App/Models/Reply");

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
  /**
   * show a single tweet
   *
   * @method show
   *
   * @param {Object} params
   * @param {Object} response
   *
   * @return {JSON}
   */
  async show({ params, response }) {
    try {
      const tweet = await Tweet.query()
        .where("id", params.id)
        .with("user")
        .with("replies")
        .with("replies.user")
        .with("favorites")
        .firstOrFail();

      return response.json({
        status: "success",
        datat: tweet
      });
    } catch (error) {
      return response.json({
        status: "error",
        message: "Tweet not found"
      });
    }
  }
  /**
   *  reply a tweet
   *
   * @method reply
   *
   * @param {Object} request
   * @param {Object} auth
   * @param {Object} params
   * @param {Object} response
   *
   * @return  {Object} json
   */
  async reply({ request, auth, params, response }) {
    // get the current authenticated user
    const user = auth.current.user;

    // get tweet with the specified ID
    const tweet = await Tweet.find(params.id);

    // persit to database
    const reply = await Reply.create({
      user_id: user.id,
      tweet_id: tweet.id,
      reply: request.input("reply")
    });

    // fetch user that made the reply
    await reply.load("user");

    return response.json({
      status: "success",
      message: "Reply posted!",
      data: reply
    });
  }
  /**
   *  destroy a tweet from database
   *
   * @method destroy
   *
   * @param {Object} request
   * @param {Object} auth
   * @param {Object} params
   * @param {Object} resonse
   *
   * @return {Object} json
   *
   */
  async destroy({ request, auth, params, response }) {
    // get current authenticated use
    const user = auth.current.user;

    // get tweetwoth the specified ID
    const tweet = await Tweet.query()
      .where("user_id", user.id)
      .where("id", params.id)
      .firstOrFail();

    await tweet.delete();

    return response.json({
      status: "success",
      message: "Twee deleted!",
      data: null
    });
  }
}

module.exports = TweetController;
