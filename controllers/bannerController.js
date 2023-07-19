const User = require('../models/userModel')
const Banner = require('../models/bannerModel')


//===============Load Banner List================//
const loadBannerManagement = async(req,res) => {
    try {
        const adminData = await User.find({is_admin:1});
        const banners = await Banner.find({is_delete:false});
    
        res.render("bannerList",{admin:adminData,banners})
    }
    
 catch (error) {
   console.log(error.message); 
}
};

//===============Add Banner ================//
const addBanner = async(req,res) => {
    try {
        const heading = req.body.heading;
        let image = "";
        if (req.file) {
          image = req.file.filename;
        }
        const banner = new Banner({
          heading: heading,
          image: image,
        });
        banner.save();
        res.redirect("/admin/bannerList");
    } catch (error) {
        console.log(error.message);
        
    }
}

//===============Edit Banner ================//
const editBanner = async (req, res, next) => {
    try {
      const id = req.body.id;
      const heading = req.body.heading;
      let image = req.body.img;
  
      if (req.file) {
        image = req.file.filename;
      }
      await Banner.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            heading: heading,
            image: image,
          },
        }
      );
      res.redirect("/admin/bannerList");
    } catch (error) {
      next(error);
    }
  };

  //===============Banner-Soft-Delete ================//
  const deleteBanner = async(req,res) => {
    try {
        const id = req.params.id
        
       
        await Banner.updateOne({_id:id},{$set:{is_delete:true}})
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error.message);
        
    }
}


module.exports = {
    loadBannerManagement,
    addBanner,
    editBanner,
    deleteBanner,
}
