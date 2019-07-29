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
}

module.exports = UserController;
