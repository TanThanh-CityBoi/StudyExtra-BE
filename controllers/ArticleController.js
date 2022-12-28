const Article = require("../models/article");
const User = require("../models/users");
var mongoose = require('mongoose');
const { response } = require("express");
const refineReplyComment = (replyComments, userData) => {
    var res = [];
    replyComments.forEach(replyComment => {
        var currentReplyComment = replyComment;
        var isFind = true;
        for(var i = 0; i < userData.length; i++){
            if(userData[i]._id.toString() == replyComment.userID){
                currentReplyComment.username = userData[i].username;
                currentReplyComment.name = userData[i].name;
                currentReplyComment.userID = userData[i]._id;
                currentReplyComment.userAvatar = userData[i].avatar;
                if(currentReplyComment.replyComment.length>0)
                    currentReplyComment.replyComment = refineReplyComment(currentReplyComment.replyComment, userData);
                isFind= true;
                break;
            }
        }
        if(isFind){
            res.push(currentReplyComment);
        }
    });
    return res;
}

const getAllArticleOutside = async(req, res) => {
    var dataArticle;
    await Article.find().exec()
    .then((data) => {  
        dataArticle = data;
    })
    .catch((error) => {
        res.status(404).send(error);
    })

    var userData;
    await User.find().exec()
    .then((data) => {  
        userData = data;
    })
    .catch((error) => {
        res.status(404).send(error);
    })

    // console.log("userData", userData)

    var summaryData = [];
    for(var i = 0; i < dataArticle.length; i++){
        var currentCmt = dataArticle[i].comments;
        // console.log("currentCmt", currentCmt.length);
        var refinedCmt = [];
        for(var k = 0; k < currentCmt.length; k++){
            var findCmtUser = false;
            // console.log("Chạy ở vòng k");
            for(var j = 0; j < userData.length; j++){
                // console.log(userData[j]._id.toString(),currentCmt[k].userID);
                if(userData[j]._id.toString() == currentCmt[k].userID){
                    // console.log("tìm thấy rồi")
                    currentCmt[k].username = userData[j].username;
                    currentCmt[k].name = userData[j].name;
                    currentCmt[k].userAvatar = userData[j].avatar;
                    currentCmt[k].userID = userData[j]._id;
                    if(currentCmt[k].replyComment.length != 0)
                        currentCmt[k].replyComment = refineReplyComment(currentCmt[k].replyComment, userData);
                    findCmtUser = true;
                    break;
                }
            }
            if(findCmtUser){
                refinedCmt.push(currentCmt[k]);
            }
        }
        
        var currentData = {
            ...dataArticle[i]._doc,
            userID : dataArticle[i].userID,
            content: dataArticle[i].content,
            imgUrl: dataArticle[i].imgUrl,
            comments : refinedCmt,
        }
        

        var isFindUser = false;
        for(var j = 0; j < userData.length; j++){
            if(dataArticle[i].userID == userData[j]._id){
                isFindUser = true;
                currentData.username = userData[j].username,
                currentData.avatar = userData[j].avatar;
                currentData.name = userData[j].name;
                break;
            }
        }
        if(isFindUser){
            summaryData.push(currentData);
        }
    }


    res.status(200).send(
        JSON.stringify({
            data: summaryData
        })
    )
}

class ArticleController {
    getAllArticles = async (req, res) => {
        await getAllArticleOutside(req, res);   
    }   

    addArticles = async (req, res) => {
        console.log("req.body", req.body);
        var newArticle = new Article({    
            _id: mongoose.Types.ObjectId(),
            userID: req.body.userID,
            content: req.body.content,
            imgUrl: req.body.imgUrl,
            comments: req.body.comments,
            reactions: [],
        })

        var userData;
        await User.find().exec()
        .then((data) => {  
            userData = data;
        })
        .catch((error) => {
            res.status(404).send(error);
        })

        var username = "";
        var userAvatar = "";
        var name = "";

        for(var j = 0; j < userData.length; j++){
            if(newArticle.userID == userData[j]._id){
                username = userData[j].username,
                userAvatar = userData[j].avatar;
                name = userData[j].name;
                break;
            }
        }

        await newArticle.save()
        .then((data) =>{

        })
        .catch((error)=>{
            console.log("error", error)
            res.status(404).send({success:false});
        })

        await getAllArticleOutside(req, res);   
        // res.status(200).send({run:true});
        
    }

    editArticle = async (req, res) => {
        console.log("req.body", req.body);


        await Article.findOneAndUpdate({_id: req.body._id}, 
            {
                content: req.body.content,
                imgUrl: req.body.imgUrl,
            }
        )
        .then((data) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);   

    }

    deleteArticles = async (req, res) => {
        console.log("req.body", req.body);
        Article.findOneAndDelete({_id: req.body._id})
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

    addBigComment = async (req, res) => {
        // console.log("req.body", req.body);
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })
        // console.log("currentArticle", currentArticle);


        var newCommentList = [
            ...currentArticle.comments,
            {
                commentID: mongoose.Types.ObjectId(),
                userID: req.body.userID,
                content: req.body.content,
                type: req.body.type,
                imgUrl: req.body.imgUrl,
                replyComment: [],
                isHidden: false,
                time: req.body.time,
                reactions: [],
            }
        ]
        // add new article comment
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: newCommentList,
            }
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        // console.log("Thực hiện xong việc add cmt rồi");

        await getAllArticleOutside(req, res);
    }

    deleteBigComment = async (req, res) => {
        console.log("req.body: ", req.body);
        // Tìm article liên quan
        var dataArticle;
        await Article.findById(req.body.postID).exec()
        .then((data)=>{
            dataArticle = data;
        })
        .catch((error)=>{
            res.status(404).send({
                success: false,
                findArticle: false,
                error: error,
            })
            return;
        })

        // Lấy cái commentID hiện tại và thực hiện xoá
        var allComments = dataArticle.comments;
        allComments = allComments.filter(function(item) {
            return item.commentID.toString() != req.body.commentID;
        })

        // Thay đổi và thử lấy giá trị sau khi thay đổi
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: allComments,
            }
        )
        .then((dataRes) => {
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
            return;
        });

        await getAllArticleOutside(req, res);
    }
    
    hideBigComment = async(req, res) => {
        console.log("req.body", req.body);
        // Tìm article liên quan
        var dataArticle;
        await Article.findById(req.body.postID).exec()
        .then((data)=>{
            dataArticle = data;
        })
        .catch((error)=>{
            res.status(404).send({
                success: false,
                findArticle: false,
                error: error,
            })
            return;
        })

        // console.log("dataArticle",dataArticle)
        // Lấy cái commentID hiện tại
        var allComments = dataArticle.comments;
        for(var i = 0; i < allComments.length; i++){
            if(allComments[i].commentID.toString() == req.body.commentID){
                allComments[i].isHidden = true;
            }
        }

        // Thay đổi và thử lấy giá trị sau khi thay đổi
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: allComments,
            }
        )
        .then((dataRes) => {
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
            return;
        });

        await getAllArticleOutside(req, res); 
    }

    showBigComment = async(req, res) => {
        console.log("req.body", req.body);
        // Tìm article liên quan
        var dataArticle;
        await Article.findById(req.body.postID).exec()
        .then((data)=>{
            dataArticle = data;
        })
        .catch((error)=>{
            res.status(404).send({
                success: false,
                findArticle: false,
                error: error,
            })
            return;
        })

        // console.log("dataArticle",dataArticle)
        // Lấy cái commentID hiện tại
        var allComments = dataArticle.comments;
        for(var i = 0; i < allComments.length; i++){
            if(allComments[i].commentID.toString() == req.body.commentID){
                allComments[i].isHidden = false;
            }
        }

        // Thay đổi và thử lấy giá trị sau khi thay đổi
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: allComments,
            }
        )
        .then((dataRes) => {
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
            return;
        });

        await getAllArticleOutside(req, res);

    }

    interactArticle = async(req, res) => {
        console.log("req.body", req.body);
        // Lấy article hiện tại
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        // Cập nhật thêm interaction vào thôi
        // Lấy các reaction hiện tại
        
        var currentReaction;
        try{
            currentReaction = currentArticle.reactions;
        }
        catch(e){
            currentReaction = [];
        }
    
        if(!currentReaction.includes(req.body.userID))
        currentReaction.push(req.body.userID);

        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                reactions: currentReaction,
            }
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);

    }

    unlikeArticle = async(req, res) => {
        console.log("req.body", req.body);
        // Lấy article hiện tại
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        // Cập nhật thêm interaction vào thôi
        // Lấy các reaction hiện tại
        
        var currentReaction;
        try{
            currentReaction = currentArticle.reactions;
        }
        catch(e){
            currentReaction = [];
        }
    
        currentReaction = currentReaction.filter(function(item) {
            return item !== req.body.userID
        })

        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                reactions: currentReaction,
            }
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);

    }

    interactBigComment = async(req, res) => {
        console.log("req.body", req.body);

        // Tìm article hiện tại
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })


        // find comment and add reaction the the comment 
        var currentCmtList = currentArticle.comments;
        console.log("1 currentCmtList", currentCmtList)


        for(var i = 0; i < currentCmtList.length; i++){
            if(currentCmtList[i].commentID.toString() == req.body.commentID.toString()){
                console.log('cmt',currentCmtList[i].reactions);
                if (!(currentCmtList[i].reactions.includes(req.body.userID))){
                    currentCmtList[i].reactions.push(req.body.userID);
                }
            }
        }

        console.log("currentCmtList", currentCmtList)

        // Chỉnh sửa cmt list
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCmtList,
            }
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        // console.log("Thực hiện xong việc add cmt rồi");

        await getAllArticleOutside(req, res);

    }


    unLikeBigComment = async(req, res) => {
        console.log("req.body", req.body);

        // Tìm article hiện tại
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })


        // find comment and add reaction the the comment 
        var currentCmtList = currentArticle.comments;
        // console.log("1 currentCmtList", currentCmtList)


        for(var i = 0; i < currentCmtList.length; i++){
            if(currentCmtList[i].commentID.toString() == req.body.commentID.toString()){
                // console.log('cmt react 1',currentCmtList[i].reactions);
                // console.log("req.body.userID", req.body.userID);
                currentCmtList[i].reactions = currentCmtList[i].reactions.filter(item => item !== req.body.userID);
                // console.log('cmt react 2',currentCmtList[i].reactions);
            }
        }

        // console.log("currentCmtList", currentCmtList)

        // Chỉnh sửa cmt list
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCmtList,
            }
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        // console.log("Thực hiện xong việc add cmt rồi");

        await getAllArticleOutside(req, res);
    }
    
    addReplyComment = async(req, res) => {
        console.log("req.body", req.body);
        
        
        // Find current post 
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })


        // console.log("currentArticle", currentArticle);
        if(req.body.parrentComment == []) return;
        var currentCommentList = currentArticle.comments;
        // console.log("currentCommentList", currentCommentList);
        // console.log("req.body.parrentComment", req.body.parrentComment);

        var temptComment = [{}];
        for(var i = 0; i < currentCommentList.length; i++){
            if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                temptComment[0] = currentCommentList[i];
            }
        }

        console.log("temptComment[0]", temptComment[0]);
        
        for(var i = 1; i < req.body.parrentComment.length; i++){
            // console.log('chạy vào đây rồi', i)
            // console.log("req.body.parrentComment[i]",req.body.parrentComment[i]);
            var isFind = false;
            for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                    temptComment.push(temptComment[i-1].replyComment[j]);
                    console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }
            if(!isFind) 
                res.status(200).send({
                    run: true
                })
        }
        
        temptComment[temptComment.length-1].replyComment.push({
            commentID: mongoose.Types.ObjectId(),
            userID: req.body.userID,
            content: req.body.content,
            type: '1',
            imgUrl: req.body.imgUrl,
            replyComment: [],
            isHidden: false,
            time: req.body.time,
            reactions: [], 
        })

        // for(var i = 0; i < currentCommentList.length; i++){
        //     console.log("currentCommentList", i, currentCommentList[i]);
        // }
        


        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCommentList,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        // // console.log("Thực hiện xong việc add cmt rồi");

        await getAllArticleOutside(req, res);

        // res.status(200).send({
        //     run: true
        // })
    }

    deleteReplyComment = async(req, res) => {
        console.log("req.body", req.body);

        // Find current post 
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        if(req.body.parrentComment == []) return;
        var currentCommentList = currentArticle.comments;

        var temptComment = [{}];
        for(var i = 0; i < currentCommentList.length; i++){
            if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                temptComment[0] = currentCommentList[i];
            }
        }

        console.log("temptComment[0]", temptComment[0]);
        
        for(var i = 1; i < req.body.parrentComment.length; i++){
            // console.log('chạy vào đây rồi', i)
            // console.log("req.body.parrentComment[i]",req.body.parrentComment[i]);
            var isFind = false;
            for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                    temptComment.push(temptComment[i-1].replyComment[j]);
                    console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }
            if(!isFind) 
                res.status(400).send({
                    run: false
                })
        }

        // console.log("temptComment[temptComment.length-1].replyComment", temptComment[temptComment.length-1].replyComment);
        var currentReply = temptComment[temptComment.length-1].replyComment;
        currentReply = currentReply.filter(function(item) {
            return item.commentID.toString() !== req.body.commentID
        })
        temptComment[temptComment.length-1].replyComment = currentReply;

        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCommentList,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);

    }

    likeReplyComment = async(req,res) => {
        console.log("req.body", req.body);

        // Find current post 
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        if(req.body.parrentComment == []) return;
        var currentCommentList = currentArticle.comments;

        var temptComment = [{}];
        for(var i = 0; i < currentCommentList.length; i++){
            if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                temptComment[0] = currentCommentList[i];
            }
        }

        // console.log("temptComment[0]", temptComment[0]);
        
        for(var i = 1; i < req.body.parrentComment.length; i++){
            // console.log('chạy vào đây rồi', i)
            // console.log("temptComment[i-1]",temptComment[i-1]);
            var isFind = false;
            for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                    temptComment.push(temptComment[i-1].replyComment[j]);
                    console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }
            if(!isFind) 
                res.status(400).send({
                    run: false
                })
        }

        // console.log("temptComment[temptComment.length-1].replyComment", temptComment[temptComment.length-1].replyComment);
        // var currentReply = temptComment[temptComment.length-1].replyComment;
        // currentReply = currentReply.filter(function(item) {
        //     return item.commentID.toString() !== req.body.commentID
        // })

        for(var j = 0; j < temptComment[temptComment.length-1].replyComment.length; j++){
            if(temptComment[temptComment.length-1].replyComment[j].commentID.toString() == req.body.commentID){
                temptComment.push(temptComment[temptComment.length-1].replyComment[j]);
                console.log("tìm ra rồi");
                isFind = true;
                break;
            }
        }

        // console.log("temptComment[temptComment.length-1]", temptComment[temptComment.length-1]);
        // temptComment[temptComment.length-1].replyComment = currentReply;
        temptComment[temptComment.length-1].reactions.push(req.body.userID);
        
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCommentList,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);
    }

    unlikeReplyComment = async(req, res) => {
        console.log("req.body", req.body);

        // Tìm bài post hiện tại
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        // Đi đến cmt cần unlike
        if(req.body.parrentComment == []) return;
        var currentCommentList = currentArticle.comments;

        var temptComment = [{}];
        for(var i = 0; i < currentCommentList.length; i++){
            if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                temptComment[0] = currentCommentList[i];
            }
        }

        console.log("temptComment[0]", temptComment[0]);
    
        for(var i = 1; i < req.body.parrentComment.length; i++){
            // console.log('chạy vào đây rồi', i)
            console.log("temptComment[i-1]",temptComment[i-1]);
            var isFind = false;
            for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                    temptComment.push(temptComment[i-1].replyComment[j]);
                    console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }
            if(!isFind) 
                res.status(400).send({
                    run: false
                })
        }

        // console.log("temptComment[temptComment.length-1].replyComment", temptComment[temptComment.length-1].replyComment);
        // var currentReply = temptComment[temptComment.length-1].replyComment;
        // currentReply = currentReply.filter(function(item) {
        //     return item.commentID.toString() !== req.body.commentID
        // })

        for(var j = 0; j < temptComment[temptComment.length-1].replyComment.length; j++){
            if(temptComment[temptComment.length-1].replyComment[j].commentID.toString() == req.body.commentID){
                temptComment.push(temptComment[temptComment.length-1].replyComment[j]);
                console.log("tìm ra rồi");
                isFind = true;
                break;
            }
        }

        temptComment[temptComment.length-1].reactions = temptComment[temptComment.length-1].reactions.filter(function(item) {
            return item !== req.body.userID;
        })

        
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCommentList,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);
    }

    hideReplyComment = async(req, res) => {
        console.log("req.body", req.body);
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        // Đi đến cmt cần unlike
        if(req.body.parrentComment == []) return;
        var currentCommentList = currentArticle.comments;

        var temptComment = [{}];
        for(var i = 0; i < currentCommentList.length; i++){
            if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                temptComment[0] = currentCommentList[i];
            }
        }

        // console.log("temptComment[0]", temptComment[0]);
    
        for(var i = 1; i < req.body.parrentComment.length; i++){
            // console.log('chạy vào đây rồi', i)
            // console.log("temptComment[i-1]",temptComment[i-1]);
            var isFind = false;
            for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                    temptComment.push(temptComment[i-1].replyComment[j]);
                    // console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }
            if(!isFind) 
                res.status(400).send({
                    run: false
                })
        }

        for(var j = 0; j < temptComment[temptComment.length-1].replyComment.length; j++){
            if(temptComment[temptComment.length-1].replyComment[j].commentID.toString() == req.body.commentID){
                temptComment.push(temptComment[temptComment.length-1].replyComment[j]);
                // console.log("tìm ra rồi");
                isFind = true;
                break;
            }
        }

        temptComment[temptComment.length-1].isHidden = true;
        
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCommentList,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);
    }

    showReplyComment = async(req, res) => {
        console.log("req.body", req.body);
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        // Đi đến cmt cần unlike
        if(req.body.parrentComment == []) return;
        var currentCommentList = currentArticle.comments;

        var temptComment = [{}];
        for(var i = 0; i < currentCommentList.length; i++){
            if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                temptComment[0] = currentCommentList[i];
            }
        }

        // console.log("temptComment[0]", temptComment[0]);
    
        for(var i = 1; i < req.body.parrentComment.length; i++){
            // console.log('chạy vào đây rồi', i)
            // console.log("temptComment[i-1]",temptComment[i-1]);
            var isFind = false;
            for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                    temptComment.push(temptComment[i-1].replyComment[j]);
                    // console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }
            if(!isFind) 
                res.status(400).send({
                    run: false
                })
        }

        for(var j = 0; j < temptComment[temptComment.length-1].replyComment.length; j++){
            if(temptComment[temptComment.length-1].replyComment[j].commentID.toString() == req.body.commentID){
                temptComment.push(temptComment[temptComment.length-1].replyComment[j]);
                // console.log("tìm ra rồi");
                isFind = true;
                break;
            }
        }

        temptComment[temptComment.length-1].isHidden = false;
        
        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCommentList,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);
    }

    editBigComment = async(req, res) => {
        console.log("req.body", req.body);

        var currentArticle;
        await Article.findById(req.body.postID).exec()
            .then((data) => {  
                currentArticle = data;
            })
            .catch((error) => {
                return res.status(404).send({run: false, error:error});
            })
        
        var currentComment = {};
        for(var i = 0; i < currentArticle.comments.length; i++){
            if(req.body.commentID == currentArticle.comments[i].commentID.toString()){
                console.log("Tìm thấy rồi");
                currentComment = currentArticle.comments[i];
            }
        }

        // console.log("currentComment", currentComment)
        currentComment.content = req.body.content;
        currentComment.imgUrl = req.body.imgUrl;

        // console.log("currentArticle.comments", currentArticle.comments)

        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentArticle.comments,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);
    }

    editReplyComment = async(req, res) => {
        console.log("req.body", req.body);
        
        var currentArticle;
        await Article.findById(req.body.postID).exec()
        .then((data) => {  
            currentArticle = data;
        })
        .catch((error) => {
            res.status(404).send({run: false, error:error});
        })

        // Đi đến cmt cần unlike
        if(req.body.parrentComment == []) return;
        var currentCommentList = currentArticle.comments;

        var temptComment = [{}];
        for(var i = 0; i < currentCommentList.length; i++){
            if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                temptComment[0] = currentCommentList[i];
            }
        }

        // console.log("temptComment[0]", temptComment[0]);
    
        for(var i = 1; i < req.body.parrentComment.length; i++){
            // console.log('chạy vào đây rồi', i)
            // console.log("temptComment[i-1]",temptComment[i-1]);
            var isFind = false;
            for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                    temptComment.push(temptComment[i-1].replyComment[j]);
                    // console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }
            if(!isFind){
                console.log("Không tìm thấy trong cái parrent");
                return res.status(400).send({
                    run: false
                })
            } 
                
        }

        for(var j = 0; j < temptComment[temptComment.length-1].replyComment.length; j++){
            if(temptComment[temptComment.length-1].replyComment[j].commentID.toString() == req.body.commentID){
                temptComment.push(temptComment[temptComment.length-1].replyComment[j]);
                // console.log("tìm ra rồi");
                isFind = true;
                break;
            }
        }

        // console.log("temptComment[temptComment.length-1]", temptComment[temptComment.length-1]);
        temptComment[temptComment.length-1].content = req.body.content;
        temptComment[temptComment.length-1].imgUrl = req.body.imgUrl;

        await Article.findOneAndUpdate({_id: req.body.postID}, 
            {
                comments: currentCommentList,
            }   
        )
        .then((dataRes) => {
            
        })
        .catch((err) => {
            res.status(404).send({run: false, err: err});
        });

        await getAllArticleOutside(req, res);
    }

    getArticleInteractionList = async(req, res) => {
        console.log("req.body", req.body);

        var currentArticle;

        await Article.findById(req.body.postID).exec()
            .then((data) => {  
                currentArticle = data;
            })
            .catch((error) => {
                return res.status(404).send({run: false, error:error});
            })

        var userList = currentArticle.reactions;
        // console.log(userList);

        var userData;
        await User.find().exec()
            .then((data) => {  
                userData = data;
            })
            .catch((error) => {
                return res.status(404).send(error);
            })

        var result = [];
        
        for(var i = 0; i < userList.length; i++){
            for(var j = 0; j < userData.length ; j++){
                // console.log(userList[i].toString(), userData[j]._id.toString());
                if(userList[i].toString() == userData[j]._id.toString()){
                    result.push({
                        userID: userData[j]._id,
                        avatar: userData[j].avatar,
                        name: userData[j].name,
                    })
                }
            }
        }


        res.status(200).send({
            run: true,
            result: result
        })
    
    }

    getCommentInteractionList = async(req, res) => {
        console.log("req.body", req.body);
        var currentArticle;

        await Article.findById(req.body.postID).exec()
            .then((data) => {  
                currentArticle = data;
            })
            .catch((error) => {
                res.status(404).send({run: false, error:error});
            })

        var currentCommentList = currentArticle.comments;
        console.log("currentCommentList", currentCommentList);
        var userIDList;
        // console.log("req.body.parrentComment", req.body.parrentComment)
        if(req.body.parrentComment.length == 0) {
            // console.log("Vô đây rồi");
            for(var i = 0; i < currentCommentList.length; i++){
                if(currentCommentList[i].commentID.toString() == req.body.commentID){
                    // console.log("Tìm thấy rồi");
                    userIDList = currentCommentList[i].reactions;
                }
            }
        }
        else {
            var currentCommentList = currentArticle.comments;

            var temptComment = [{}];
            for(var i = 0; i < currentCommentList.length; i++){
                if(currentCommentList[i].commentID.toString() == req.body.parrentComment[0]){
                    temptComment[0] = currentCommentList[i];
                }
            }

            // console.log("temptComment[0]", temptComment[0]);
        
            for(var i = 1; i < req.body.parrentComment.length; i++){
                // console.log('chạy vào đây rồi', i)
                // console.log("temptComment[i-1]",temptComment[i-1]);
                var isFind = false;
                for(var j = 0; j < temptComment[i-1].replyComment.length; j++){
                    if(temptComment[i-1].replyComment[j].commentID.toString() == req.body.parrentComment[i]){
                        temptComment.push(temptComment[i-1].replyComment[j]);
                        // console.log("tìm ra rồi");
                        isFind = true;
                        break;
                    }
                }
                if(!isFind){
                    console.log("Không tìm thấy trong cái parrent");
                    return res.status(400).send({
                        run: false
                    })
                } 
                    
            }

            for(var j = 0; j < temptComment[temptComment.length-1].replyComment.length; j++){
                if(temptComment[temptComment.length-1].replyComment[j].commentID.toString() == req.body.commentID){
                    temptComment.push(temptComment[temptComment.length-1].replyComment[j]);
                    // console.log("tìm ra rồi");
                    isFind = true;
                    break;
                }
            }

            // console.log("temptComment[temptComment.length-1]", temptComment[temptComment.length-1]);

            userIDList = temptComment[temptComment.length-1].reactions;
        }
        console.log("userIDList", userIDList);

        var userData;
        await User.find().exec()
            .then((data) => {  
                userData = data;
            })
            .catch((error) => {
                return res.status(404).send(error);
            })

        var result = [];
        
        for(var i = 0; i < userIDList.length; i++){
            for(var j = 0; j < userData.length ; j++){
                // console.log(userList[i].toString(), userData[j]._id.toString());
                if(userIDList[i].toString() == userData[j]._id.toString()){
                    result.push({
                        userID: userData[j]._id,
                        avatar: userData[j].avatar,
                        name: userData[j].name,
                    })
                }
            }
        }

        res.status(200).send({
            run: true,
            result: result
        })
    }
}
module.exports = new ArticleController();