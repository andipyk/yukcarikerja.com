const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route  GET api/profile/me
// @desc   Get current users profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    // TODO pupulate just name and avatar ?
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }

    res.json(profile);
  } catch (error) {
    console.log(error.message);

    console.log(req.user.id);
    res.status(500).send("server error");
  }
});

// @route  POST api/profile
// @desc   create or update users profile
// @access Private
router.post(
  "/",
  [
    auth,
    check("status", "Status is required").not().isEmpty(),
    check("skills", "Status is required").not().isEmpty(),
  ],
  async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    // Build skills array
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build social objek
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // res.send(profileFields);
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("server error");
    }
  }
);

// @route  GET api/profile
// @desc   get all profile
// @access Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("error");
  }
});

// @route  GET api/profile/user/:user_id
// @desc   get  profile by id
// @access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    // if (req.params.user_id)
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.json({ msg: "profile not found" });

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == "ObjectId")
      return res.status(500).json({ msg: "profile not found" });
    res.status(500).send("Server Error");
  }
});

// @route  Delete api/profile
// @desc   Delete current users profile
// @access Private
router.delete("/", auth, async (req, res) => {
  try {
    // TODO pupulate just name and avatar ?
    await Profile.deleteOne({ user: req.user.id }, function (err) {
      if (err) {
        console.log(err.message);
        return res.status(500).send("Database error");
      }
    });

    await User.deleteOne({ _id: req.user.id }, function (err) {
      if (err) {
        console.log(err.message);
        return res.status(500).send("Database error");
      }
    });

    return res.status(200).send({ msg: "user successfully removed!" });
  } catch (error) {
    console.log(error.message);

    res.status(500).send("server error");
  }
});

// @route  Put api/profile/experience
// @desc   Add profile experience
// @access Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = { title, company, location, from, to, current, description };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route  Delete api/profile/experience
// @desc   Delete current users profile experience
// @access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    console.log(`user id: ${req.user.id}`);
    profile.experience.splice(removeIndex, 1);
    profile.save();
    res.json(profile);
  } catch (error) {}
});

// @route  Put api/profile/education
// @desc   Add profile education
// @access Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required").not().isEmpty(),
      check("degree", "degree is required").not().isEmpty(),
      check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route  Delete api/profile/education
// @desc   Delete current users profile education
// @access Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    console.log(`user id: ${req.user.id}`);
    profile.education.splice(removeIndex, 1);
    profile.save();
    res.json(profile);
  } catch (error) {}
});

module.exports = router;
