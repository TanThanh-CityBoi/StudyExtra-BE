const typeCategory = require('../models/typeCategory');
var mongoose = require('mongoose');
class typeCategoryController{
    getAllTypeCategory = async (req, res) => {
        // console.log("nav to get document");
        console.log("get req.body", req.body);
        typeCategory.find().exec()
        .then((data) => {
            res.status(200).send(
                JSON.stringify({
                    data: data
                })
            )
        })
        .catch((error) => {
            res.status(404).send(error);
        })
    }

    addNewTypeCategory =  async(req, res) => {
        console.log("req.body", req.body);

        if(!req.body.name) {
            res.status(404).send({
                success:false,
                message: "Can't get type name",
            });
        }
        var newTypeCategory = new typeCategory({
            _id: mongoose.Types.ObjectId(),
            name: req.body.name
        })
        newTypeCategory.save()
        .then((data) =>{
            res.status(200).send({
                success: true,
                data: data
            });
        })
        .catch((error)=>{
            console.log("error", error)
            res.status(404).send({success:false});
        })
    }  
    
    addNewTypeCategoryID =  async(req, res) => {
        console.log("req.body", req.body);

        if(!req.body.name) {
            res.status(404).send({
                success:false,
                message: "Can't get type name",
            });
        }
        var newTypeCategory = new typeCategory({
            _id: mongoose.Types.ObjectId(req.params.id),
            name: req.body.name
        })
        newTypeCategory.save()
        .then((data) =>{
            res.status(200).send({
                success: true,
                data: data
            });
        })
        .catch((error)=>{
            console.log("error", error)
            res.status(404).send({success:false});
        })
    }  


    editTypeCategory = async(req, res) => {
        console.log(req.body);
        // var newI = await typeCategory.findOne({_id: req.body._id});
        // console.log("newI", newI);

        typeCategory.findOneAndUpdate({_id: req.body._id}, {name: req.body.newName})
        .then((data) => {
            res.status(200).send(
                JSON.stringify({
                    data,
                })
            );
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        // res.status(200).send({run:true});
    }

    deleteTypeCategory = async(req, res) => {
        console.log(req.body);
        typeCategory.findOneAndDelete({_id: req.body._id})
        .then((data) => {
            res.status(200).send(
                JSON.stringify({
                    data,
                })
            );
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        // res.status(200).send({run:true});
    }
}

module.exports = new typeCategoryController();