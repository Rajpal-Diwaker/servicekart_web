var qb = require('../Utilities/dbConfig').qb;
// =========== Update Socket Status of User  ======= //

let updateSocketAU = (postData, socket_id, callback) => {
    let updateData = {
        "chat_with": postData.r_id,
        "socket_id": socket_id,
        "chat_with_type": postData.chat_with_type
    }
    if (postData.sender_type == 'user') {
        qb.update('m_user', updateData, { 'user_id': postData['s_id'] }, (err, res) => {
            if (err)
                callback(err);
            callback(err, res)

        });
    }
    if (postData.sender_type == 'admin') {
        qb.update('m_admin', updateData, { 'admin_id': postData['s_id'] }, (err, res) => {
            if (err)
                callback(err);
            callback(err, res)

        });
    }
}

// =======Insert Chat Message Data ===== //

let sendChatMessage = async(postData, callback) => {
    var insertData = {};
    var read_status = "";
    let latest_order_id = "";

    latest_order_id = await qb.limit(1).select('id').where('user_id', postData['s_id']).order_by('id', 'DESC').get('m_order');
    let order_id = postData.order_id ? postData.order_id : latest_order_id['0'].id;

    if (postData.sender_type == 'user') {
        senderinfo = await qb.select('name,chat_with,socket_id').where('user_id', postData['s_id']).get('m_user');
        recevierInfo = await qb.select('chat_with').where('admin_id', postData['r_id']).get('m_admin');
    }
    if (postData.sender_type == 'admin') {
        senderinfo = await qb.select('name,chat_with,socket_id').where('admin_id', postData['s_id']).get('m_admin');
        recevierInfo = await qb.select('chat_with').where('user_id', postData['r_id']).get('m_user');
    }

    if (senderinfo && recevierInfo && senderinfo[0]['chat_with'] == postData.r_id && recevierInfo[0]['chat_with'] == postData.s_id) {
        read_status = '';
    } else {
        read_status = postData.r_id;
    }
    insertData = {
        "s_id": postData.s_id,
        "r_id": postData.r_id,
        "msg": postData.msg,
        "url": "",
        "action": "",
        "thumb_url": "",
        "msg_type": postData.msg_type,
        "read_status": read_status,
        "deleted_by": '0',
        "order_id": order_id ? order_id : "0",
        "chat_type": 'normal',
        "date_added": postData.date_added
    }

    qb.returning('id').insert('m_admin_chat', insertData, (err, insertRes) => {

        var result = {
            read_status: read_status,
            insert_id: insertRes.insertId,
            name: senderinfo[0].name
        }
        callback(null, result);
    });
}


// =========Get Receiver Socket Id ===== //

let getRecevierSocketData = (postData, callback) => {
    let sql = '';
    if (postData.sender_type == 'user') {
        sql = `select socket_id,chat_with from m_admin where admin_id=${postData['r_id']}`;
    }
    if (postData.sender_type == 'admin') {
        sql = `select socket_id,chat_with from m_user where user_id=${postData['r_id']}`;
    }
    qb.query(sql, (err, res) => {
        if (err)
            callback(err);
        if (res && res.length > 0)
            callback(null, res[0])
    });
}

// ====== Update Read Status Of Chat List  === //

let updateReadStatus = (postData, callback) => {
    qb.update('m_admin_chat', { 'read_status': '' }, { 's_id': postData['r_id'], 'r_id': postData['s_id'] }, (err, res) => {
        if (err) {
            callback(err);
        }

        callback(err, res)
    });

}


// ======= Chat List of s_id and r_id  ==== //
let getChatList = async(postData, callback) => {
    //console.log(postData)
    let latest_order_id = "";

    latest_order_id = await qb.limit(1).select('id').where('user_id', postData['s_id']).order_by('id', 'DESC').get('m_order');

    let order_id = postData.order_id ? postData.order_id : latest_order_id['0'].id;
    if (order_id) {
        //====================sql3=======================//
        qb.select('a.*,DATE_FORMAT(date_added,"%Y-%m-%d %H:%i:%s") as date_added,!find_in_set(' + postData['s_id'] + ',a.deleted_by) as delete_status', false).where("(((s_id = " + postData['s_id'] + " AND r_id = " + postData['r_id'] + " ) OR (s_id = " + postData['r_id'] + " AND r_id = " + postData['s_id'] + " )) AND order_id = " + order_id + ")").order_by('id', 'ASC').get('m_admin_chat as a', async(err, res) => {
            // console.log("Query Ran: " + qb.last_query());
            //console.log(res);
            var result = {
                chat_msg: res.length,
                data: res
            }

            callback(err, result);
        });

    } else {
        //====================sql3=======================//
        qb.select('a.*,DATE_FORMAT(date_added,"%Y-%m-%d %H:%i:%s") as date_added,!find_in_set(' + postData['s_id'] + ',a.deleted_by) as delete_status', false).where("((s_id = " + postData['s_id'] + " AND r_id = " + postData['r_id'] + " ) OR (s_id = " + postData['r_id'] + " AND r_id = " + postData['s_id'] + " ))").order_by('id', 'ASC').get('m_admin_chat as a', async(err, res) => {
            //console.log("Query Ran: " + qb.last_query());
            var result = {
                chat_msg: res.length,
                data: res
            }

            callback(err, result);
        });
    }

}



// ===================== Disconnect User  ====================== //

let disconnectUser = (socket_id, callback) => {
    let updateData = {
        "chat_with": 0,
        "socket_id": ""
    }
    qb.where('socket_id', socket_id).update('m_admin_chat', updateData, (err, res) => {
        if (err) {
            callback(err);
        }
        callback(res);

    });

}


// ===================== Conversation List  ====================== //

let conversationList = (postData, callback) => {
    let sql1 = `SELECT c.id,c.s_id,c.r_id,c.msg,c.date_added,c.read_status,u.user_id,u.name as user_name,u.user_image,(SELECT COUNT(read_status) FROM m_admin_chat where ((s_id=c.s_id and r_id=c.r_id) or (s_id=c.r_id and r_id=c.s_id)) and read_status=${postData['user_id']}) as unread_cn FROM m_admin_chat as c LEFT JOIN m_user as u ON ( CASE WHEN c.s_id = ${postData['user_id']} THEN c.r_id = u.user_id ELSE c.s_id= u.user_id END) WHERE _id=${postData['user_id']} THEN if(s_id =${postData['user_id']},r_id,s_id) ELSE s_id END) and delete_for_everyone='0'c.id IN(SELECT MAX(id) FROM m_admin_chat WHERE s_id = ${postData['user_id']} OR r_id = ${postData['user_id']} and !find_in_set('${postData['user_id']}',m_admin_chat.deleted_by) GROUP BY CASE WHEN s ORDER BY c.id DESC`;
    qb.query(sql1, (err1, res1) => {
        if (err1) {
            callback(err1);
        }
        var result = {
            // chat_msg: res1.length,
            data: res1
        }

        console.log(result);
        callback(err1, result);
    });
}






//============delete msg================//
let deletemsg = async(postData, callback) => {
    var msg_array = [];
    var msg_array = postData.msg_id.split(',');
    var msglength = msg_array.length;
    var deleteId = [];
    for (let i = 0; i < msglength; i++) {
        var res = await qb.select('deleted_by').where({ 'id': msg_array[i] }).get('bgpkr_chat');
        if (res && res.length > 0) {
            if (res[0]['deleted_by'] == '') {
                deleteId.push(postData.s_id)
            } else {
                deleteId = res[0]['deleted_by'].split(',');
                deleteId.push(postData.s_id);
            }
            let ids = deleteId.toString();
            await qb.set('deleted_by', ids).where('id', msg_array[i]).update('bgpkr_chat');
            // console.log("Query Ran: " + qb.last_query());
            deleteId = [];
        }
    }
    callback(null, "1");
}


//============delete for everyone  msg================//
let deletefor_everyone = async(postData, callback) => {
    var msg_array = [];
    var new_array = [];
    var msg_array = postData.msg_id.split(',');
    var msglength = msg_array.length;
    for (let i = 0; i < msglength; i++) {
        new_array.push(parseInt(msg_array[i]));
        await qb.where('id', msg_array[i]).delete('bgpkr_chat');
        // console.log("DELETE Query Ran: " + qb.last_query());
    }
    callback(null, new_array);
}

module.exports = {
    updateSocketAU,
    sendChatMessage,
    getRecevierSocketData,
    updateReadStatus,
    getChatList,
    disconnectUser,
    conversationList,
    deletemsg,
    deletefor_everyone
}