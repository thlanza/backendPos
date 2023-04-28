const cloudinary = require('cloudinary');

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.v2.uploader.upload(fileToUpload, {
            resource_type: 'auto'
        });
        return {
            url: data?.secure_url
        };
    } catch(err) {
        return err;
    }
};

const cloudinaryDelete = async (fileName) => {
    return await cloudinary.v2.uploader.destroy(fileName, { invalidate: true, resource_type: 'image' },
    function(err, res) {
        if(err) {
            console.log(err);
        }
        console.log(res)
    }
    );
  
}

module.exports = { cloudinaryUploadImage, cloudinaryDelete };