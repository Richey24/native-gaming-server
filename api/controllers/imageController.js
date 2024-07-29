const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();
const fs = require("fs");

const AccountName = process.env.AZURE_BLOB_AccountName;
const AccountKey = process.env.AZURE_BLOB_AccountKey;
const AzureUrl = process.env.AZURE_BLOB_Url;
const AzureEndpoint = process.env.AZURE_BLOB_Endpoint;

const connectionString = `DefaultEndpointsProtocol=${AzureUrl};AccountName=${AccountName};AccountKey=${AccountKey};EndpointSuffix=${AzureEndpoint}`;

const blobClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobClient.getContainerClient("newcontainer");

const imageController = async (req, res) => {
     const file = req.file;

     if (!file) {
          return res.status(400).json({ message: "Send the required image" });
     }

     try {
          // Upload image to Azure
          const blockBlobClient = containerClient.getBlockBlobClient(file.filename);
          const response = await blockBlobClient.uploadFile(file.path, {
               blobHTTPHeaders: {
                    blobContentType: file.mimetype,
               },
          });

          if (response._response.status !== 201) {
               console.log("Error uploading image to Azure");
               return res.status(400).json({ message: "An error occurred uploading the image" });
          }

          // Delete image from folder after it is uploaded
          fs.unlink(file.path, (err) => {
               if (err) {
                    console.error("Error deleting file from server:", err);
               }
          });

          res.status(200).json({
               message: "Image uploaded successfully",
               imagePath: `https://${AccountName}.blob.core.windows.net/newcontainer/${file.filename}`,
          });
     } catch (error) {
          console.error("Error uploading image:", error.message);
          res.status(500).json({ message: "An error occurred uploading the image" });
     }
};

module.exports = imageController;
