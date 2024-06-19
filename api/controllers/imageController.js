const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();
const fs = require("fs");
const AccountName = process.env.AZURE_BLOB_AccountName || "";
const AccountKey = process.env.AZURE_BLOB_AccountKey || "";
const blobClient = BlobServiceClient.fromConnectionString(
  `DefaultEndpointsProtocol=https;AccountName=${AccountName};AccountKey=${AccountKey};EndpointSuffix=core.windows.net`
);
const containerClient = blobClient.getContainerClient("newcontainer");

const imageController = async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "Send the required image" });
  }
  // upload image to azure
  const imageClient = containerClient.getBlockBlobClient(file.filename);
  const response = await imageClient.uploadFile(file.path, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  });
  if (response._response.status !== 201) {
    console.log("error");
    res.status(400).json({ message: "An error occured uploading the image" });
  }
  // delete image from folder after it is uploaded
  fs.unlink(file.path, (err) => {
    if (err) {
      console.log(err);
    }
  });
  res
    .status(200)
    .json({
      message: "Image uploaded successfully",
      imagePath: `https://absa7kzimnaf.blob.core.windows.net/newcontainer/${file.filename}`,
    });
};

module.exports = imageController;
