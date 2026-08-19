// backend/models/Biodata.js

const { ObjectId } = require("mongodb");

function createBiodataDocument(data) {
  return {
    _id: new ObjectId(),

    name: data.name,
    age: Number(data.age),
    gender: data.gender || "",
    city: data.city || "",
    state: data.state || "",

    education: data.education || "",
    occupation: data.occupation || "",

    maritalStatus: data.maritalStatus || "",
    caste: data.caste || "",
    subCaste: data.subCaste || "",

    photo: data.photo,
    biodataPdf: data.biodataPdf,

    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

module.exports = {
  createBiodataDocument,
};