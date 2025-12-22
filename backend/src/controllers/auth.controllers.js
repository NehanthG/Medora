import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import Hospital from "../models/hospitalSchema.js";
export const signup = async (req, res) => {
  console.log(req.body);

  const { fullName, email, password, phoneNumber, dateOfBirth } = req.body;
  try {
    if (!fullName || !email || !password || !phoneNumber || !dateOfBirth) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (phoneNumber.length !== 10) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits long" });
    }
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "A User with this email already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      dateOfBirth,
    });

    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        phoneNumber: newUser.phoneNumber,
      });
    }
  } catch (error) {
    console.log("Error signing Up", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "Invalid credentials" });
    }
    const authenticatePassword = await bcrypt.compare(password, user.password);
    if (!authenticatePassword) {
      return res.status(400).send({ message: "Invalid credentials" });
    } else {
      generateToken(user._id, res);
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, dateOfBirth, profilePic } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // if(!profilePic){
    //     return res.status(400).json({message:"Profile picture is required"});
    // }
    const uploadResponce = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponce.secure_url,
        fullName,
        email,
        phoneNumber,
        dateOfBirth,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all hospitals
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .select('-password') // Exclude password from response
      .sort({ hospitalId: 1 }); // Sort by hospital ID

    if (hospitals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No hospitals found",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${hospitals.length} hospitals`,
      data: hospitals
    });

  } catch (error) {
    console.log("Error in getAllHospitals controller", error.message);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
};
