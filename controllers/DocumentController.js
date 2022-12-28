const Document = require("../models/document");
var mongoose = require('mongoose');
class DocumentController {
    getAllDocument = async (req, res) => {
        console.log("req.query.id", req.query.id);
        if(typeof req.query.id == 'undefined'){
            Document.find().exec()
            .then((data) => {
                res.status(200).send(
                    JSON.stringify({
                        success: true,
                        data: data
                    })
                )
            })
            .catch((error) => {
                res.status(404).send(
                    JSON.stringify({
                        success: false,
                        error: error
                    })
                );
            })
        }
        else {
            try{
                var newI = await Document.findById(req.query.id);
                if(newI!=null){
                    res.status(200).send(
                        JSON.stringify({
                            data: newI
                        })
                    )
                }
                else{
                    res.status(200).send(
                        JSON.stringify({
                            success: true,
                            found: false
                        })
                    )
                }
            }
            catch(e){
                res.status(404).send(
                    JSON.stringify({
                        success: false,
                        error: e,
                    })
                );
            }
        }
        
    }


    getDocumentByID = async(req, res) => {
        console.log("req", req.params.id);
        Document.findById(req.params.id).exec()
        .then((data) => {
            res.status(200).send(
                JSON.stringify({
                    success: true,
                    data: data
                })
            )
        })
        .catch((error) => {
            res.status(404).send(
                JSON.stringify({
                    success: false,
                    error: error
                })
            );
        })
    }

    addNewDocument = async(req, res) => {
        console.log("req.body", req.body);
        var newDocument = new Document({    
            _id: mongoose.Types.ObjectId(),
            documentID: mongoose.Types.ObjectId().toString(),
            name: req.body.name,
            typeID: req.body.typeID,
            views: req.body.views,
            link: req.body.link,
            author: req.body.author,
            isHidden: req.body.isHidden,
        })
        newDocument.save()
        .then((data) =>{
            res.status(200).send({
                success: true,
                data: data,
            });
        })
        .catch((error)=>{
            console.log("error", error)
            res.status(404).send({success:false});
        })
    }   

    editDocument = async(req, res) => {
        // console.log("edit, body",req.body);
        // var newI = await Document.findOne({_id: req.body._id});
        // console.log("newI", newI);

        Document.findOneAndUpdate({_id: req.body._id}, 
            {
                name: req.body.name,
                typeID: req.body.typeID,
                author: req.body.author,
                views: req.body.views,
                link: req.body.link,
                isHidden: req.body.isHidden
            }
        ).then((data) => {
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

    increasingViewDocument = async(req, res) => {
        // console.log("edit, body", req.body);
        var newI = await Document.findOne({_id: req.body._id});
        console.log("newI", newI);

        if(newI == null) return res.status(404).send({run: false, find: false});
        // console.log(newI)
        Document.findOneAndUpdate({_id: req.body._id}, 
            {
                views: (newI.views + 1),
            }
        ).then((data) => {
            res.status(200).send(
                JSON.stringify({
                    increasing: true
                })
            );   
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        // res.status(200).send({run:true});
    }

    deleteDocuments = async(req, res) => {
        // console.log(Object.values(req.body.data));
        Document.deleteMany({_id : { $in: [...Object.values(req.body.data)]}})
        .then((data) =>{
            res.status(200).send({
                success: true,
                data: data,
            });
        })
        .catch((error)=>{
            console.log("error", error)
            res.status(404).send({success:false});
        })
        // res.status(200).send({success:true});
    }
}

module.exports = new DocumentController();