'use strict';

exports.find = (req, res, pool, checkLog) => {
    let searchTerm = req.body.search;
    console.log(searchTerm)

    pool.getConnection((err, connection) => {
        if (err) throw err;

        connection.query(`SELECT * from BELONG 
        JOIN document on bDocumentID = documentID
        JOIN CATEGORY on categoryID = bCategoryID
        where name LIKE ? OR authNames LIKE ? OR topic LIKE ?`, ['%' + searchTerm + '%', '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, result) => {
            if (!err) {
                if (!result[0]) {
                    if (checkLog) {
                        res.status(200).render('searchResults', { noResults: true, logged: true, })
                    }
                    else {
                        res.status(200).render('searchResults', { noResults: true })
                    }
                }
                else {
                    let authors;
                    result.forEach((element1) => {
                        element1.authArr = new Array();
                        authors = element1.authNames.split(',');
                        console.log(element1.authNames);
                        authors.forEach((element2) => {
                            element1.authArr.push(element2)
                        })
                    })
                    if (checkLog) {
                        res.status(200).render('searchResults', { result, logged: true, })
                    }
                    else {
                        res.status(200).render('searchResults', { result })
                    }
                }
            }
            else {
                console.log(err);
            }
        })
    });
}

exports.downloadDoc = (req, res, pool) => {
    let documentId = req.url.substring(req.url.lastIndexOf('/') + 1)
    pool.getConnection((err, connection) => {
        if (err) throw err;//Check if connection is done properly
        connection.query(`select * from document where documentID =  ${documentId}`, (err, result) => {
            //release the connection once done
            connection.release();
            if (!err) {
                res.download(`./public/UserProfile/uploads/${result[0].file}`, result[0].file, (err) => { });
            } else {
                console.log(err)
            }
        });
    });
}


exports.displayDoc = (req, res, pool, checkLog) => {
    let documentId = req.url.substring(req.url.lastIndexOf('/') + 1)
    pool.getConnection((err, connection) => {
        if (err) throw err;//Check if connection is done properly
        connection.query(`SELECT * FROM BELONG 
        JOIN DOCUMENT ON bDocumentID=documentID
        JOIN CATEGORY ON bCategoryID=categoryID  where documentID =  ${documentId}`, (err, result) => {
            // let reqPath = path.join(__dirname,'../')
            // reqPath = reqPath + 'public/UserProfile/uploads'

            // reqPath = reqPath + `/${docFile}`
            //release the connection once done
            connection.release();
            let authors = result[0].authNames.split(',');
            if (!err) {
                if (checkLog) {
                    res.render('displayPaper', { layout: 'layout.hbs', result, logged: true, authors })
                }
                else {
                    res.render('displayPaper', { layout: 'layout.hbs', result, authors })
                }
            } else {
                console.log(err)
            }
        });
    });
}

exports.saveDoc = (req, res, pool) => {
    const documentId = req.url.substring(req.url.lastIndexOf('/') + 1)
    const token = req.user;
    pool.getConnection((err, connection) => {
        if (err) throw err;//Check if connection is done properly
        connection.query(`INSERT INTO SAVES VALUES (${token.id}, ${parseInt(documentId)})`, (err, result) => {

            connection.release();
            if (!err) {
                res.send('Document saved successfully')

            } else {
                console.log('Already saved document')
                res.send('Already saved document')
            }
        });
    });
}

exports.searchByCategory = (req, res, pool, checkLog) => {
    let categoryId = req.url.substring(req.url.lastIndexOf('/') + 1)
    pool.getConnection((err, connection) => {
        if (err) throw err;//Check if connection is done properly
        connection.query(`SELECT * from BELONG 
        JOIN document on bDocumentID = documentID
        JOIN CATEGORY on categoryID = bCategoryID
        where categoryID =  ${categoryId}`, (err, result) => {
            connection.release();
            if (!err) {
                if (!result[0]) {
                    if (checkLog) {
                        res.status(200).render('searchResults', { noResults: true, logged: true, })
                    }
                    else {
                        res.status(200).render('searchResults', { noResults: true })
                    }
                }
                else {
                    let authors;
                    result.forEach((element1) => {
                        element1.authArr = new Array();
                        authors = element1.authNames.split(',');
                        console.log(element1.authNames);
                        authors.forEach((element2) => {
                            element1.authArr.push(element2)
                        })
                    })
                    console.log(result[0].authArr)
                    if (checkLog) {
                        res.status(200).render('searchResults', { result, logged: true, })
                    }
                    else {
                        res.status(200).render('searchResults', { result })
                    }
                }
            } else {
                console.log(err)
            }
        });
    });

}