const User = require('../models/userModel')
const Address = require('../models/addressModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')



 //====================Load Address=================//
 const loadAddress = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    if (!session) {
      return res.render("home", { session: session });
    }
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });
    const userData = await User.find({ _id: req.session.user_id });
    console.log("ghvhgvhgv");
    const address = addressDetails ? addressDetails.addresses : null; // Check if addressDetails is null
    console.log(address);

    res.render("address", { session: session, address, user: userData });
  } catch (error) {
    next(error);
  }
};


//====================Load Add Address=================//
const LoadAddAddress = async(req,res,next) => {
  try {
    const session = req.session.user_id;
    if (!session) {
      return res.render("home", { session: session });
    }
    const userData = await User.find({ _id: session });
    res.render("addAddress",{user:userData,session})
    
} catch (error) {
    console.log(error.message);
    next(error)

}
}

 //====================Insert Address=================//
 const insertAddress = async (req, res,next) => {
  try {
    const addressDetails = await Address.findOne({
      userId: req.session.user_id,
    });
    console.log(addressDetails);
    if (addressDetails) {
      const updateOne = await Address.updateOne(
        { userId: req.session.user_id },
        {
          $push: {
            addresses: [{
              userName: req.body.userName,
              mobile: req.body.mobile,
              altrenativeMob: req.body.altrenativeMobile,
              houseName: req.body.house,
              landmark: req.body.landmark,
              city: req.body.city,
              state: req.body.state,
              pincode: req.body.pincode,
            }],
          },
        }
      );

      if (updateOne) {
        res.redirect("/checkout");
      } else {
        res.redirect("/");
      }
    } else {
      console.log("gyhujikol");
      const address = new Address({
        userId: req.session.user_id,
        addresses: [
          {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.altrenativeMobile,
            houseName: req.body.house,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        ],
      });
      console.log(address);
      const addressData = await address.save();
      if (addressData) {
        res.redirect("/checkout");
      } else {
        res.redirect("/checkout");
      }
    }
  } catch (error) {
    next(error)
  }
};

//====================Delete The Address=================//
const deleteAddress = async (req, res) => {
  try {
    console.log('Deleting address...');
    const session = req.session.user_id;
    if (!session) {
      return res.render("home", { session: session });
    }

    const id = req.body.id; // Change to req.body instead of req.query as it is a POST request
    console.log('Address ID to delete:', id);

    await Address.updateOne(
      { userId: req.session.user_id },
      { $pull: { addresses: { _id: id } } }
    );

    console.log('Address deleted successfully.');
    res.json({ remove: true }); // Send a response indicating successful deletion
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred" });
  }
};

//=============== LOAD EDIT ADDRESS ============= //

const   loadEditAddress = async (req, res,next) => {
  try {
    const id = req.query.id;
    const session = req.session.user_id;
    const user = await User.find({});
    const addressData = await Address.findOne(
      { userId: session },
      { addresses: { $elemMatch: { _id: id } } }
    );
    const address = addressData.addresses;
    res.render("editAddress", {
      address: address[0],
      session: session,
      user: user,
    });
  } catch (error) {
    next(error)
  }
};

//================ UPDATE ADDRESS ============  //

const updateAddress = async (req, res,next) => {
  try {
    const session = req.session.user_id;
    const id = req.query.id;
    console.log(id);
    const address = await Address.updateOne(
      { userId: session },
      { $pull: { addresses: { _id: id } } }
    );
    console.log(address);
    const pushAddress = await Address.updateOne(
      { userId: session },
      {
        $push: {
          addresses: {
            userName: req.body.userName,
            mobile: req.body.mobile,
            altrenativeMob: req.body.altrenativeMobile,
            houseName: req.body.house,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
          },
        },
      }
    );
    res.redirect("/checkout");
  } catch (error) {
    next(error)
  }
};

module.exports = {
    loadAddress,
    LoadAddAddress,
    insertAddress,
    deleteAddress,
    loadEditAddress,
    updateAddress,
  }