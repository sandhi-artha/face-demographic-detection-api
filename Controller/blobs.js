const handleBlobs = (req, res, db) => {
    const blobsToInsert = req.files.map(blob => {
        return {predid: Number(blob.originalname), bloburl: blob.path}
    })
    db('faceblobs').insert(blobsToInsert).then(() => res.json("blobs stored"))
}

module.exports = {handleBlobs}