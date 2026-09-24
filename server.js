const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Location where uploaded images will be stored
const uploadFolder = path.join(__dirname, "uploads");

// Make sure uploads folder exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Configure where uploaded files go
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);

        const filename =
            Date.now() + extension;

        cb(null, filename);
    }
});

const upload = multer({
    storage: storage
});

// Serve the website
app.use(express.static(path.join(__dirname, "public")));

// Make uploaded images accessible
app.use("/uploads", express.static(uploadFolder));


// ==============================
// GET ALL IMAGES
// ==============================

app.get("/api/images", (req, res) => {

    fs.readdir(uploadFolder, (err, files) => {

        if (err) {
            return res.status(500).json({
                error: "Could not read images"
            });
        }

        const images = files.map(file => ({
            name: file,
            url: `/uploads/${file}`
        }));

        res.json(images);
    });

});


// ==============================
// UPLOAD IMAGE
// ==============================

app.post(
    "/api/upload",
    upload.single("image"),
    (req, res) => {

        if (!req.file) {
            return res.status(400).json({
                error: "No image selected"
            });
        }

        res.json({
            success: true,
            image: {
                name: req.file.filename,
                url: `/uploads/${req.file.filename}`
            }
        });

    }
);


// ==============================
// DELETE IMAGE
// ==============================

app.delete("/api/images/:filename", (req, res) => {

    const filename = path.basename(req.params.filename);

    const filePath =
        path.join(uploadFolder, filename);

    if (!fs.existsSync(filePath)) {

        return res.status(404).json({
            error: "Image not found"
        });

    }

    fs.unlink(filePath, (err) => {

        if (err) {

            return res.status(500).json({
                error: "Could not delete image"
            });

        }

        res.json({
            success: true
        });

    });

});


// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});